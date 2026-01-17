// ===========================================
// ADMIN PANEL JAVASCRIPT (API INTEGRATED)
// ===========================================

// 🔌 API Configuration
// আমরা '/api' ব্যবহার করছি যাতে আইপি বা লোকালহোস্ট যাই হোক, এটি কাজ করে।
const API_BASE_URL = '/api'; 

// --- DOM Elements ---
const loginScreen = document.getElementById("loginScreen");
const adminPanel = document.getElementById("adminPanel");
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const loginError = document.getElementById("loginError");
const orderList = document.getElementById("orderList");


// ===============================
// 1. AUTHENTICATION (Login, Logout)
// ===============================

function getToken() {
    return localStorage.getItem('adminToken');
}

async function handleLogin() {
    const username = usernameInput.value;
    const password = passwordInput.value;
    
    loginError.style.display = 'none';

    if (!username || !password) {
        loginError.textContent = 'Username and Password are required.';
        loginError.style.display = 'block';
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Login failed');
        }

        const data = await response.json();
        
        // টোকেন সংরক্ষণ
        localStorage.setItem('adminToken', data.token); 
        showAdminPanel();

    } catch (error) {
        console.error('Login Error:', error);
        loginError.textContent = '❌ Invalid credentials: ' + error.message;
        loginError.style.display = 'block';
    }
}

function logout() {
    localStorage.removeItem('adminToken');
    location.reload();
}

function showAdminPanel() {
    loginScreen.style.display = 'none';
    adminPanel.style.display = 'block';
    loadOrders();
}


// ===============================
// 2. LOAD ORDERS (API Call)
// ===============================

async function loadOrders() {
    const token = getToken();
    if (!token) {
        logout();
        return;
    }

    orderList.innerHTML = `<p class="empty">Loading orders...</p>`;

    try {
        const response = await fetch(`${API_BASE_URL}/orders/all`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.status === 401) {
            throw new Error('Session expired. Please log in again.');
        }

        if (!response.ok) {
            throw new Error('Failed to fetch orders.');
        }

        const orders = await response.json();
        renderOrders(orders);

    } catch (error) {
        console.error('Error:', error);
        orderList.innerHTML = `<p class="empty" style="color: red;">${error.message}</p>`;
    }
}


// ===============================
// 3. RENDER ORDERS
// ===============================
function renderOrders(orders) {
    orderList.innerHTML = '';
    if (orders.length === 0) {
        orderList.innerHTML = `<p class="empty">📭 No orders yet</p>`;
        return;
    }

    orders.reverse().forEach(order => {
        const div = document.createElement("div");
        div.className = "order-card";
        
        const customer = order.shippingAddress;
        const orderIdDisplay = order._id.substring(18).toUpperCase();
        
        div.innerHTML = `
            <h3>Order ID: ${orderIdDisplay} (${order.status})</h3>
            <p><strong>Date:</strong> ${new Date(order.createdAt).toLocaleString()}</p>
            <hr>
            <p><strong>Name:</strong> ${customer.fullName}</p>
            <p><strong>Phone:</strong> ${customer.phoneNumber}</p>
            <p><strong>Address:</strong> ${customer.fullAddress}</p>
            <p><strong>Payment:</strong> ${order.paymentMethod} ${order.transactionId ? `(Trx: ${order.transactionId})` : ''}</p>
            <hr>
            <p><strong>Total:</strong> <strong>${order.totalPrice} TK</strong></p>

            <div class="order-items">
                <strong>Items:</strong>
                <ul>
                    ${order.orderItems.map(i => `<li>${i.name} (${i.size}) × ${i.quantity}</li>`).join("")}
                </ul>
            </div>
            
            <div class="admin-tools">
                <select id="status-select-${order._id}">
                    <option value="Pending" ${order.status === 'Pending' ? 'selected' : ''}>Pending</option>
                    <option value="Processing" ${order.status === 'Processing' ? 'selected' : ''}>Processing</option>
                    <option value="Shipped" ${order.status === 'Shipped' ? 'selected' : ''}>Shipped</option>
                    <option value="Delivered" ${order.status === 'Delivered' ? 'selected' : ''}>Delivered</option>
                    <option value="Cancelled" ${order.status === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
                </select>
                <button onclick="updateOrderStatus('${order._id}')">Update</button>
            </div>
        `;
        orderList.appendChild(div);
    });
}


// ===============================
// 4. ORDER STATUS UPDATE
// ===============================
async function updateOrderStatus(orderId) {
    const token = getToken();
    const newStatus = document.getElementById(`status-select-${orderId}`).value;

    try {
        const response = await fetch(`${API_BASE_URL}/orders/${orderId}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ status: newStatus })
        });

        if (!response.ok) throw new Error('Update failed');

        alert('Status updated!');
        loadOrders();
    } catch (error) {
        alert(error.message);
    }
}

// 5. AUTO LOGIN
document.addEventListener("DOMContentLoaded", () => {
    if (getToken()) showAdminPanel();
});
