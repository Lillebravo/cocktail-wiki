import { searchBar } from "./index.js";
import { getDrinksFromAPI } from "./apiFunctions.js";

// things to add:
// Favourite page

// **Declarations**
const drinkDetailsDiv = document.querySelector(".drinkDetailsContainer");
const searchResultDiv = document.createElement("div");
searchResultDiv.classList.add("searchDisplay");
const searchParameters = document.querySelector("#searchParameters");
const pageBtnsDiv = document.createElement("div");
pageBtnsDiv.classList.add("pagination");
pageBtnsDiv.id = "paginationContainer";
const nrOfDrinksPerPage = 10;
let searchResults;
let pageNr = 1;
let lastAction = null;
let previousSearchText = "";

// **Functions**

// #region Element handling functions
function createDrinkElement(drink) {
  const drinkElement = document.createElement("section");
  drinkElement.classList.add("drink");
  drinkElement.innerHTML = `
    <h2>${drink.name}</h2>
    <img src="${drink.thumbnail}" alt="${drink.name}"></img>
  `;

  drinkElement.addEventListener("click", drinkHandleOnClick);

  return drinkElement;
}

function drinkHandleOnClick(event) {
  const drinkElement = event.currentTarget;
  const drinkName = drinkElement.querySelector("h2").textContent;

  getDrinksFromAPI(searchParameters.value, drinkName).then((drinks) => {
    if (drinks && drinks.length > 0) {
      // Looping through all drinks and compare their names with closest drinkname from target to get an exact match
      for (let i = 0; i < drinks.length; i++) {
        const drink = drinks[i];
        if (drink.name === drinkName) {
          showDrinkDetails(drinks[i]);
        }
      }
    }
  });
}

function handlePageBtnClick(event) {
  // Find clicked page button
  const pageBtn = event.target.closest(".pageNumber");
  if (pageBtn) {
    // Find page number and display results for that page
    const currentPageNr = parseInt(pageBtn.dataset.page);
    pageNr = currentPageNr;
    displayPageOfResults(currentPageNr);
  }
}

function createPaginationNrs(currentPage) {
  pageBtnsDiv.innerHTML = "";

  // Calculate nr of pages and only create pagination if there is more than 10 search results
  const nrOfPages = Math.ceil(searchResults.length / nrOfDrinksPerPage);
  if (nrOfPages > 1) {
    // Create a number button for every page
    for (let i = 1; i <= nrOfPages; i++) {
      const pageNrButton = document.createElement("button");
      pageNrButton.innerHTML = i;
      pageNrButton.dataset.page = i; // Add data to id the buttons for event handling
      pageNrButton.classList.add("pageNumber");

      // Highlight current page
      if (i === currentPage) {
        pageNrButton.classList.add("active");
      }

      pageBtnsDiv.appendChild(pageNrButton);
    }

    pageBtnsDiv.addEventListener("click", handlePageBtnClick);
  }
}
// #endregion

// #region Display functions
function showDrinkDetails(drink) {
  // Save the HTML from the previous page
  const pageBefore = drinkDetailsDiv.innerHTML;

  // #region Create drink detail elements
  const detailsPage = /*HTML*/ `
  <section class="drinkDetails">
  <button id="backBtn">Back</button>
  <icon id="favIcon" class="material-symbols-outlined">Favorite</icon>
  <button id="addFavBtn" class="material-symbols-outlined">heart_plus</button>
  <h2>${drink.name}</h2>
    <img src="${drink.thumbnail}" alt="${drink.name}">
    <div class="drinkInfo">
    <p>Category: ${drink.category}</p>
    <p>${drink.alcoholic ? "Alcoholic" : "Non-Alcoholic"}</p>
    <p>Served in: ${drink.glass}</p>
    <p>Tags: ${drink.tags}</p>
    
    <h3>Ingredients:</h3>
    <ul>
      ${drink.ingredients
        .map((item) => `<li>${item.measure || ""} ${item.ingredient}`.trim())
        .join("")}
    </ul>
    
    <h3>Instructions:</h3>
    <p>${drink.instructions}</p>
    </div>
  </section>
  `;
  // #endregion

  // Insert created elements to DOM
  drinkDetailsDiv.innerHTML = detailsPage;
  const backBtn = document.querySelector("#backBtn");
  const favIcon = document.querySelector("#favIcon");
  const addFavBtn = document.querySelector("#addFavBtn");

  if (isFavourite(drink)) {
    favIcon.style.display = "block";
    addFavBtn.style.display = "none";
  } else {
    favIcon.style.display = "none";
    addFavBtn.style.display = "block";
  }

  // Functionality for back button
  backBtn.addEventListener("click", () => {
    if (lastAction) {
      showDrinkSearchResult();
    } else {
      drinkDetailsDiv.innerHTML = pageBefore; // reload last page
    }

    // removing and adding eventlisteners to all drinks in last page to ensure there are no duplicates
    const drinksBefore = document.querySelectorAll(".drink");
    drinksBefore.forEach((drinkBefore) => {
      drinkBefore.removeEventListener("click", drinkHandleOnClick);
      drinkBefore.addEventListener("click", drinkHandleOnClick);
    });
  });

  addFavBtn.addEventListener("click", () => {
      saveFavs(drink);
  });
}

export async function showRandomDrink() {
  try {
    searchBar.value = "";

    const randomDrink = await getDrinksFromAPI("random");
    const drink = createDrinkElement(randomDrink[0]);

    // Clearing current page and adding relevant info
    drinkDetailsDiv.innerHTML = `<h1 id="headerText">Welcome to Cocktail Wiki!</h1>
    <h3 id="inspoText" style="color: white;">Have a look at this drink for inspiration:</h3>
    `;
    drinkDetailsDiv.appendChild(drink);
  } catch (error) {
    console.log(`Error showing random drink: ${error}`);
  }
}

export async function showDrinkSearchResult() {
  try {
    lastAction = showDrinkSearchResult;
    // Check if search input is valid
    const searchText = searchBar.value.trim();

    if (previousSearchText !== searchText) {
      pageNr = 1;
    }

    previousSearchText = searchText;
    
    if (searchText === "") {
      alert("You didn´t write anything!");
      return;
    }

    // Clear screen and add info
    drinkDetailsDiv.innerHTML = `<h1 id="headerText">Search Results:</h1>`;

    // get drinks from search
    searchResults = await getDrinksFromAPI(searchParameters.value, searchText);
    if (!searchResults || searchResults.length === 0) {
      drinkDetailsDiv.innerHTML += `
      <h3 style="color: white">No cocktails matching search for ${searchText}</h3>
      `;
      return;
    }

    // Show results from page 1 at first
    displayPageOfResults(pageNr);

    // Insert display with results and page number buttons to the page
    drinkDetailsDiv.appendChild(searchResultDiv);
    drinkDetailsDiv.appendChild(pageBtnsDiv);
  } catch (error) {
    console.log(`Error showing drinks from API: ${error}`);
  }
}

function displayPageOfResults(pageNr) {
  searchResultDiv.innerHTML = "";

  // Determine start and end index for current page
  const startIndex = (pageNr - 1) * nrOfDrinksPerPage;
  const endIndex = startIndex + nrOfDrinksPerPage;

  // take results for current page
  const pageResults = searchResults.slice(startIndex, endIndex);

  // create and add drink elements for this page
  pageResults.forEach((drink) => {
    const newDrink = createDrinkElement(drink);
    searchResultDiv.appendChild(newDrink);
  });

  // Update page numbers
  createPaginationNrs(pageNr);
}
// #endregion

export function displayFavDrinks () {

}

function saveFavs(drink) {
  if (!isFavourite(drink)) {
    localStorage.setItem(drink.id, drink);
    console.log(localStorage);
  } 
}

function isFavourite(drink) {
  if (localStorage.getItem(drink.id)) {
    return true;
  }
  return false;
}