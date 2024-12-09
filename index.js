import { showRandomDrink } from "./utilities.js";

// Declarations
const rngDrinkBtn = document.querySelector("#randomDrinkBtn");

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
