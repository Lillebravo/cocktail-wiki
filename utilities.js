import { searchBar } from "./index.js";

// Declarations
const baseURL = `https://www.thecocktaildb.com/api/json/v1/1/`;
const drinkDetailsDiv = document.querySelector(".drinkDetailsContainer");

// Functions
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

async function getDrinksByName(drinkName) {
  try {
    const res = await fetch(`${baseURL}search.php?s=${drinkName}`);
    const data = await res.json();

    // Create array of drinks and convert them to readable values
    const rawCocktails = data.drinks;
    const drinks = [];
    for (let i = 0; i < rawCocktails.length; i++) {
      const drink = mapRawCocktailData(rawCocktails[i]);
      drinks.push(drink);
    }

    console.log(drinks); // Only for debugging purposes
    return drinks;
  } catch (error) {
    console.log(
      `Error searching for drink by name ${drinkName} from API: ${error}`
    );
  }
}

function createDrinkElement(drink) {
  const drinkElement = document.createElement("section");
  drinkElement.classList.add("drink");
  drinkElement.innerHTML = `
    <h2>${drink.name}</h2>
    <button id="drinkDetailsBtn">See more</button>
    <img src="${drink.thumbnail}" alt="${drink.name}">
  </section>
  `;

  // Insert drink element to DOM
  drinkDetailsDiv.innerHTML = "";
  drinkDetailsDiv.appendChild(drinkElement);

  // Add event listener after the button has been inserted to DOM
  const drinkDetailsBtn = document.querySelector("#drinkDetailsBtn");
  drinkDetailsBtn.addEventListener("click", () => {
    const drinkDetailsDiv = document.querySelector(".drink");
    drinkDetailsDiv.innerHTML = ""; // Removes existing styling
    showDrinkDetails(drink);
  });
}

function showDrinkDetails(drink) {
  const detailsPage = /*HTML*/ `
  <section class="drinkDetails">
  <h2>${drink.name}</h2>
    <img src="${drink.thumbnail}" alt="${drink.name}">
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
  </section>
  `;

  drinkDetailsDiv.innerHTML = detailsPage;
}

export async function showRandomDrink() {
  try {
    const randomDrink = await getRandomDrink();
    createDrinkElement(randomDrink);
  } catch (error) {
    console.log(`Error showing random drink: ${error}`);
  }
}

export async function showDrinkSearchResult() {
  try {
    const searchText = searchBar.value;
    const searchResults = await getDrinksByName(searchText);

    for (let i = 0; i < searchResults.length; i++) {
      const drink = searchResults[i];
      createDrinkElement(drink);
    }
  } catch (error) {
    console.log(`Error showing drinks from API: ${error}`);
  }
}
