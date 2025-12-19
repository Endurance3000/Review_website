// Data Storage
let reviews = [];
let products = [];
let shops = [];
let currentUser = null;

// Available categories list
const AVAILABLE_CATEGORIES = [
    'headphones', 'mobile_phones', 'dongles', 'lamps', 'clothes',
    'kitchen_utensils', 'electronics', 'home_garden', 'sports',
    'books', 'toys', 'other'
];

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    loadFromLocalStorage();
    initializeTabs();
    initializeReviewForm();
    initializeEditModal();
    initializeFilters();
    displayReviews();
});

// Tab Management
function initializeTabs() {
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabName = button.getAttribute('data-tab');
            
            // Remove active class from all tabs
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Add active class to clicked tab
            button.classList.add('active');
            document.getElementById(`${tabName}-tab`).classList.add('active');
            
            // Refresh display based on tab
            if (tabName === 'view') {
                displayReviews();
            } else if (tabName === 'my-reviews') {
                displayMyReviews();
            }
        });
    });
}

// Review Form Handling
function initializeReviewForm() {
    const form = document.getElementById('review-form');
    const reviewType = document.getElementById('review_type');
    const categoriesGroup = document.getElementById('categories-group');
    const photoInput = document.getElementById('photos');

    // Show/hide categories based on review type
    reviewType.addEventListener('change', (e) => {
        if (e.target.value === 'product') {
            categoriesGroup.style.display = 'block';
        } else {
            categoriesGroup.style.display = 'none';
        }
    });

    // Photo preview
    photoInput.addEventListener('change', handlePhotoPreview);

    // Form submission
    form.addEventListener('submit', handleReviewSubmit);
}

function handlePhotoPreview(e) {
    const preview = document.getElementById('photo-preview');
    preview.innerHTML = '';
    
    const files = Array.from(e.target.files);
    files.forEach(file => {
        const reader = new FileReader();
        reader.onload = (event) => {
            const img = document.createElement('img');
            img.src = event.target.result;
            preview.appendChild(img);
        };
        reader.readAsDataURL(file);
    });
}

function handleReviewSubmit(e) {
    e.preventDefault();
    
    const formError = document.getElementById('form-error');
    formError.classList.remove('show');
    formError.textContent = '';

    try {
        // Validate and collect form data
        const formData = validateAndCollectFormData();
        
        // Create user if needed
        if (!currentUser || currentUser.user_name !== formData.user_name) {
            currentUser = createUser(formData.user_name);
        }

        // Create or get target entity (product/shop/website)
        const targetId = createOrGetTargetEntity(formData);

        // Create review
        const review = createReview(formData, targetId, currentUser.user_id);
        
        // Save and display
        reviews.push(review);
        saveToLocalStorage();
        
        // Show success message
        showSuccessMessage('Review submitted successfully!');
        
        // Reset form
        e.target.reset();
        document.getElementById('photo-preview').innerHTML = '';
        
        // Validation: Check if review was added
        const addedReview = reviews.find(r => r.review_id === review.review_id);
        if (addedReview) {
            console.log('✓ Review successfully added with ID:', review.review_id);
        }
        
    } catch (error) {
        formError.textContent = error.message;
        formError.classList.add('show');
    }
}

function validateAndCollectFormData() {
    const missingFields = [];
    
    const user_name = document.getElementById('user_name').value.trim();
    const review_type = document.getElementById('review_type').value;
    const target_name = document.getElementById('target_name').value.trim();
    const target_description = document.getElementById('target_description').value.trim();
    const rating = document.querySelector('input[name="rating"]:checked');
    const review_text = document.getElementById('review_text').value.trim();
    
    // Check required fields
    if (!user_name) missingFields.push('Your Name');
    if (!review_type) missingFields.push('Review Type');
    if (!target_name) missingFields.push('Product/Shop/Website Name');
    if (!rating) missingFields.push('Rating');
    if (!review_text) missingFields.push('Review Text');
    
    if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }

    // Get categories (only for products)
    let categories = [];
    if (review_type === 'product') {
        const selectedCategories = Array.from(
            document.querySelectorAll('input[name="category"]:checked')
        ).map(cb => cb.value);
        
        if (selectedCategories.length === 0) {
            throw new Error(`At least one category must be selected. Available categories: ${AVAILABLE_CATEGORIES.join(', ')}`);
        }
        
        // Validate categories
        const invalidCategories = selectedCategories.filter(
            cat => !AVAILABLE_CATEGORIES.includes(cat)
        );
        
        if (invalidCategories.length > 0) {
            throw new Error(
                `Invalid categories: ${invalidCategories.join(', ')}. ` +
                `Available categories: ${AVAILABLE_CATEGORIES.join(', ')}`
            );
        }
        
        categories = selectedCategories;
    }

    // Get photos
    const photoFiles = Array.from(document.getElementById('photos').files);
    const photos = [];
    photoFiles.forEach((file, index) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        photos.push({
            url: URL.createObjectURL(file),
            data: reader.result,
            filename: file.name
        });
    });

    return {
        user_name,
        review_type,
        target_name,
        target_description,
        categories,
        rating: parseInt(rating.value),
        review_text,
        photos
    };
}

function createUser(user_name) {
    return {
        user_id: generateId('user'),
        user_name: user_name
    };
}

function createOrGetTargetEntity(formData) {
    const { review_type, target_name, target_description, categories } = formData;
    
    if (review_type === 'product') {
        // Check if product exists
        let product = products.find(p => 
            p.name.toLowerCase() === target_name.toLowerCase()
        );
        
        if (!product) {
            product = {
                product_id: generateId('product'),
                name: target_name,
                description: target_description || '',
                categories: categories
            };
            products.push(product);
        } else {
            // Update categories if needed
            const newCategories = [...new Set([...product.categories, ...categories])];
            product.categories = newCategories;
        }
        
        return product.product_id;
        
    } else if (review_type === 'shop' || review_type === 'website') {
        // Check if shop/website exists
        let shop = shops.find(s => 
            s.name.toLowerCase() === target_name.toLowerCase()
        );
        
        if (!shop) {
            shop = {
                shop_id: generateId('shop'),
                name: target_name,
                description: target_description || ''
            };
            shops.push(shop);
        }
        
        return shop.shop_id;
    }
}

function createReview(formData, targetId, userId) {
    const now = new Date().toISOString();
    
    return {
        review_id: generateId('review'),
        review_type: formData.review_type,
        target_id: targetId,
        user_id: userId,
        rating: formData.rating,
        text: formData.review_text,
        photos: formData.photos.map(p => p.url),
        created_at: now,
        updated_at: null
    };
}

// Display Reviews
function displayReviews() {
    const container = document.getElementById('reviews-container');
    const filter = document.getElementById('filter').value;
    const typeFilter = document.getElementById('type-filter').value;
    
    let filteredReviews = [...reviews];
    
    // Filter by type
    if (typeFilter !== 'all') {
        filteredReviews = filteredReviews.filter(r => r.review_type === typeFilter);
    }
    
    // Sort reviews
    filteredReviews.sort((a, b) => {
        switch (filter) {
            case 'recent':
                return new Date(b.created_at) - new Date(a.created_at);
            case 'highest':
                return b.rating - a.rating;
            case 'lowest':
                return a.rating - b.rating;
            default:
                return 0;
        }
    });
    
    if (filteredReviews.length === 0) {
        container.innerHTML = '<div class="empty-state"><p>No reviews yet. Be the first to submit one!</p></div>';
        return;
    }
    
    container.innerHTML = filteredReviews.map(review => createReviewCard(review, false)).join('');
}

function displayMyReviews() {
    const container = document.getElementById('my-reviews-container');
    
    if (!currentUser) {
        container.innerHTML = '<div class="empty-state"><p>Submit a review to see your reviews here.</p></div>';
        return;
    }
    
    const myReviews = reviews.filter(r => r.user_id === currentUser.user_id);
    
    if (myReviews.length === 0) {
        container.innerHTML = '<div class="empty-state"><p>You have not submitted any reviews yet.</p></div>';
        return;
    }
    
    // Sort by most recent
    myReviews.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    
    container.innerHTML = myReviews.map(review => createReviewCard(review, true)).join('');
}

function createReviewCard(review, showActions) {
    const target = getTargetEntity(review);
    const stars = '★'.repeat(review.rating) + '☆'.repeat(5 - review.rating);
    const date = new Date(review.created_at).toLocaleDateString();
    const categories = getTargetCategories(review);
    
    const photosHTML = review.photos.length > 0 ? `
        <div class="review-photos">
            ${review.photos.map(photo => `<img src="${photo}" alt="Review photo">`).join('')}
        </div>
    ` : '';
    
    const categoriesHTML = categories.length > 0 ? `
        <div class="review-categories">
            ${categories.map(cat => `<span class="category-tag">${cat.replace('_', ' ')}</span>`).join('')}
        </div>
    ` : '';
    
    const actionsHTML = showActions ? `
        <div class="review-actions">
            <button class="btn-secondary" onclick="editReview('${review.review_id}')">Edit</button>
        </div>
    ` : '';
    
    const updateInfo = review.updated_at ? `<br><small>(Updated: ${new Date(review.updated_at).toLocaleDateString()})</small>` : '';
    
    return `
        <div class="review-card">
            <div class="review-header">
                <div class="review-title">
                    <span class="review-type-badge ${review.review_type}">${review.review_type}</span>
                    <h3>${target.name}</h3>
                    <p class="review-meta">By ${currentUser ? currentUser.user_name : 'Anonymous'} on ${date}${updateInfo}</p>
                </div>
            </div>
            <div class="review-rating">${stars}</div>
            ${categoriesHTML}
            <p class="review-text">${review.text}</p>
            ${photosHTML}
            ${actionsHTML}
        </div>
    `;
}

function getTargetEntity(review) {
    if (review.review_type === 'product') {
        return products.find(p => p.product_id === review.target_id) || { name: 'Unknown Product' };
    } else {
        return shops.find(s => s.shop_id === review.target_id) || { name: 'Unknown Shop' };
    }
}

function getTargetCategories(review) {
    if (review.review_type === 'product') {
        const product = products.find(p => p.product_id === review.target_id);
        return product ? product.categories : [];
    }
    return [];
}

// Edit Review Modal
function initializeEditModal() {
    const modal = document.getElementById('edit-modal');
    const closeBtn = modal.querySelector('.close');
    const editForm = document.getElementById('edit-form');
    
    closeBtn.addEventListener('click', () => {
        modal.classList.remove('show');
    });
    
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('show');
        }
    });
    
    editForm.addEventListener('submit', handleEditSubmit);
}

function editReview(reviewId) {
    const review = reviews.find(r => r.review_id === reviewId);
    if (!review) return;
    
    // Populate edit form
    document.getElementById('edit_review_id').value = review.review_id;
    document.getElementById('edit_review_text').value = review.text;
    
    // Set rating
    const ratingInput = document.querySelector(`input[name="edit_rating"][value="${review.rating}"]`);
    if (ratingInput) ratingInput.checked = true;
    
    // Show modal
    document.getElementById('edit-modal').classList.add('show');
}

function handleEditSubmit(e) {
    e.preventDefault();
    
    const formError = document.getElementById('edit-error');
    formError.classList.remove('show');
    formError.textContent = '';
    
    try {
        const reviewId = document.getElementById('edit_review_id').value;
        const rating = document.querySelector('input[name="edit_rating"]:checked');
        const text = document.getElementById('edit_review_text').value.trim();
        
        const missingFields = [];
        if (!rating) missingFields.push('Rating');
        if (!text) missingFields.push('Review Text');
        
        if (missingFields.length > 0) {
            throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
        }
        
        // Update review
        const review = reviews.find(r => r.review_id === reviewId);
        if (review) {
            review.rating = parseInt(rating.value);
            review.text = text;
            review.updated_at = new Date().toISOString();
            
            saveToLocalStorage();
            
            // Validation: Check if review was updated
            const updatedReview = reviews.find(r => r.review_id === reviewId);
            if (updatedReview.updated_at) {
                console.log('✓ Review successfully updated at:', updatedReview.updated_at);
            }
            
            // Close modal and refresh
            document.getElementById('edit-modal').classList.remove('show');
            displayMyReviews();
            displayReviews();
            
            showSuccessMessage('Review updated successfully!');
        }
        
    } catch (error) {
        formError.textContent = error.message;
        formError.classList.add('show');
    }
}

// Filters
function initializeFilters() {
    document.getElementById('filter').addEventListener('change', displayReviews);
    document.getElementById('type-filter').addEventListener('change', displayReviews);
}

// Helper Functions
function generateId(prefix) {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function showSuccessMessage(message) {
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.textContent = message;
    
    const form = document.getElementById('review-form');
    form.insertBefore(successDiv, form.firstChild);
    
    setTimeout(() => {
        successDiv.remove();
    }, 3000);
}

// Local Storage
function saveToLocalStorage() {
    localStorage.setItem('reviews', JSON.stringify(reviews));
    localStorage.setItem('products', JSON.stringify(products));
    localStorage.setItem('shops', JSON.stringify(shops));
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
}

function loadFromLocalStorage() {
    const savedReviews = localStorage.getItem('reviews');
    const savedProducts = localStorage.getItem('products');
    const savedShops = localStorage.getItem('shops');
    const savedUser = localStorage.getItem('currentUser');
    
    if (savedReviews) reviews = JSON.parse(savedReviews);
    if (savedProducts) products = JSON.parse(savedProducts);
    if (savedShops) shops = JSON.parse(savedShops);
    if (savedUser) currentUser = JSON.parse(savedUser);
}
