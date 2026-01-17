// ===========================================
// DXW E-commerce Frontend Logic (API INTEGRATED)
// ===========================================

// 🔌 API Configuration
// 'http://localhost:5000/api' এর পরিবর্তে '/api' ব্যবহার করা হয়েছে
const API_BASE_URL = '/api'; 

let products = []; 

// 📦 Shipping Costs
const SHIPPING_DHAKA = 55;
const SHIPPING_OUTSIDE = 115;
let shippingFee = SHIPPING_OUTSIDE;

// 🛒 Global Cart State
let cart = JSON.parse(localStorage.getItem('dxw_cart')) || []; 

// 🎯 DOM Elements
const productGrid = document.getElementById('product-grid');
const cartButton = document.getElementById('cart-button');
const cartCountElement = document.getElementById('cart-count');
const cartModal = document.getElementById('cart-modal');
const checkoutModal = document.getElementById('checkout-modal');
const successModal = document.getElementById('success-modal');

const cartItemsList = document.getElementById('cart-items-list');
const cartSubtotalElement = document.getElementById('cart-subtotal');
const cartTotalElement = document.getElementById('cart-total');
const checkoutButton = document.getElementById('checkout-button');

const checkoutForm = document.getElementById('checkout-form');
const paymentMethod = document.getElementById('payment');
const bkashInfo = document.getElementById('bkash-info');
const finalTotalDisplay = document.getElementById('final-total-display');

// ===============================
// 1. PRODUCT FUNCTIONS
// ===============================

// সার্ভার থেকে পণ্য নিয়ে আসা
async function loadProducts() {
    try {
        const response = await fetch(`${API_BASE_URL}/products`);
        if (!response.ok) throw new Error('পণ্য লোড করা সম্ভব হয়নি।');
        
        products = await response.json();
        renderProducts();
    } catch (error) {
        console.error("Fetch Error:", error);
        productGrid.innerHTML = '<p style="color: red; text-align: center;">সার্ভারের সাথে সংযোগ বিচ্ছিন্ন!</p>';
    }
}

function renderProducts() {
    productGrid.innerHTML = '';
    if (products.length === 0) {
        productGrid.innerHTML = '<p>কোনো পণ্য পাওয়া যায়নি।</p>';
        return;
    }

    products.forEach(product => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
            <img src="${product.image}" alt="${product.name}" onerror="this.src='https://via.placeholder.com/150'">
            <div class="product-info">
                <h3>${product.name}</h3>
                <p>${product.price} TK</p>
                <button class="btn primary-btn" onclick="addToCart('${product._id}')">
                    <i class="fas fa-cart-plus"></i> Add to Cart
                </button>
            </div>
        `;
        productGrid.appendChild(card);
    });
}

// ===============================
// 2. CART FUNCTIONS
// ===============================

function addToCart(productId) {
    const product = products.find(p => p._id === productId); 
    if (!product) return;

    const existingItem = cart.find(i => i.id === productId);
    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({
            id: product._id, 
            name: product.name,
            price: product.price,
            image: product.image,
            quantity: 1
        });
    }
    saveAndRefreshCart();
}

function updateQuantity(productId, delta) {
    const item = cart.find(i => i.id === productId);
    if (!item) return;

    item.quantity += delta;
    if (item.quantity <= 0) {
        cart = cart.filter(i => i.id !== productId);
    }
    saveAndRefreshCart();
}

function saveAndRefreshCart() {
    localStorage.setItem('dxw_cart', JSON.stringify(cart));
    updateCartDisplay();
}

function updateCartDisplay() {
    const subtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);
    const total = subtotal + shippingFee;

    cartCountElement.textContent = cart.reduce((s, i) => s + i.quantity, 0);
    cartItemsList.innerHTML = '';

    if (cart.length === 0) {
        cartItemsList.innerHTML = '<p style="text-align: center;">Your cart is empty.</p>';
        checkoutButton.disabled = true;
    } else {
        checkoutButton.disabled = false;
        cart.forEach(item => {
            const div = document.createElement('div');
            div.className = 'cart-item';
            div.innerHTML = `
                <span>${item.name}</span>
                <div class="qty-controls">
                    <button onclick="updateQuantity('${item.id}', -1)">-</button>
                    <span>${item.quantity}</span>
                    <button onclick="updateQuantity('${item.id}', 1)">+</button>
                </div>
                <strong>${item.price * item.quantity} TK</strong>
            `;
            cartItemsList.appendChild(div);
        });
    }

    cartSubtotalElement.textContent = subtotal;
    cartTotalElement.textContent = total;
    finalTotalDisplay.textContent = total;
}

// ===============================
// 3. ORDER SUBMISSION
// ===============================

checkoutForm.addEventListener('submit', async e => {
    e.preventDefault();

    if (cart.length === 0) {
        alert("আপনার কার্ট ফাঁকা!");
        return;
    }

    const formData = new FormData(checkoutForm);
    const subtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);

    const orderData = {
        orderItems: cart.map(item => ({
            product: item.id,
            name: item.name,
            image: item.image,
            size: 'L', // আপনি চাইলে পরে সাইজ সিলেকশন অপশন যোগ করতে পারেন
            quantity: item.quantity,
            price: item.price
        })),
        shippingAddress: {
            fullName: formData.get('name'),
            phoneNumber: formData.get('phone'),
            fullAddress: `${formData.get('address')}, ${formData.get('area')}`,
        },
        paymentMethod: formData.get('payment'),
        transactionId: formData.get('trxid') || "",
        itemsPrice: subtotal,
        shippingPrice: shippingFee,
        totalPrice: subtotal + shippingFee,
    };

    try {
        const response = await fetch(`${API_BASE_URL}/orders`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderData)
        });

        if (!response.ok) throw new Error('অর্ডার প্লেস করা যায়নি।');

        const result = await response.json();
        
        // Success
        localStorage.removeItem('dxw_cart');
        cart = [];
        updateCartDisplay();
        checkoutForm.reset();
        checkoutModal.style.display = 'none';
        successModal.style.display = 'block';
        
    } catch (error) {
        alert(error.message);
    }
});

// ===============================
// 4. INITIALIZATION & EVENTS
// ===============================

document.addEventListener('DOMContentLoaded', () => {
    loadProducts();
    updateCartDisplay();
});

cartButton.onclick = () => cartModal.style.display = 'block';

document.querySelectorAll('.close-button').forEach(btn => {
    btn.onclick = () => btn.closest('.modal').style.display = 'none';
});

paymentMethod.onchange = e => {
    bkashInfo.style.display = e.target.value === 'bkash' ? 'block' : 'none';
};
