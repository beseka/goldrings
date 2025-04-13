// script.js
const carousel = document.getElementById("product-carousel");
const leftArrow = document.querySelector(".arrow.left");
const rightArrow = document.querySelector(".arrow.right");
const sortSelect = document.getElementById("sort-select");
const minPriceInput = document.getElementById("min-price");
const maxPriceInput = document.getElementById("max-price");
const priceFilterBtn = document.getElementById("price-filter-btn");

let originalProducts = [];
let filteredProducts = [];

async function fetchProducts() {
  const response = await fetch("http://localhost:5001/products/with-price");
  const data = await response.json();
  originalProducts = data;
  filteredProducts = [...originalProducts];
  displayProducts();
}

function displayProducts() {
  const errorMessage = document.getElementById("error-message");
  errorMessage.style.display = "none";
  if (filteredProducts.length === 0) {
    errorMessage.style.display = "block";
  }
  carousel.innerHTML = "";
  filteredProducts.forEach((product) => {
    const productCard = document.createElement("div");
    productCard.className = "product-card";

    const img = document.createElement("img");
    img.src = product.images.yellow;
    img.className = "product-image";

    const title = document.createElement("p");
    title.textContent = product.name;
    title.className = "product-title";

    const price = document.createElement("p");
    price.textContent = `$${product.price.toFixed(2)} USD`;
    price.className = "product-price";

    const colorPicker = document.createElement("div");
    colorPicker.className = "color-picker";
    ["yellow", "white", "rose"].forEach((color) => {
      const circle = document.createElement("span");
      circle.className = `color-circle ${color}`;
      circle.onclick = () => (img.src = product.images[color]);
      colorPicker.appendChild(circle);
    });

    const colorLabel = document.createElement("p");
    colorLabel.textContent = "Yellow Gold";
    colorLabel.className = "color-label";

    const rating = document.createElement("p");
    rating.className = "product-rating";
    rating.innerHTML = `${generateStars(product.popularityScore)} ${(product.popularityScore * 5).toFixed(1)}/5`;

    productCard.appendChild(img);
    productCard.appendChild(title);
    productCard.appendChild(price);
    productCard.appendChild(colorPicker);
    productCard.appendChild(colorLabel);
    productCard.appendChild(rating);
    carousel.appendChild(productCard);
  });
}

function generateStars(score) {
  const percentage = (score * 5 * 20).toFixed(0);
  return `
    <div class="star-wrapper">
      <div class="stars-outer">
        <span>★★★★★</span>
      </div>
      <div class="stars-inner" style="width: ${percentage}%;">
        <span>★★★★★</span>
      </div>
    </div>
  `;
}

function applyFilters() {
  const min = parseFloat(minPriceInput.value) || 0;
  const max = parseFloat(maxPriceInput.value) || Infinity;

  filteredProducts = originalProducts.filter(
    (p) => p.price >= min && p.price <= max
  );

  const sortValue = sortSelect.value;
  if (sortValue === "price-asc") {
    filteredProducts.sort((a, b) => a.price - b.price);
  } else if (sortValue === "price-desc") {
    filteredProducts.sort((a, b) => b.price - a.price);
  } else if (sortValue === "star-asc") {
    filteredProducts.sort((a, b) => a.popularityScore - b.popularityScore);
  } else if (sortValue === "star-desc") {
    filteredProducts.sort((a, b) => b.popularityScore - a.popularityScore);
  }

  displayProducts();
}

leftArrow.addEventListener("click", () => {
  carousel.scrollBy({ left: -300, behavior: "smooth" });
});

rightArrow.addEventListener("click", () => {
  carousel.scrollBy({ left: 300, behavior: "smooth" });
});

sortSelect.addEventListener("change", applyFilters);
priceFilterBtn.addEventListener("click", applyFilters);

fetchProducts();