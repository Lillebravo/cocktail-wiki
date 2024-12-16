const baseURL = `https://www.thecocktaildb.com/api/json/v1/1/`;

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

export async function getDrinksFromAPI(searchParameter, searchValue = null) {
  const retryParams = ["_glass", "_flute", "_mug", "_drink"];
  let searchUrl = "";

  if (searchParameter === "random") {
    searchUrl = "random.php";
  } else if (searchParameter === "name") {
    searchUrl = "search.php?s=";
  } else if (searchParameter === "category") {
    searchUrl = "filter.php?c=";
  } else if (searchParameter === "ingredient") {
    searchUrl = "filter.php?i=";
  } else if (searchParameter === "glassType") {
    searchUrl = "filter.php?g=";
  } else if (searchParameter === "id") {
    searchUrl = "lookup.php?i=";
  }

  try {
    let res;
    let data;
    if (searchValue === null || searchParameter === "random") {
      res = await fetch(`${baseURL}${searchUrl}`);
      data = await res.json();
    } else {
      res = await fetch(`${baseURL}${searchUrl}${searchValue}`);
      data = await res.json();

      // Trying other parameters if no data was found
      if (data.drinks === "no data found") {
        for (const param of retryParams) {
          res = await fetch(`${baseURL}${searchUrl}${searchValue}${param}`);
          data = await res.json();

          if (data.drinks !== "no data found") break;
        }
      }
    } 

    // return an empty array if there were no drinks fetched
    if (!data.drinks) {
      return [];
    }

    // Create array of drinks and convert them to readable values
    const rawCocktails = data.drinks;
    const drinks = [];

    // if data.drinks returns an empty array drinks will remain empty as well and return as such
    if (rawCocktails.length > 0) {
      for (let i = 0; i < rawCocktails.length; i++) {
        const drink = mapRawCocktailData(rawCocktails[i]);
        if (drink.name === undefined) return []; // removes undefined results
        drinks.push(drink);
      }
    }

    return drinks;
  } catch (error) {
    console.log(
      `Error searching for drinks by ${searchParameter} = ${searchValue} from API: ${error}`
    );
    return [];
  }
}
