/* ==========================================================================
   1. GLOBAL INITIALIZATION & DOM READY
   ========================================================================== */
document.addEventListener('DOMContentLoaded', () => {
    initMobileMenu();
    initNewsletter();
    
    // Initialize specific modules based on which page is currently loaded
    if (document.getElementById('view-cart-btn')) {
        initShoppingCart();
    }
    
    if (document.getElementById('feedback-order-form')) {
        initWebStorageForm();
    }
});

/* ==========================================================================
   2. MOBILE NAVIGATION LOGIC
   ========================================================================== */
function initMobileMenu() {
    const menuToggle = document.querySelector('.menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            // Accessibility: toggle aria-expanded attribute
            const isExpanded = navMenu.classList.contains('active');
            menuToggle.setAttribute('aria-expanded', isExpanded);
        });
    }
}

/* ==========================================================================
   3. NEWSLETTER SUBSCRIPTION LOGIC
   ========================================================================== */
function initNewsletter() {
    const newsletterForms = document.querySelectorAll('#newsletter-form');
    
    newsletterForms.forEach(form => {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const emailInput = form.querySelector('input[type="email"]');
            
            if (emailInput && emailInput.value) {
                alert(`Thank you for subscribing to our newsletter: ${emailInput.value}`);
                form.reset();
            }
        });
    });
}

/* ==========================================================================
   4. SHOPPING CART MODULE (Uses LocalStorage)
   ========================================================================== */
function initShoppingCart() {
    // Load cart structure from local storage or fallback to empty array
    let cart = JSON.parse(localStorage.getItem('nursery_cart')) || [];
    
    const cartCountEl = document.getElementById('cart-count');
    const viewCartBtn = document.getElementById('view-cart-btn');
    const cartModal = document.getElementById('cart-modal');
    const closeModalSpan = document.querySelector('.close-modal');
    const clearCartBtn = document.getElementById('clear-cart-btn');
    const processOrderBtn = document.getElementById('process-order-btn');
    const cartItemsContainer = document.getElementById('cart-items-container');
    const addToCartButtons = document.querySelectorAll('.add-to-cart-btn');

    // Sync baseline UI elements
    updateCartCount();

    // Event: Add Item to Cart
    addToCartButtons.forEach(button => {
        button.addEventListener('click', () => {
            const id = button.getAttribute('data-id');
            const name = button.getAttribute('data-name');
            const price = parseFloat(button.getAttribute('data-price'));

            // Check if item already exists in the cart structure
            const existingItem = cart.find(item => item.id === id);
            if (existingItem) {
                existingItem.quantity += 1;
            } else {
                cart.push({ id, name, price, quantity: 1 });
            }

            // Save state, sync UI, and fire mandatory assignment alert
            saveCartState();
            updateCartCount();
            alert("Item added.");
        });
    });

    // Event: Modal Interactions
    viewCartBtn.addEventListener('click', () => {
        renderCartItems();
        cartModal.classList.add('show');
        cartModal.setAttribute('aria-hidden', 'false');
    });

    const hideModal = () => {
        cartModal.classList.remove('show');
        cartModal.setAttribute('aria-hidden', 'true');
    };

    closeModalSpan.addEventListener('click', hideModal);
    
    // Close modal if user clicks outside the modal content area
    window.addEventListener('click', (e) => {
        if (e.target === cartModal) hideModal();
    });

    // Event: Clear Cart Functional Requirement
    clearCartBtn.addEventListener('click', () => {
        cart = [];
        saveCartState();
        updateCartCount();
        renderCartItems();
    });

    // Event: Process Order Functional Requirement
    processOrderBtn.addEventListener('click', () => {
        if (cart.length === 0) {
            alert("Your cart is empty! Add items before processing.");
            return;
        }
        // Requirement exact string: "Thank you for your order."
        alert("Thank you for your order.");
        cart = [];
        saveCartState();
        updateCartCount();
        hideModal();
    });

    // Helper: Sync count flag indicator
    function updateCartCount() {
        if (cartCountEl) {
            const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
            cartCountEl.textContent = totalItems;
        }
    }

    // Helper: Persist to storage backend
    function saveCartState() {
        localStorage.setItem('nursery_cart', JSON.stringify(cart));
    }

    // Helper: Dynamically build layout rows inside modal DOM
    function renderCartItems() {
        if (!cartItemsContainer) return;
        
        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p>Your cart is empty.</p>';
            return;
        }

        let htmlOutput = '<table style="width:100%; margin-bottom:1rem; background:none;">';
        htmlOutput += '<thead><tr><th>Item</th><th>Qty</th><th>Price</th></tr></thead><tbody>';
        
        let grandTotal = 0;
        cart.forEach(item => {
            const rowTotal = item.price * item.quantity;
            grandTotal += rowTotal;
            htmlOutput += `
                <tr>
                    <td style="border-bottom:1px solid #e0dbd1; padding:0.5rem 0;">${item.name}</td>
                    <td style="border-bottom:1px solid #e0dbd1; padding:0.5rem 0;">${item.quantity}</td>
                    <td style="border-bottom:1px solid #e0dbd1; padding:0.5rem 0;">$${rowTotal.toFixed(2)}</td>
                </tr>
            `;
        });

        htmlOutput += `</tbody></table><div style="text-align:right; font-weight:bold; font-size:1.1rem;">Total: $${grandTotal.toFixed(2)}</div>`;
        cartItemsContainer.innerHTML = htmlOutput;
    }
}

/* ==========================================================================
   5. WEB STORAGE FORM CAPTURE MODULE (Local vs Session Storage)
   ========================================================================== */
function initWebStorageForm() {
    const form = document.getElementById('feedback-order-form');
    if (!form) return;

    // Local Storage fields (Persistent across sessions - user preferences/identity)
    const nameInput = document.getElementById('user-name');
    const emailInput = document.getElementById('user-email');
    const phoneInput = document.getElementById('user-phone');

    // Session Storage fields (Transient - specific to current session order state)
    const messageInput = document.getElementById('form-message');
    const customOrderCheckbox = document.getElementById('custom-order-flag');

    // Load pre-existing data from specific storage backends on page paint
    if (localStorage.getItem('form_name')) nameInput.value = localStorage.getItem('form_name');
    if (localStorage.getItem('form_email')) emailInput.value = localStorage.getItem('form_email');
    if (localStorage.getItem('form_phone')) phoneInput.value = localStorage.getItem('form_phone');
    
    if (sessionStorage.getItem('form_message')) messageInput.value = sessionStorage.getItem('form_message');
    if (sessionStorage.getItem('form_custom_flag') === 'true') {
        customOrderCheckbox.checked = true;
    }

    // Live binding tracking listeners to back data store seamlessly as user types
    nameInput.addEventListener('input', () => localStorage.setItem('form_name', nameInput.value));
    emailInput.addEventListener('input', () => localStorage.setItem('form_email', emailInput.value));
    phoneInput.addEventListener('input', () => localStorage.setItem('form_phone', phoneInput.value));
    
    messageInput.addEventListener('input', () => sessionStorage.setItem('form_message', messageInput.value));
    customOrderCheckbox.addEventListener('change', () => {
        sessionStorage.setItem('form_custom_flag', customOrderCheckbox.checked);
    });

    // Form execution submission interception
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Final action validation before dispatch
        alert("Thank you! Your feedback/custom order has been successfully saved.");
        
        // Clear transient contextual session flags, keep identity profile data intact
        sessionStorage.removeItem('form_message');
        sessionStorage.removeItem('form_custom_flag');
        form.reset();
        
        // Re-sync identity inputs to localStorage states if kept
        if (localStorage.getItem('form_name')) nameInput.value = localStorage.getItem('form_name');
        if (localStorage.getItem('form_email')) emailInput.value = localStorage.getItem('form_email');
        if (localStorage.getItem('form_phone')) phoneInput.value = localStorage.getItem('form_phone');
    });
}