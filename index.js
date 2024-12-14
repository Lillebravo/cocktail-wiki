import { showRandomDrink, showDrinkSearchResult} from "./utilities.js";

// Declarations
const rngDrinkBtn = document.querySelector("#randomDrinkBtn");
const searchBtn = document.querySelector("#searchBtn");
export const searchBar = document.querySelector("#searchBar");

// Event listeners
document.addEventListener("DOMContentLoaded", () => {
  showRandomDrink();
});
rngDrinkBtn.addEventListener("mouseover", () => {
  rngDrinkBtn.classList.add("rotate-center");
});
rngDrinkBtn.addEventListener("mouseout", () => {
  rngDrinkBtn.classList.remove("rotate-center");
});
rngDrinkBtn.addEventListener("click", () => {
  showRandomDrink();
});
searchBtn.addEventListener("click", () => {
  showDrinkSearchResult();
});
