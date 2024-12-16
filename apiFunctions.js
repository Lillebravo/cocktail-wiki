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
    }
  
    try {
      let res;
      if (searchValue === null || searchParameter === "random") {
        res = await fetch(`${baseURL}${searchUrl}`);
      } else if (searchParameter === "glassType" && !searchValue.includes("glass")) { // adds glass if user only searches for example beer
        res = await fetch(`${baseURL}${searchUrl}${searchValue}_glass`);
      }
       else {
        res = await fetch(`${baseURL}${searchUrl}${searchValue}`);
      }
      const data = await res.json();
  
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