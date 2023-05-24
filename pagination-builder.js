/*
	--- --- --- ---> P L U S H        S T R U C T U R E <--- --- --- ---
	<div class="pagination" id="pagination">
		-----> H E R E        P R E V I O U S        B U T T O N        W I L L         B E        P A L A C E D <-----
		<div class="pages">
			  -----> H E R E        I N D E X        T A B S        W I L L         B E        P A L A C E D <-----
		</div>
		<%= if (product_listing.Pit && category) { %>
			↓↓↓↓ This element "#next-page-data" must hold the same ID and all this attributes and data from plush
			<i 
				id="next-page-data" hidden
				next_page="<%= next_page %>"
				display_result="<%= product_listing.DisplayResult %>" 
				pit="<%= product_listing.Pit %>"
				total_result="<%= product_listing.TotalResult %>"
				category_url="<%= category.CategorySeoUrl %>"
			>
			</i>
		<% } %>
		-----> H E R E        N E X T        B U T T O N        W I L L         B E        P A L A C E D <-----
	</div>

	 --- --- --- ---> I N S I D E        J S <--- --- --- ---
	import { createPagination } from "./paginationBuilder.js";
	const createPaginationData = { 
		// E L E M E N T S
		↓↓↓↓ This is the div that wraps all your products 
		productsDiv: document.getElementById("products-result"),  
		↓↓↓↓ This is the next page token element that holds all the data
		nextPageData: document.querySelector("#next-page-data"),  
		// D A T A
		↓↓↓↓ Default number of indexes you want "must be a number and not less than 1"
		maxTabsNumber: 3,  
	
		// C A L L B A C K S
		↓↓↓↓ All your callbacks that want to execute after appending the new products from indexes, "must be an array of functions"
		callbacksToBeExecutedAfterAppendingProducts: [function1, function2, ....]
	}
	createPagination(createPaginationData);
*/

// Extracts elements from an HTML string using a CSS selector
const extractElements = (htmlData, selector) => {
	const parser = new DOMParser();
	const doc = parser.parseFromString(htmlData, "text/html");
	return Array.from(doc.querySelectorAll(selector)); 
};

const dataFetching = async (api) => {
	const response = await fetch(api);
	const data = await response.text();
	const products = await extractElements(data, ".products-grid .product-card");
	return products;
};

const nextPageFetching = async (api) => {
	const response = await fetch(api);
	const data = await response.text();
	const newNextPageData = await extractElements(data, "#next-page-data");
	const newNextPage = newNextPageData[0]?.getAttribute("next_page");
	return newNextPage
};

const getPageUrl = async (url, categoryUrl, displayedResults) => {
	const nextPageToken = await nextPageFetching(url);
	const pageUrl = `/categories/${categoryUrl}/?display_result=${displayedResults}&next_page=${nextPageToken}&dom=true`;
    return pageUrl;
};

const addButtonToTargetDiv = (text, selector, url = null, position = "last") => {
	const button = document.createElement("button");
	button.type = "button";
	button.classList.add("pagination-page", "p-regular-16px-400", `action-${text}`);
	button.textContent = text;
	if (url) {
		button.setAttribute("url", url);
	}
	const targetDiv = document.querySelector(selector);
	if (position === 'first') {
		targetDiv.insertBefore(button, targetDiv.firstChild);
	} else {
		targetDiv.appendChild(button);
	}
}
///////////////////////////////////////////////////////////
const fetchingLastTabsFromBtns = async (
	btn, 
	categoryUrl, 
	displayedResults, 
	productsDiv, 
	callbacksToBeExecutedAfterAppendingProducts,
	maxTabsNumber,
	numberOfPages
) => {
	const btnIndex = btn.innerText;
	let allBtns = document.querySelectorAll(".pages .pagination-page");
	const firstTab = allBtns[allBtns.length - maxTabsNumber];
	const firstTabIndex = firstTab.innerText;
	const lastTab = allBtns[allBtns.length - 1];
	const lastTabIndex = lastTab.innerText;
	const prevBtn = document.querySelector(".action-Prev");
	const nextBtn = document.querySelector(".action-Next");
	let NumberOfPaginationTabs = Math.min(numberOfPages, maxTabsNumber);
	let remainingPages = numberOfPages - NumberOfPaginationTabs;
	
	if (btnIndex == firstTabIndex) {
		if (btnIndex != 1) {
			toggleDisablingBtnState(nextBtn, "activated");
			toggleDisablingBtnState(prevBtn, "disabled");
			lastTab.remove();
			allBtns = document.querySelectorAll(".pages .pagination-page");
			let i = allBtns.length;
			while (i > 0) {
				if (allBtns[i] && allBtns[i - 1].style.display === "none") {
					allBtns[i - 1].style.display = "block";
					return;
				}
				i--;
				if (allBtns.length > 3) {
					toggleDisablingBtnState(prevBtn, "activated");
				}
			}
		}
		
	} else if (btnIndex == lastTabIndex) {
		toggleDisablingBtnState(nextBtn, "disabled");
		toggleDisablingBtnState(prevBtn, "activated");
		
		const lastTab = document.querySelector(".pages .pagination-page:last-of-type");
		const lastPageUrl = lastTab.getAttribute("url");
		const currentIndex = +lastTab.innerText + 1;
		let newPageUrl = await getPageUrl(lastPageUrl,categoryUrl, displayedResults);
		addButtonToTargetDiv(currentIndex, "#pagination .pages", newPageUrl);
		firstTab.style.display = "none";
		const newTab = document.querySelector(".pagination-page:last-of-type");
		const nextPageUrl = newTab.getAttribute("url");
		newTab.addEventListener("click",()=>{appendingProducts(nextPageUrl, newTab, productsDiv, callbacksToBeExecutedAfterAppendingProducts)});

		remainingPages--;
		if (remainingPages > 0) {
			toggleDisablingBtnState(nextBtn, "activated");
		}
	}
} 
//////////////////////////////////////////////////////////////////////////////////////////////////////
const appendingProducts = async (apiToNextPage, button, productsDiv, callbacks) => {
	const products = await dataFetching(apiToNextPage);
	productsDiv.innerHTML = "";
	products.forEach((product) => {
		productsDiv.appendChild(product);
	});
	callbacks.forEach(callback => callback())
	const currentUrl = button.getAttribute("url").split("&dom=true")[0];
	history.pushState(null, null, currentUrl);
	checkWhereAreYou();
};

const toggleDisablingBtnState = (btn, state) => {
	if (state === "disabled") {
		btn.disabled = true;
		btn.classList.add("disabled");
	} else if (state === "activated") {
		btn.disabled = false;
		btn.classList.remove("disabled");
	}
}

const checkWhereAreYou = () => {
	const btnTabs = document.querySelectorAll(".pagination-page");
	btnTabs.forEach(btn => {
		btn.classList.remove("active");
	})
	let currentLocation;
	if (window.location.search.length > 0) {
		currentLocation = window.location.pathname + window.location.search;
	} else {
		currentLocation = window.location.pathname;
	}

	const activeBtn = document.querySelector(`button[url="${currentLocation}&dom=true"]`);
	if (activeBtn) {
		activeBtn.classList.add("active");
	}
}

// Validation function for createPaginationData object
function validateCreatePaginationData(data) {
  // Check if productsDiv is a valid element
  if (!(data.nextPageData instanceof Element) && data.nextPageData === undefined) {
    throw new Error("productsDiv must be a valid element that will wrap all your products cards");
  }

  if (!(data.nextPageData instanceof Element) && data.nextPageData === undefined) {
    throw new Error("nextPageData must be a valid element");
  }

  const requiredAttributes = ["next_page", "total_result", "display_result", "category_url"];
  for (const attr of requiredAttributes) {
    if (!data.nextPageData.hasAttribute(attr)) {
      throw new Error(`nextPageData must have the attribute: ${attr}`);
    }
  }

  // Check if maxTabsNumber is a number and more than 1
  if (typeof data.maxTabsNumber !== "number" || data.maxTabsNumber <= 1) {
    throw new Error("maxTabsNumber must be a number greater than 1");
  }

  // Check if callbacksToBeExecutedAfterAppendingProducts is an array with length more than 0
  if (!Array.isArray(data.callbacksToBeExecutedAfterAppendingProducts) || data.callbacksToBeExecutedAfterAppendingProducts.length === 0) {
    throw new Error("callbacksToBeExecutedAfterAppendingProducts must be an array with length greater than 0");
  }

  // Check if elements of callbacksToBeExecutedAfterAppendingProducts are functions
  for (const callback of data.callbacksToBeExecutedAfterAppendingProducts) {
    if (typeof callback !== "function") {
      throw new Error("callbacksToBeExecutedAfterAppendingProducts must contain only functions");
    }
  }

  // Validation passed
  console.log("Pagination data is valid!!");
}

const createStartingPaginationTabs = async (
	numberOfPages,
	maxTabsNumber, 
	categoryUrl, 
	displayedResults, 
	productsDiv, 
	callbacksToBeExecutedAfterAppendingProducts,
	remainingPages
) => {
	let NumberOfPaginationTabs = Math.min(numberOfPages, maxTabsNumber);
	const pageUrl = `/categories/${categoryUrl}/`;
	addButtonToTargetDiv("1", "#pagination .pages", pageUrl);
	while(NumberOfPaginationTabs > 1) {
		const lastTab = document.querySelector(".pagination-page:last-of-type");
		const lastPageUrl = lastTab.getAttribute("url");
		const currentIndex = +lastTab.innerText + 1;
		let newPageUrl = await getPageUrl(lastPageUrl, categoryUrl, displayedResults);
		addButtonToTargetDiv(currentIndex, "#pagination .pages", newPageUrl);
		NumberOfPaginationTabs--;
	}	
	let tabBtns = document.querySelectorAll(".pagination-page");
	tabBtns.forEach(btn => {
		const targetUrl = btn.getAttribute("url");
		// btn.addEventListener("click",()=>{appendingProducts(targetUrl, btn, productsDiv, callbacksToBeExecutedAfterAppendingProducts)})
		btn.addEventListener("click",() => {
			appendingProducts(targetUrl, btn, productsDiv, callbacksToBeExecutedAfterAppendingProducts)
			fetchingLastTabsFromBtns(
				btn, 
				categoryUrl, 
				displayedResults, 
				productsDiv, 
				callbacksToBeExecutedAfterAppendingProducts,
				maxTabsNumber,
				numberOfPages
			) 
		})
		
	})
}

const createNextAndPrevBtns = (
	numberOfPages, 
	maxTabsNumber, 
	categoryUrl, 
	displayedResults, 
	productsDiv, 
	callbacksToBeExecutedAfterAppendingProducts, 
	NumberOfPaginationTabs
) => {
	addButtonToTargetDiv("Prev", "#pagination", null, "first");
	addButtonToTargetDiv("Next", "#pagination");
	const prevBtn = document.querySelector(".action-Prev");
	const nextBtn = document.querySelector(".action-Next");
	toggleDisablingBtnState(prevBtn, "disabled");
	let remainingPages = numberOfPages - NumberOfPaginationTabs;
	
	nextBtn.addEventListener("click", async () => {
		if (remainingPages > 0 && !nextBtn.disabled) {   
			toggleDisablingBtnState(nextBtn, "disabled");
			toggleDisablingBtnState(prevBtn, "activated");
			
			const lastTab = document.querySelector(".pages .pagination-page:last-of-type");
			const lastPageUrl = lastTab.getAttribute("url");
			const currentIndex = +lastTab.innerText + 1;
			let newPageUrl = await getPageUrl(lastPageUrl,categoryUrl, displayedResults);
			addButtonToTargetDiv(currentIndex, "#pagination .pages", newPageUrl);
			const newTab = document.querySelector(".pagination-page:last-of-type");
			const nextPageUrl = newTab.getAttribute("url");
			newTab.addEventListener("click",()=>{appendingProducts(nextPageUrl, newTab, productsDiv, callbacksToBeExecutedAfterAppendingProducts)});
			
			const allBtns = document.querySelectorAll(".pages .pagination-page");
			const firstTab = allBtns[allBtns.length - 4];
			firstTab.style.display = "none";
			
			remainingPages--;
			if (remainingPages > 0) {
				toggleDisablingBtnState(nextBtn, "activated");
			}
		}
	})
	prevBtn.addEventListener("click", () => {
		if (!prevBtn.disabled) {
			remainingPages++;
			toggleDisablingBtnState(nextBtn, "activated");
			toggleDisablingBtnState(prevBtn, "disabled");
			let allBtns = document.querySelectorAll(".pages .pagination-page");
			const lastTab = allBtns[allBtns.length - 1]
			lastTab.remove();

			allBtns = document.querySelectorAll(".pages .pagination-page");
			const hiddenTab = allBtns[allBtns.length - maxTabsNumber];
			hiddenTab.style.display = "block";
			if (allBtns.length > 3) {
				toggleDisablingBtnState(prevBtn, "activated");
			}
		}
	})
}

export const createPagination = async (createPaginationData) => {
	try {
		validateCreatePaginationData(createPaginationData);
	} catch (error) {
		console.error("Validation error:", error);
		return;
	}
	const { productsDiv, nextPageData, maxTabsNumber, callbacksToBeExecutedAfterAppendingProducts } = createPaginationData;
	const next_page = nextPageData?.getAttribute("next_page");
	const totalRestul = nextPageData?.getAttribute("total_result");
	const displayedResults = nextPageData?.getAttribute("display_result");
	const categoryUrl = nextPageData?.getAttribute("category_url");
	const numberOfPages = Math.ceil(totalRestul / displayedResults);
	
	if (numberOfPages <= 1) {
		return;
	}

	await createStartingPaginationTabs(
		numberOfPages, 
		maxTabsNumber, 
		categoryUrl, 
		displayedResults, 
		productsDiv, 
		callbacksToBeExecutedAfterAppendingProducts
	);
	let NumberOfPaginationTabs = Math.min(numberOfPages, maxTabsNumber);
	
	if (numberOfPages > NumberOfPaginationTabs) {
		await createNextAndPrevBtns(
			numberOfPages, 
			maxTabsNumber, 
			categoryUrl, 
			displayedResults, 
			productsDiv, 
			callbacksToBeExecutedAfterAppendingProducts, 
			NumberOfPaginationTabs
		)
	}
	checkWhereAreYou();
}