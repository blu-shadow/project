// ===========================================
// ADMIN PANEL JAVASCRIPT (API INTEGRATED)
// ===========================================

// 🔌 API Configuration
const API_BASE_URL = 'http://localhost:5000/api'; 

// --- DOM Elements (নতুন User/Password ইনপুট অনুযায়ী আপডেট করা হয়েছে) ---
const loginScreen = document.getElementById("loginScreen");
const adminPanel = document.getElementById("adminPanel");
// পুরানো passkeyInput এর পরিবর্তে নতুন username ও password ইনপুট ব্যবহার করা হচ্ছে
// এই এলিমেন্ট আইডিগুলি admin.html ফাইলে যুক্ত করতে হবে, যেমন: 
// <input type="text" id="username"> এবং <input type="password" id="password">
// [যদি আপনার HTML এ এখনও শুধু passkey থাকে, তবে দ্রুত admin.html টি আগের উত্তরের মতো আপডেট করে নিন।]
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const loginError = document.getElementById("loginError");
const orderList = document.getElementById("orderList");


// ===============================
// 1. AUTHENTICATION (Login, Logout, Token Management)
// ===============================

function getToken() {
    return localStorage.getItem('adminToken');
}

// API এর মাধ্যমে লগইন হ্যান্ডেল করা (পুরাতন 'login()' ফাংশনের পরিবর্তে)
async function handleLogin() {
    // নিশ্চিত করুন যে আপনার HTML এ username এবং password ইনপুট ফিল্ড আছে
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
        
        // 📝 টোকেন সংরক্ষণ করা
        localStorage.setItem('adminToken', data.token); 
        
        showAdminPanel();

    } catch (error) {
        console.error('Login Error:', error);
        loginError.textContent = '❌ Invalid Username or Password. ' + error.message;
        loginError.style.display = 'block';
    }
}

function logout() {
    localStorage.removeItem('adminToken'); // টোকেন সরিয়ে দিন
    location.reload();
}

function showAdminPanel() {
    loginScreen.style.display = 'none';
    adminPanel.style.display = 'block';
    loadOrders(); // লগইন সফল হলে অর্ডার লোড করুন
}


// ===============================
// 2. LOAD ORDERS (API Call)
// ===============================

async function loadOrders() {
    const token = getToken();
    orderList.innerHTML = '';
    
    // লোডিং মেসেজ দেখানোর জন্য একটি ডম এলিমেন্ট তৈরি করা ভালো
    orderList.innerHTML = `<p class="empty" id="loadingMessage">Loading orders...</p>`;

    if (!token) {
        logout(); // টোকেন না থাকলে লগইন স্ক্রিনে পাঠান
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/orders/all`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}` // 🔑 টোকেন সহ রিকোয়েস্ট
            }
        });

        if (response.status === 401) {
            throw new Error('Session expired or Not Authorized. Please log in again.');
        }

        if (!response.ok) {
            throw new Error('Failed to fetch orders from server.');
        }

        const orders = await response.json();
        renderOrders(orders);

    } catch (error) {
        console.error('Error loading orders:', error);
        orderList.innerHTML = `<p class="empty" style="color: red;">${error.message}</p>`;
        // সেশন এক্সপায়ার হলে স্বয়ংক্রিয় লগআউট
        if (error.message.includes('Session expired')) {
            setTimeout(logout, 2000); 
        }
    }
}


// ===============================
// 3. RENDER ORDERS (API Data Structure)
// ===============================
function renderOrders(orders) {
    orderList.innerHTML = '';
    if (orders.length === 0) {
        orderList.innerHTML = `<p class="empty">📭 No orders yet</p>`;
        return;
    }

    // নতুন অর্ডার প্রথমে দেখানোর জন্য
    orders.reverse().forEach(order => {
        const div = document.createElement("div");
        div.className = "order-card";
        
        // ডেটাবেস স্কিমা অনুযায়ী ডেটা ব্যবহার করা
        const customer = order.shippingAddress;
        const orderIdDisplay = order._id.substring(18).toUpperCase(); // শেষ কয়েকটি অক্ষর
        
        div.innerHTML = `
            <h3>Order ID: ${orderIdDisplay} (${order.status})</h3>
            <p><strong>Status:</strong> <span class="status-pending">${order.status}</span></p>
            <p><strong>Date:</strong> ${new Date(order.createdAt).toLocaleString()}</p>
            
            <hr style="margin: 10px 0; border: none; border-top: 1px solid #eee;">
            
            <p><strong>Name:</strong> ${customer.fullName}</p>
            <p><strong>Phone:</strong> ${customer.phoneNumber}</p>
            <p><strong>Address:</strong> ${customer.fullAddress}</p>
            <p><strong>Payment:</strong> ${order.paymentMethod} ${order.transactionId ? ` (TrxID: ${order.transactionId})` : ''}</p>
            
            <hr style="margin: 10px 0; border: none; border-top: 1px solid #eee;">

            <p><strong>Subtotal:</strong> ${order.itemsPrice} TK</p>
            <p><strong>Shipping:</strong> ${order.shippingPrice} TK</p>
            <p><strong>Total:</strong> <strong>${order.totalPrice} TK</strong></p>

            <div class="order-items">
                <strong>Items:</strong>
                <ul>
                    ${order.orderItems.map(i => 
                        `<li>${i.name} (${i.size}) × ${i.quantity}</li>`
                    ).join("")}
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
                <button onclick="updateOrderStatus('${order._id}')">Update Status</button>
            </div>
        `;

        orderList.appendChild(div);
    });
}


// ===============================
// 4. ORDER STATUS UPDATE (New Function)
// ===============================
async function updateOrderStatus(orderId) {
    const token = getToken();
    const selectElement = document.getElementById(`status-select-${orderId}`);
    const newStatus = selectElement.value;

    if (!confirm(`Are you sure you want to change status of Order ${orderId.substring(18)} to ${newStatus}?`)) {
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/orders/${orderId}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ status: newStatus })
        });

        if (response.status === 401) {
             throw new Error('Not authorized. Token invalid.');
        }
        if (!response.ok) {
             throw new Error('Status update failed on server.');
        }

        // সফল হলে
        alert(`Order ${orderId.substring(18)} status updated to ${newStatus}.`);
        loadOrders(); // অর্ডার তালিকা রিফ্রেশ করুন

    } catch (error) {
        console.error('Status Update Error:', error);
        alert(`Failed to update status: ${error.message}`);
    }
}


// =========================
// 5. AUTO LOGIN
// =========================
document.addEventListener("DOMContentLoaded", () => {
    // টোকেন আছে কিনা চেক করা হচ্ছে
    if (getToken()) {
        showAdminPanel();
    }
});
