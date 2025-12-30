// ===========================================
// DXW E-commerce Frontend Logic (API INTEGRATED)
// ===========================================

// 🔌 API Configuration (পরিবর্তন ১)
const API_BASE_URL = 'http://localhost:5000/api'; 

// ===============================
// 1. Product Data (পরিবর্তন ২: স্থির ডেটা সরিয়ে দেওয়া হলো)
// ===============================
// const products = [ ... ]; // এই অংশটি এখন আর দরকার নেই, ডেটা সার্ভার থেকে আসবে
let products = []; // সার্ভার থেকে আসা ডেটা সংরক্ষণের জন্য ফাঁকা অ্যারে

// ===============================
// 2. Shipping
// ===============================
const SHIPPING_DHAKA = 55;
const SHIPPING_OUTSIDE = 115;
let shippingFee = SHIPPING_OUTSIDE;

// ===============================
// 3. Global Cart State (পরিবর্তন ৩: লোকাল স্টোরেজ থেকে কার্ট লোড করা)
// ===============================
// কার্ট সাধারণত লোকাল স্টোরেজেই থাকে, শুধুমাত্র চেকআউটের সময় সার্ভারে যায়
// ভবিষ্যতে লগইন সিস্টেম এলে এটি সার্ভার-সাইড কার্টে পরিবর্তিত হবে।
let cart = JSON.parse(localStorage.getItem('dxw_cart')) || []; 

// ===============================
// 4. DOM Elements
// ===============================
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
// 5. Render Products (পরিবর্তন ৪: প্রোডাক্ট ডেটা এখন গ্লোবাল 'products' অ্যারে থেকে আসবে)
// ===============================
function renderProducts() {
    productGrid.innerHTML = '';
    // products অ্যারেতে ডেটা আছে কিনা নিশ্চিত করুন
    if (products.length === 0) {
        productGrid.innerHTML = '<p>পণ্য লোড হচ্ছে...</p>';
        return;
    }

    products.forEach(product => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
            <img src="${product.image}" alt="${product.name}">
            <div class="product-info">
                <h3>${product.name}</h3>
                <p>${product.price} TK</p>
                <button class="btn primary-btn" data-id="${product._id}">
                    <i class="fas fa-cart-plus"></i> Add to Cart
                </button>
            </div>
        `;
        productGrid.appendChild(card);
    });
}

// ===============================
// 5.1. পণ্য লোড করার নতুন API ফাংশন (পরিবর্তন ৫: নতুন ফাংশন)
// ===============================
async function loadProducts() {
    try {
        const response = await fetch(`${API_BASE_URL}/products`);
        
        if (!response.ok) {
            throw new Error(`পণ্য লোড করা সম্ভব হয়নি, স্থিতি: ${response.status}`);
        }
        
        products = await response.json();
        renderProducts(); // ডেটা আসার পর পণ্য রেন্ডার করুন
        
    } catch (error) {
        console.error("পণ্য লোড করতে ব্যর্থ:", error);
        productGrid.innerHTML = '<p style="color: red;">দুঃখিত! সার্ভার থেকে পণ্য লোড করা যায়নি।</p>';
    }
}


// ===============================
// 6. Cart Functions (সামান্য পরিবর্তন: লোকাল স্টোরেজ আপডেট)
// ===============================
function addToCart(productId) {
    // MongoDB ID (_id) ব্যবহার করা হয়েছে
    const product = products.find(p => p._id === productId); 
    if (!product) return;

    const item = cart.find(i => i.id === productId);
    if (item) {
        item.quantity++;
    } else {
        // কার্ট আইটেমে _id ব্যবহার করা হয়েছে
        cart.push({
            id: product._id, 
            name: product.name,
            price: product.price,
            image: product.image, // অর্ডারে ছবির URL লাগবে
            quantity: 1
        });
    }
    
    // লোকাল স্টোরেজ আপডেট করুন
    localStorage.setItem('dxw_cart', JSON.stringify(cart));
    updateCartDisplay();
}

function updateQuantity(productId, delta) {
    const index = cart.findIndex(i => i.id === productId);
    if (index === -1) return;

    cart[index].quantity += delta;
    if (cart[index].quantity <= 0) cart.splice(index, 1);
    
    // লোকাল স্টোরেজ আপডেট করুন
    localStorage.setItem('dxw_cart', JSON.stringify(cart));
    updateCartDisplay();
}

function calculateTotals() {
    const subtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);
    return {
        subtotal,
        total: subtotal + shippingFee
    };
}

function updateCartDisplay() {
    // ... (পূর্বের মতোই থাকবে) ...
    const { subtotal, total } = calculateTotals();

    cartCountElement.textContent = cart.reduce((s, i) => s + i.quantity, 0);
    cartItemsList.innerHTML = '';

    if (!cart.length) {
        cartItemsList.innerHTML = '<p>Your cart is empty.</p>';
        checkoutButton.disabled = true;
    } else {
        checkoutButton.disabled = false;
        cart.forEach(item => {
            const div = document.createElement('div');
            div.className = 'cart-item';
            div.innerHTML = `
                <span>${item.name}</span>
                <div>
                    <button class="qty-btn" data-id="${item.id}" data-action="decrease">-</button>
                    <span>${item.quantity}</span>
                    <button class="qty-btn" data-id="${item.id}" data-action="increase">+</button>
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
// 7. Events (পরিবর্তন ৬: DOMContentLoaded এ loadProducts যুক্ত করা)
// ===============================
document.addEventListener('DOMContentLoaded', () => {
    loadProducts(); // সার্ভার থেকে পণ্য লোড করুন
    updateCartDisplay();
});

productGrid.addEventListener('click', e => {
    if (e.target.closest('button')?.dataset.id) {
        // এখানে data-id এখন MongoDB-র _id
        addToCart(e.target.closest('button').dataset.id); 
    }
});

cartButton.onclick = () => cartModal.style.display = 'block';

document.querySelectorAll('.close-button').forEach(btn => {
    btn.onclick = () => btn.closest('.modal').style.display = 'none';
});

cartItemsList.addEventListener('click', e => {
    if (!e.target.classList.contains('qty-btn')) return;
    updateQuantity(e.target.dataset.id,
        e.target.dataset.action === 'increase' ? 1 : -1
    );
});

checkoutButton.onclick = () => {
    cartModal.style.display = 'none';
    checkoutModal.style.display = 'block';
};

paymentMethod.onchange = e => {
    bkashInfo.style.display = e.target.value === 'bkash' ? 'block' : 'none';
};

// ===============================
// 8. ORDER SAVE (API INTEGRATION) (পরিবর্তন ৭: লোকাল স্টোরেজের পরিবর্তে API কল)
// ===============================
checkoutForm.addEventListener('submit', async e => {
    e.preventDefault();

    if (cart.length === 0) {
        alert("কার্ট ফাঁকা। কোনো অর্ডার প্লেস করা যাবে না।");
        return;
    }

    const formData = Object.fromEntries(new FormData(checkoutForm));
    const { subtotal, total } = calculateTotals();

    // API-তে পাঠানোর জন্য অর্ডার আইটেমগুলো প্রস্তুত করুন
    const orderItemsForAPI = cart.map(item => ({
        // OrderItemSchema-এর সাথে মিলিয়ে ডেটা পাঠানো হচ্ছে
        product: item.id, // MongoDB Product ID
        name: item.name,
        image: item.image,
        size: 'L', // যেহেতু আপনার কোডে সাইজ চয়েস নেই, এখানে একটি ডিফল্ট সাইজ ব্যবহার করা হলো
        quantity: item.quantity,
        price: item.price
    }));

    const orderData = {
        orderItems: orderItemsForAPI,
        shippingAddress: {
            fullName: formData.name,
            phoneNumber: formData.phone,
            fullAddress: `${formData.address}, ${formData.area}`, // ঠিকানা ও এলাকা একত্রিত করা হলো
        },
        paymentMethod: formData.payment,
        transactionId: formData.trxid || undefined, // undefined হবে যদি COD হয়
        itemsPrice: subtotal,
        shippingPrice: shippingFee,
        totalPrice: total,
    };

    try {
        // 🔐 সার্ভারে POST রিকোয়েস্ট পাঠান
        const response = await fetch(`${API_BASE_URL}/orders`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(orderData)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'অর্ডার প্লেস করার সময় সার্ভার ত্রুটি।');
        }

        // 📝 সফল হলে
        const newOrder = await response.json();
        console.log('Order Successfully Placed (Server ID):', newOrder._id);
        
        // লোকাল স্টোরেজ থেকে কার্ট সরিয়ে দিন
        localStorage.removeItem('dxw_cart'); 
        cart = [];
        
        updateCartDisplay();
        checkoutForm.reset();
        checkoutModal.style.display = 'none';
        successModal.style.display = 'block';
        alert(`অভিনন্দন! আপনার অর্ডার #${newOrder._id.substring(18)} সফলভাবে রেকর্ড করা হয়েছে।`);

    } catch (error) {
        console.error("অর্ডার প্লেস করতে ব্যর্থ:", error);
        alert(`অর্ডার প্লেস করা সম্ভব হয়নি: ${error.message}`);
    }
});
