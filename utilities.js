import { searchBar } from "./index.js";

// **Declarations**
const baseURL = `https://www.thecocktaildb.com/api/json/v1/1/`;
const drinkDetailsDiv = document.querySelector(".drinkDetailsContainer");

// **Functions**
// #region Helper function
function mapRawCocktailData(rawCocktail) {
  /* Removes ingredients and measures which are null and some attributes which aren´t used */
  return {
    id: rawCocktail.idDrink,
    name: rawCocktail.strDrink,
    tags: rawCocktail.strTags ? rawCocktail.strTags.split(", ") : "None",
    category: rawCocktail.strCategory,
    alcoholic: rawCocktail.strAlcoholic === "Alcoholic",
    glass: rawCocktail.strGlass,
    instructions: rawCocktail.strInstructions,
    thumbnail: rawCocktail.strDrinkThumb,
    ingredients: Array.from({ length: 15 })
      .map((_, i) => ({
        ingredient: rawCocktail[`strIngredient${i + 1}`],
        measure: rawCocktail[`strMeasure${i + 1}`],
      }))
      .filter((item) => item.ingredient),
  };
}
// #endregion

// #region Functions for getting data from API
async function getRandomDrink() {
  try {
    const res = await fetch(`${baseURL}random.php`);
    const data = await res.json();

    // The API returns an array with one drink, here the first(and only) drink in the array is collected
    const rawCocktial = data.drinks[0];
    const randomDrink = mapRawCocktailData(rawCocktial);

    return randomDrink;
  } catch (error) {
    console.log(`Error fetching random drink from API: ${error}`);
  }
}

async function getDrinksByNameOrId(drink, name = true) {
  try {
    let res;
    let data;
    if (name) {
      // default to search on name, else search on id
      res = await fetch(`${baseURL}search.php?s=${drink}`);
      data = await res.json();
    } else {
      res = await fetch(`${baseURL}lookup.php?i=${drink}`);
      data = await res.json();
    }

    // Create array of drinks and convert them to readable values
    const rawCocktails = data.drinks;
    const drinks = [];

    // if data.drinks returns an empty array drinks will remain empty as well and return as such
    if (rawCocktails.length > 0) {
      for (let i = 0; i < rawCocktails.length; i++) {
        const drink = mapRawCocktailData(rawCocktails[i]);
        drinks.push(drink);
      }
    }

    return drinks;
  } catch (error) {
    console.log(
      `Error searching for drink by name ${drink} from API: ${error}`
    );
  }
}
// #endregion

// #region Element handling functions
function createDrinkElement(drink) {
  const drinkElement = document.createElement("section");
  drinkElement.classList.add("drink");
  drinkElement.innerHTML = `
    <h2>${drink.name}</h2>
    <button id="drinkDetailsBtn">See more</button>
    <img src="${drink.thumbnail}" alt="${drink.name}"></img>
  `;

  drinkElement.addEventListener("click", drinkHandleOnClick);

  return drinkElement;
}

function drinkHandleOnClick(event) {
  const drinkElement = event.currentTarget;
  const drinkName = drinkElement.querySelector("h2").textContent;

  getDrinksByNameOrId(drinkName).then((drinks) => {
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
// #endregion

// #region Display functions
function showDrinkDetails(drink) {
  // Save the HTML from the previous page
  const pageBefore = drinkDetailsDiv.innerHTML;
  searchBar.value = "";

  // Create drink detail elements
  const detailsPage = /*HTML*/ `
  <section class="drinkDetails">
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
  const backBtn = document.createElement("button");
  backBtn.innerHTML = "Back";

  // Insert created elements to DOM
  drinkDetailsDiv.innerHTML = detailsPage;
  const drinkNameHTML = drinkDetailsDiv.querySelector("h2");
  drinkNameHTML.parentNode.insertBefore(backBtn, drinkNameHTML.nextSibling);

  // Functionality for back button
  backBtn.addEventListener("click", () => {
    drinkDetailsDiv.innerHTML = pageBefore; // reload last page
    const drinksBefore = document.querySelectorAll(".drink");

    // removing and adding eventlisteners to all drinks in last page to ensure there are no duplicates
    drinksBefore.forEach((drinkBefore) => {
      drinkBefore.removeEventListener("click", drinkHandleOnClick);
      drinkBefore.addEventListener("click", drinkHandleOnClick);
    });
  });
}

export async function showRandomDrink() {
  try {
    searchBar.value = "";

    const randomDrink = await getRandomDrink();
    const drink = createDrinkElement(randomDrink);

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
    const searchText = searchBar.value.trim();
    if (searchText === "") {
      alert("You have to enter a cocktail name!");
      return;
    }

    // Clear screen and add info
    drinkDetailsDiv.innerHTML = `<h1 id="headerText">Search Results:</h1>`;

    const searchResults = await getDrinksByNameOrId(searchText);
    if (!searchResults || searchResults.length === 0) {
      drinkDetailsDiv.innerHTML += `
      <h3 style="color: white">No cocktails matching search for ${searchText}</h3>
      `;
      return;
    }

    // Create container for displaying results
    const searchResultDiv = document.createElement("div");
    searchResultDiv.classList.add("searchDisplay");

    // Take top 10 search results and add them to display
    const resultsDisplay = searchResults.slice(0, 10);
    resultsDisplay.forEach((drink) => {
      const newDrink = createDrinkElement(drink);
      searchResultDiv.appendChild(newDrink);
    });

    // Insert display into DOM
    drinkDetailsDiv.appendChild(searchResultDiv);
  } catch (error) {
    console.log(`Error showing drinks from API: ${error}`);
  }
}
// #endregion
