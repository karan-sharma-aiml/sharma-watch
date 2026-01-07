const API = "https://sharma-watch-backend.onrender.com";

/* ===============================
   LOGIN
================================ */
function login() {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();
  const msg = document.getElementById("msg");

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
   LOAD PRODUCTS (NO AUTO LOGOUT)
================================ */
function loadProducts() {
  fetch(`${API}/admin/products`, {
    credentials: "include"
  })
    .then(res => {
      if (res.status === 401) {
        alert("Session expired. Please login again.");
        window.location.href = "login.html";
        return [];
      }
      return res.json();
    })
    .then(products => {
      const box = document.getElementById("productList");
      if (!box) return;

      box.innerHTML = "";

      products.forEach(p => {
        box.innerHTML += `
          <div class="product-row">
            <b>${p.name}</b> (${p.brand}) — ₹${p.price}
            <button onclick="deleteProduct(${p.id})">❌</button>
          </div>
        `;
      });
    });
}

/* ===============================
   ADD PRODUCT
================================ */
function addProduct() {
  fetch(`${API}/admin/product`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({
      name: name.value,
      brand: brand.value,
      selling_price: price.value,
      description: desc.value
    })
  }).then(loadProducts);
}

/* ===============================
   DELETE
================================ */
function deleteProduct(id) {
  fetch(`${API}/admin/product/${id}`, {
    method: "DELETE",
    credentials: "include"
  }).then(loadProducts);
}

/* ===============================
   LOGOUT (ONLY ON CLICK)
================================ */
function logoutAdmin() {
  fetch(`${API}/admin/logout`, {
    method: "POST",
    credentials: "include"
  }).finally(() => {
    window.location.href = "login.html";
  });
}