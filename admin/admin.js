/* ===============================
   CONFIG
================================ */
const API = "https://sharma-watch-backend.onrender.com";

/* ===============================
   ADMIN LOGIN (🔥 MISSING PART FIXED)
================================ */
function login() {
  const username = document.getElementById("username")?.value.trim();
  const password = document.getElementById("password")?.value.trim();
  const msg = document.getElementById("msg");

  if (msg) msg.innerText = "";

  if (!username || !password) {
    if (msg) msg.innerText = "Username and password required";
    return;
  }

  fetch(`${API}/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",   // 🔥 VERY IMPORTANT
    body: JSON.stringify({ username, password })
  })
    .then(async res => {
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Login failed");
      }

      // ✅ SUCCESS
      window.location.href = "dashboard.html";
    })
    .catch(err => {
      if (msg) msg.innerText = err.message;
    });
}

/* ===============================
   LOAD PRODUCTS
================================ */
function loadProducts() {
  fetch(`${API}/admin/products`, { credentials: "include" })
    .then(r => {
      if (r.status === 401) {
        window.location.href = "login.html";
        return [];
      }
      return r.json();
    })
    .then(products => {
      const box = document.getElementById("productList");
      if (!box) return;

      box.innerHTML = "";

      if (!products.length) {
        box.innerHTML = "<p>No products found</p>";
        return;
      }

      products.forEach(p => {
        const row = document.createElement("div");
        row.className = "product-row";

        row.innerHTML = `
          <div>
            <b>${p.name}</b><br>
            <small>${p.brand}</small>
          </div>
          <div>₹${p.price}</div>
          <div>
            <button onclick="openImageUpload(${p.id})">📷 Upload Images</button>
            <button onclick="deleteProduct(${p.id})">❌ Delete</button>
          </div>
        `;

        box.appendChild(row);
      });
    });
}

/* ===============================
   ADD PRODUCT
================================ */
function addProduct() {
  const name = document.getElementById("name")?.value.trim();
  const brand = document.getElementById("brand")?.value.trim();
  const price = document.getElementById("price")?.value;
  const desc = document.getElementById("desc")?.value.trim();

  if (!name || !brand || !price) {
    alert("Name, brand and price required");
    return;
  }

  fetch(`${API}/admin/product`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({
      name,
      brand,
      selling_price: price,
      description: desc
    })
  })
    .then(r => r.json())
    .then(() => loadProducts());
}

/* ===============================
   DELETE PRODUCT
================================ */
function deleteProduct(id) {
  if (!confirm("Delete this product?")) return;

  fetch(`${API}/admin/product/${id}`, {
    method: "DELETE",
    credentials: "include"
  }).then(() => loadProducts());
}

/* ===============================
   IMAGE UPLOAD
================================ */
let CURRENT_PRODUCT_ID = null;

function openImageUpload(productId) {
  CURRENT_PRODUCT_ID = productId;
  document.getElementById("imageInput").click();
}

document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("imageInput");
  if (!input) return;

  input.addEventListener("change", async () => {
    if (!CURRENT_PRODUCT_ID) return;

    const files = Array.from(input.files);

    if (files.length === 0) return;
    if (files.length > 5) {
      alert("Maximum 5 images allowed");
      input.value = "";
      return;
    }

    const formData = new FormData();
    files.forEach(file => formData.append("images", file));

    try {
      const res = await fetch(
        `${API}/admin/product/${CURRENT_PRODUCT_ID}/image`,
        {
          method: "POST",
          credentials: "include",
          body: formData
        }
      );

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Upload failed");
        return;
      }

      alert("Images uploaded successfully ✅");
    } catch (err) {
      alert("Image upload failed ❌");
      console.error(err);
    }

    input.value = "";
    CURRENT_PRODUCT_ID = null;
  });

  // auto load dashboard
  if (window.location.href.includes("dashboard")) {
    loadProducts();
  }
});
