# Lexmodo System Pagination
This README file explains how to build pagination for the Lexmodo system. The pagination is used on the category products list in the category page to change the token provided by the system (<%= next_page %>) into a full pagination with index tabs and next/previous buttons, as requested in the design.

## Structure
```html
<div class="pagination" id="pagination">
    <!-- PREVIOUS BUTTON -->
    <!-- Here the previous button will be placed -->
    
    <div class="pages">
        <!-- INDEX TABS -->
        <!-- Here the index tabs will be placed -->
    </div>
    
    <% if (product_listing.Pit && category) { %>
        <!-- NEXT PAGE DATA ELEMENT -->
        <!-- This element "#next-page-data" must hold the same ID and all these attributes and data from plush -->
        <i id="next-page-data" hidden
            next_page="<%= next_page %>"
            display_result="<%= product_listing.DisplayResult %>"
            pit="<%= product_listing.Pit %>"
            total_result="<%= product_listing.TotalResult %>"
            category_url="<%= category.CategorySeoUrl %>">
        </i>
    <% } %>
    
    <!-- NEXT BUTTON -->
    <!-- Here the next button will be placed -->
</div>
```
## Inside JS
Import the 'createPagination' function from 'paginationBuilder.js' and use it to create the pagination.
```javascript
import { createPagination } from "./paginationBuilder.js";

const createPaginationData = { 
    // ELEMENTS
    // This is the div that wraps all your products
    productsDiv: document.getElementById("products-result"),  
    
    // This is the next page token element that holds all the data
    nextPageData: document.querySelector("#next-page-data"),  
    
    /*
    DATA
    Default number of indexes you want (must be a number and not less than 1)
    */
    maxTabsNumber: 3,  
    
    /*
    CALLBACKS
    All your callbacks that you want to execute after appending the new 
    products from indexes (must be an array of functions)
    */
    callbacksToBeExecutedAfterAppendingProducts: [function1, function2, ....]
};

createPagination(createPaginationData);
```
Note: The comments in the code provide guidance on where to place the previous button, index tabs, next button, and other relevant elements.
