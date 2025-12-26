/* =========================
   ADMIN CONFIG
========================= */
const ADMIN_PASSKEY = "dadawear123"; // 🔑 পরে বদলাতে পারো

/* =========================
   DOM ELEMENTS
========================= */
const loginScreen = document.getElementById("loginScreen");
const adminPanel = document.getElementById("adminPanel");
const passkeyInput = document.getElementById("passkey");
const loginError = document.getElementById("loginError");
const orderList = document.getElementById("orderList");

/* =========================
   LOGIN SYSTEM
========================= */
function login() {
    const enteredKey = passkeyInput.value;

    if (enteredKey === ADMIN_PASSKEY) {
        localStorage.setItem("adminLoggedIn", "true");
        showAdminPanel();
    } else {
        loginError.style.display = "block";
    }
}

function logout() {
    localStorage.removeItem("adminLoggedIn");
    location.reload();
}

function showAdminPanel() {
    loginScreen.style.display = "none";
    adminPanel.style.display = "block";
    loadOrders();
}

/* =========================
   LOAD ORDERS
========================= */
function loadOrders() {
    orderList.innerHTML = "";

    const orders = JSON.parse(localStorage.getItem("orders")) || [];

    if (orders.length === 0) {
        orderList.innerHTML = `<p class="empty">📭 No orders yet</p>`;
        return;
    }

    orders.reverse().forEach(order => {
        const div = document.createElement("div");
        div.className = "order-card";

        div.innerHTML = `
            <h3>🛒 Order • ${new Date(order.timestamp).toLocaleString()}</h3>
            <p><strong>Name:</strong> ${order.customer.name}</p>
            <p><strong>Phone:</strong> ${order.customer.phone}</p>
            <p><strong>Address:</strong> ${order.customer.address}</p>
            <p><strong>Payment:</strong> Reminder (${order.customer.payment})</p>
            <p><strong>Total:</strong> ${order.total} TK</p>

            <div class="order-items">
                <strong>Items:</strong>
                <ul>
                    ${order.items.map(item =>
                        `<li>${item.name} × ${item.quantity}</li>`
                    ).join("")}
                </ul>
            </div>
        `;

        orderList.appendChild(div);
    });
}

/* =========================
   AUTO LOGIN
========================= */
document.addEventListener("DOMContentLoaded", () => {
    if (localStorage.getItem("adminLoggedIn") === "true") {
        showAdminPanel();
    }
});