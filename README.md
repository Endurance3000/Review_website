# Product Review Platform

A comprehensive web application for reviewing products, shops, and e-commerce websites with structured data management and advanced filtering capabilities.

## Features

- **Multi-Type Reviews**: Submit reviews for products, physical shops, and e-commerce websites
- **Category Management**: Assign products to one or more predefined categories
- **Photo Uploads**: Attach multiple photos to each review
- **Review Updates**: Edit and update previously submitted reviews
- **Advanced Filtering**: Sort reviews by date (most recent), highest rating, or lowest rating
- **Type Filtering**: Filter reviews by type (products, shops, websites)
- **Personal Review History**: View all reviews submitted by the current user
- **Robust Error Handling**: Clear validation messages for missing fields and invalid categories
- **Persistent Storage**: Reviews are saved in browser local storage

## Data Structures

### Product Structure
```javascript
{
  product_id: string,      // Unique identifier
  name: string,            // Product name
  description: string,     // Product description
  categories: string[]     // Array of category strings
}
```

### Shop/Website Structure
```javascript
{
  shop_id: string,         // Unique identifier
  name: string,            // Shop/website name
  description: string      // Shop/website description
}
```

### Review Structure
```javascript
{
  review_id: string,                          // Unique identifier
  review_type: 'product' | 'shop' | 'website', // Type of review
  target_id: string,                          // References product_id or shop_id
  user_id: string,                            // User who submitted the review
  rating: number,                             // Integer 1-5
  text: string,                               // Review body text
  photos: string[],                           // Array of photo URLs
  created_at: string,                         // ISO datetime string
  updated_at: string | null                   // ISO datetime string or null
}
```

### User Structure
```javascript
{
  user_id: string,         // Unique identifier
  user_name: string        // Display name
}
```

## Available Categories

- headphones
- mobile_phones
- dongles
- lamps
- clothes
- kitchen_utensils
- electronics
- home_garden
- sports
- books
- toys
- other

## Usage

### Submitting a Review

1. Navigate to the "Submit Review" tab
2. Enter your name
3. Select review type (Product, Shop, or E-Commerce Website)
4. Enter the product/shop/website name and optional description
5. **For products only**: Select at least one category
6. Select a star rating (1-5 stars)
7. Write your review text
8. Optionally upload photos
9. Click "Submit Review"

### Viewing Reviews

1. Navigate to the "View Reviews" tab
2. Use filters to sort by:
   - Most Recent
   - Highest Rating
   - Lowest Rating
3. Filter by type (All, Products, Shops, Websites)

### Editing Reviews

1. Navigate to the "My Reviews" tab
2. Click "Edit" on any review you've submitted
3. Modify the rating and/or review text
4. Click "Update Review"

## Error Handling

### Missing Required Fields
If required fields are omitted, the system displays an error listing all missing fields:
```
Missing required fields: Rating, Review Text
```

### Invalid Categories
If an invalid category is selected or no categories are chosen for a product review:
```
At least one category must be selected. Available categories: headphones, mobile_phones, dongles, lamps, clothes, kitchen_utensils, electronics, home_garden, sports, books, toys, other
```

## Validation

After each major action:
- **Review Submission**: Console logs confirmation with review ID
- **Review Update**: Console logs confirmation with update timestamp

## Installation

1. Clone or download the project files
2. Open `index.html` in a modern web browser
3. No server or build process required - runs entirely in the browser

## Files

- `index.html` - Main HTML structure and UI components
- `styles.css` - Complete styling with responsive design
- `app.js` - Application logic, data management, and validation
- `README.md` - This documentation file

## Browser Compatibility

- Chrome (recommended)
- Firefox
- Safari
- Edge

Requires modern browser with ES6 support and localStorage API.

## Technical Implementation

- **Storage**: Browser localStorage for data persistence
- **UI**: Vanilla JavaScript with DOM manipulation
- **Styling**: Modern CSS with gradients, animations, and responsive design
- **Validation**: Client-side form validation with detailed error messages
- **Image Handling**: FileReader API for photo previews and storage

## Future Enhancements

- User authentication system
- Backend API integration
- Image compression and optimization
- Search functionality
- Review comments and replies
- User profiles
- Export reviews as PDF/CSV
