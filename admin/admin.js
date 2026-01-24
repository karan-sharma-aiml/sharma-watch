// ✅ LOCAL BACKEND ONLY
const API = location.hostname.includes("localhost")
  ? "http://127.0.0.1:5000"
  : "https://sharma-watch-backend.onrender.com";

/* ===============================
   LOGIN
================================ */
function login() {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();
  const msg = document.getElementById("msg");

  msg.innerText = "";

  fetch(`${API}/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ username, password })
  })
    .then(res => {
      if (!res.ok) throw new Error("Invalid credentials");
      return res.json();
    })
    .then(() => {
      window.location.href = "dashboard.html";
    })
    .catch(err => {
      msg.innerText = err.message;
    });
}

/* ===============================
   LOAD PRODUCTS
================================ */
function loadProducts() {
  fetch(`${API}/admin/products`, { credentials: "include" })
    .then(res => {
      if (res.status === 401) {
        window.location.href = "login.html";
        return null;
      }
      return res.json();
    })
    .then(products => {
      if (!Array.isArray(products)) return;

      const box = document.getElementById("productList");
      if (!box) return;

      box.innerHTML = "";

      if (products.length === 0) {
        box.innerHTML = "<p>No products found</p>";
        return;
      }

      products.forEach(p => {
        box.innerHTML += `
          <div class="product-row">
            <b>${p.name}</b> (${p.brand}) — ₹${p.price}
            <button onclick="openImageUpload(${p.id})">📷 Upload Images</button>
            <button onclick="deleteProduct(${p.id})">❌</button>
          </div>
        `;
      });
    })
    .catch(() => {});
}

/* ===============================
   ADD PRODUCT  (🔥 FIXED)
================================ */
function addProduct() {

  const price = document.getElementById("price").value;

  fetch(`${API}/admin/product`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({
      name: document.getElementById("name").value.trim(),
      brand: document.getElementById("brand").value.trim(),
      selling_price: Number(price),   // 🔥 FIX (number send)
      description: document.getElementById("desc").value.trim()
    })
  })
  .then(async res => {
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Product add failed");
    }
    return res.json();
  })
  .then(() => {
    document.getElementById("name").value = "";
    document.getElementById("brand").value = "";
    document.getElementById("price").value = "";
    document.getElementById("desc").value = "";
    loadProducts();
  })
  .catch(err => {
    alert(err.message);
  });
}

/* ===============================
   DELETE PRODUCT
================================ */
function deleteProduct(id) {
  fetch(`${API}/admin/product/${id}`, {
    method: "DELETE",
    credentials: "include"
  }).then(loadProducts);
}

/* ===============================
   IMAGE UPLOAD (1–5 IMAGES)
================================ */
let CURRENT_PRODUCT_ID = null;

function openImageUpload(productId) {
  CURRENT_PRODUCT_ID = productId;
  document.getElementById("imageInput").click();
}

document.addEventListener("DOMContentLoaded", () => {
  const imageInput = document.getElementById("imageInput");
  if (!imageInput) return;

  imageInput.addEventListener("change", function () {
    const files = this.files;

    if (!CURRENT_PRODUCT_ID || !files || files.length === 0) return;

    if (files.length > 5) {
      alert("Maximum 5 images allowed");
      this.value = "";
      return;
    }

    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append("images", files[i]);
    }

    fetch(`${API}/admin/product/${CURRENT_PRODUCT_ID}/image`, {
      method: "POST",
      credentials: "include",
      body: formData
    })
      .then(async res => {
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || "Upload failed");
        }
        return res.json();
      })
      .then(() => {
        alert("Images uploaded successfully");
        this.value = "";
      })
      .catch(err => {
        alert(err.message);
      });
  });
});

/* ===============================
   LOGOUT
================================ */
function logoutAdmin() {
  fetch(`${API}/admin/logout`, {
    method: "POST",
    credentials: "include"
  }).finally(() => {
    window.location.href = "login.html";
  });
}