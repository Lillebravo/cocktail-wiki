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
  drinkElement.dataset.drinkId = drink.id; // for identifying the drinks
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

  getDrinksFromAPI("id", drinkElement.dataset.drinkId).then((drinks) => {
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
  <button id="addFavBtn" class="material-symbols-outlined">heart_plus</button>
  <button id="removeFavBtn" class="material-symbols-outlined">heart_minus</button>
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
  const addFavBtn = document.querySelector("#addFavBtn");
  const removeFavBtn = document.querySelector("#removeFavBtn");

  displayFavButtons(drink, addFavBtn, removeFavBtn);

  // Functionality for back button
  backBtn.addEventListener("click", () => {
    if (lastAction === showDrinkSearchResult) {
      showDrinkSearchResult();
    } else if (lastAction === displayFavDrinks) {
      displayFavDrinks();
    } else {
      drinkDetailsDiv.innerHTML = pageBefore; // reload last page if last action was random
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
    displayFavButtons(drink, addFavBtn, removeFavBtn);
  });

  removeFavBtn.addEventListener("click", () => {
    removeFavs(drink);
    displayFavButtons(drink, addFavBtn, removeFavBtn);

    // If working on your favorites, removing one sends you back to your fav page for smoother experience
    if (lastAction === displayFavDrinks) { 
      displayFavDrinks();
    }
  })
}

export async function showRandomDrink() {
  lastAction = null; // Reset last action so back button works like it should
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
    lastAction = showDrinkSearchResult; // for back button functionality
    const searchText = searchBar.value.trim(); // Check if search input is valid

    // Resets the page number if new search text differs from last one
    if (previousSearchText !== searchText) {
      pageNr = 1;
    }

    // Sets previous text to current search text after checking if they differ
    previousSearchText = searchText;

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

// #region saveFunctions
export async function displayFavDrinks() {
  lastAction = displayFavDrinks;
  drinkDetailsDiv.innerHTML = `<h1 id="headerText">Saved Drinks:</h1>`;
  let savedDrinks = [];

  try {
    for (let i = 0; i < localStorage.length; i++) {
      const drinkId = localStorage.key(i);
      const drink = await getDrinksFromAPI("id", drinkId);
      if (drink.length !== 0) { // If drink exists
        savedDrinks.push(drink[0]);
      }

      // Insert saved results into DOM
      searchResults = savedDrinks;
      displayPageOfResults(1);

      drinkDetailsDiv.appendChild(searchResultDiv);
      drinkDetailsDiv.appendChild(pageBtnsDiv);
    }
  } catch (error) {
    console.log(`There was an error fetching saved drinks: ${error}`)
  }

  if (savedDrinks.length === 0) {
    drinkDetailsDiv.innerHTML += `<h3 style="color: white">You have no saved drinks!</h3>`;
  }
}

function saveFavs(drink) {
  if (!isFavourite(drink)) {
    localStorage.setItem(drink.id, drink);
  }
}

function removeFavs(drink) {
  if(isFavourite(drink)) {
    localStorage.removeItem(drink.id);
  }
}

function isFavourite(drink) {
  if (localStorage.getItem(drink.id)) {
    return true;
  }
  return false;
}

function displayFavButtons(drink, addBtn, removeBtn) {
  if (isFavourite(drink)) {
    removeBtn.style.display = "block";
    addBtn.style.display = "none";
  } else {
    removeBtn.style.display = "none";
    addBtn.style.display = "block";
  }
}
// #endregion