import { showRandomDrink, showDrinkSearchResult, displayFavDrinks} from "./utilities.js";

// Declarations
export const searchBar = document.querySelector("#searchBar");
const searchBtn = document.querySelector("#searchBtn");
const favBtn = document.querySelector("#favBtn");
const rngDrinkBtn = document.querySelector("#randomDrinkBtn");
const form = document.querySelector("form");
searchBtn.disabled = true;

// Event listeners
favBtn.addEventListener("click", () => {
  displayFavDrinks();
});
document.addEventListener("DOMContentLoaded", () => {
  showRandomDrink();
});
rngDrinkBtn.addEventListener("click", () => {;
  showRandomDrink();
});
rngDrinkBtn.addEventListener("mouseover", () => {
  rngDrinkBtn.classList.add("rotate-center"); // adding animations class on hover
});
rngDrinkBtn.addEventListener("mouseout", () => {
  rngDrinkBtn.classList.remove("rotate-center"); // removing animations
});
form.addEventListener("submit", (event) => {
  event.preventDefault();
  showDrinkSearchResult();
});
searchBar.addEventListener("input", () => {
  if (searchBar.value.trim() === "") {
    searchBtn.disabled = true;
  } else {
    searchBtn.disabled = false;
  }
});