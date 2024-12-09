// Declarations
const baseURL = `https://www.thecocktaildb.com/api/json/v1/1/`;

// Functions
function mapRawCocktailData(rawCocktail) {
  /* Removes ingredients and measures which are null and some attributes which aren´t used */
  return {
    id: rawCocktail.idDrink,
    name: rawCocktail.strDrink,
    tags: rawCocktail.strTags ? rawCocktail.strTags.split(",") : [],
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
    const formattedDrink = mapRawCocktailData(rawCocktial);

    return formattedDrink;
  } catch (error) {
    console.log(`Error fetching random drink from API: ${error}`);
  }
}

function createDrinkElement(drink) {
  // Create a container for drink details
  const drinkDetailsDiv = document.createElement("div");

  // Create and assign drink detail elements
  const name = document.createElement("h2");
  name.textContent = drink.name;
  name.classList.add("orange");

  const thumbnail = document.createElement("img");
  thumbnail.src = drink.thumbnail;
  thumbnail.alt = drink.name;

  const category = document.createElement("p");
  category.textContent = `Category: ${drink.category}`;

  const alcoholContent = document.createElement("p");
  alcoholContent.textContent = drink.alcoholic ? "Alcoholic" : "Non-Alcoholic";

  const servingContainer = document.createElement("p");
  servingContainer.textContent = `Served in: ${drink.glass}`;

  const ingredientsElement = document.createElement("div");
  ingredientsElement.innerHTML = "<h3>Ingredients:</h3>";
  const ingredientsList = document.createElement("ul");
  drink.ingredients.forEach((item) => {
    const ingredient = document.createElement("li");
    ingredient.textContent = `${item.measure || ""} ${item.ingredient}`.trim();
    ingredientsList.appendChild(ingredient);
  });
  ingredientsElement.appendChild(ingredientsList);

  const instructionsElement = document.createElement("div");
  instructionsElement.innerHTML = "<h3>Instructions:</h3>";
  const instructionsText = document.createElement("p");
  instructionsText.textContent = drink.instructions;
  instructionsElement.appendChild(instructionsText);

  // Add all drink details to the container
  drinkDetailsDiv.append(
    name,
    thumbnail,
    category,
    alcoholContent,
    servingContainer,
    ingredientsElement,
    instructionsElement
  );

  return drinkDetailsDiv;
}

export async function showRandomDrink() {
  try {
    const drinkDetailsDiv = document.querySelector(".drinkDetails");
    drinkDetailsDiv.innerHTML = "";

    const randomDrink = await getRandomDrink();
    const drinkElement = createDrinkElement(randomDrink);

    drinkDetailsDiv.style.display = "block";
    drinkDetailsDiv.appendChild(drinkElement);
  } catch (error) {
    console.log(`Error showing random drink: ${error}`);
  }
}
