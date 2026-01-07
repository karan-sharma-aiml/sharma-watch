/* ===============================
   CONFIG
================================ */
const API_BASE = "http://127.0.0.1:5000";

/* ===============================
   LOAD FEATURED PRODUCTS
================================ */
document.addEventListener("DOMContentLoaded", loadFeaturedProducts);

function loadFeaturedProducts() {
  fetch(`${API_BASE}/api/products`)
    .then(res => {
      if (!res.ok) throw new Error("Failed to fetch products");
      return res.json();
    })
    .then(products => {
      const grid = document.getElementById("featuredGrid");
      if (!grid) return;

      grid.innerHTML = "";

      if (!products || products.length === 0) {
        grid.innerHTML = "<p>No products available</p>";
        return;
      }

      // 🔥 Show only first 6 products
      products.slice(0, 6).forEach(p => {
        const imageUrl = p.image
          ? API_BASE + p.image
          : "https://via.placeholder.com/400x400?text=No+Image";

        const card = document.createElement("div");
        card.className = "product-card";

        card.innerHTML = `
          <img src="${imageUrl}" alt="${p.name}">
          <div class="product-info">
            <h3>${p.name}</h3>
            <p>${p.brand || ""}</p>
            <div class="price">₹${p.price}</div>
          </div>
        `;

        // 🔗 Product detail page
        card.addEventListener("click", () => {
          window.location.href = `product.html?id=${p.id}`;
        });

        grid.appendChild(card);
      });
    })
    .catch(err => {
      console.error("Index page error:", err);
      const grid = document.getElementById("featuredGrid");
      if (grid) {
        grid.innerHTML =
          "<p style='text-align:center'>Failed to load products</p>";
      }
    });
}