const URL_BASE = "http://makeup-api.herokuapp.com/api/v1/";

let allProducts = [];
let filteredProducts= [];

const main = document.querySelector("main");
const catalogSection = document.querySelector("section");
const nameSearch = document.querySelector("#filter-name");
const brandSearch = document.querySelector("#filter-brand");
const typeSearch = document.querySelector("#filter-type");
const orderSearch = document.querySelector("#sort-type");

async function start() {

  const loading = document.createElement("div");
  loading.classList.add("loading");
  loading.innerHTML = `<h3>Loading Catalog...</h3><p><img src="./img/loading.gif" alt="Loading Catalog"/></p>`;
  main.appendChild(loading);

  await fetchProducts();

  loadBrands();
  loadTypes();
  
  enableControls();
  enableEvents();

  render();

  main.removeChild(loading);
  
}

async function fetchProducts() {
  const resource = await fetch(`${URL_BASE}/products.json`);
  const json = await resource.json();

  allProducts = json.map(({ id, brand, name, price, product_type, rating, category, api_featured_image }) => {
    const newPrice = (+price * 5.5).toFixed(2);
    const formattedPrice = (newPrice).toLocaleString('pt-br',{style: 'currency', currency: 'BRL'});
    return {
      id, 
      brand,
      name,
      formattedPrice,
      price: newPrice,
      product_type,
      rating,
      category,
      image_link: api_featured_image,
    }
  });

  filteredProducts = allProducts.slice();
}

function getProduct(id) { 
  return filteredProducts.find(product => product.id == id);
}

function loadBrands() {
  const brandsMap = allProducts.reduce((entryMap, e) => entryMap.set(e.brand, [...entryMap.get(e.brand)||[], e]), new Map());
  const brands = Array.from(brandsMap.keys()).sort();
  
  brands.map(brand => {
    if (brand) {
      const elem = document.createElement("option");
      elem.innerHTML = brand; 
      brandSearch.appendChild(elem);    
    }
  });
}

function loadTypes() {
  const typesMap = allProducts.reduce((entryMap, e) => entryMap.set(e.product_type, [...entryMap.get(e.product_type)||[], e]), new Map());
  const types = Array.from(typesMap.keys()).sort();
  
  types.map(type => {
    if (type) {
      const elem = document.createElement("option");
      elem.innerHTML = type; 
      typeSearch.appendChild(elem);    
    }
  });
}

function enableControls() {
  nameSearch.disabled = false;
  brandSearch.disabled = false;
  typeSearch.disabled = false;
  orderSearch.disabled = false;
  nameSearch.focus();
}

function enableEvents() {
  nameSearch.addEventListener("input", withDelay(filter, 500));  
  brandSearch.addEventListener("change", () => filter());  
  typeSearch.addEventListener("change", () => filter());
  orderSearch.addEventListener("change", () => filter());
}

function addEvents() {
  filteredProducts.map(product => {
    let productElem = document.querySelector(`[tabindex = "${product.id}"]`);
    productElem.addEventListener("click", () => {    
      const productDetails = getProduct(product.id);    
      loadDetails(productDetails, productElem);    
    });
  });
}

function filter() {
  let tempProducts = [];
  filteredProducts = allProducts.slice(); 
  
  if (nameSearch.value != "") {
    tempProducts = filteredProducts.filter(product => product.name.toLowerCase().includes(nameSearch.value.toLowerCase()));
    filteredProducts = tempProducts.slice();
  } 

  if (brandSearch.value != "") {
    tempProducts = filteredProducts.filter(product => product.brand == brandSearch.value);
    filteredProducts = tempProducts.slice();
  } 

  if (typeSearch.value != "") {
    tempProducts = filteredProducts.filter(product => product.product_type == typeSearch.value);
    filteredProducts = tempProducts.slice();
  } 

  render();
}

function withDelay(fn, delay) {
  let timeout;
  return function () {
    clearTimeout(timeout);
    timeout = setTimeout(fn, delay);
  };
}

function doFilterProductsByName() {  
  const lowerCaseSearchTerm = nameSearch.value.toLocaleLowerCase();
  if (lowerCaseSearchTerm != "")
    filteredProducts = allProducts.filter(product => product.name.includes(lowerCaseSearchTerm));
}

function doFilterProductsByBrand(searchTerm) {
  if (searchTerm != "")
    filteredProducts = allProducts.filter(product => product.brand == searchTerm);
}

function doFilterProductsByType() {
  if (typeSearch.value != "Todos")
    filteredProducts = allProducts.filter(product => product.product_type == typeSearch.value);
}

function orderBy() {
  switch (orderSearch.value) {
    case "1":
     filteredProducts.sort((a, b) => b.rating - a.rating);
     break;
    case "2":
     filteredProducts.sort((a, b) => a.price - b.price);
     break;
    case "3":
     filteredProducts.sort((a, b) => b.price - a.price);
     break;
    case "4":
     filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
     break;
    case "5":
     filteredProducts.sort((a, b) => b.name.localeCompare(a.name));       
     break; 
    default:
      break;
  }
}

function render() {
  orderBy();

  const content = `${filteredProducts.map(product => {
    return `
      <div class="product" data-name="${product.name}" data-brand="${product.brand}" data-type="${product.product_type}" tabindex="${product.id}">
        <figure class="product-figure">
        <img src="${product.image_link}" width="215" height="215" alt="${product.name}" onerror="javascript:this.src='img/unavailable.png'">
        </figure>
        <section class="product-description">
          <h1 class="product-name">${product.name}</h1>
          <div class="product-brands"><span class="product-brand background-brand">${product.brand}</span>
            <span class="product-brand background-price">${product.formattedPrice}</span></div>
        </section> 
      </div>`;
  }).join("")}`;

  catalogSection.innerHTML = content;

  addEvents();
}

function loadDetails(product, elem) {
  let details = `<div class="details-row">
        <div>Brand</div>
        <div class="details-bar">
          <div class="details-bar-bg" style="width= 250">${product.brand}</div>
        </div>
      </div><div class="details-row">
        <div>Price</div>
        <div class="details-bar">
          <div class="details-bar-bg" style="width= 250">${product.price}</div>
        </div>
      </div><div class="details-row">
        <div>Rating</div>
        <div class="details-bar">
          <div class="details-bar-bg" style="width= 250">${product.rating}</div>
        </div>
      </div><div class="details-row">
        <div>Category</div>
        <div class="details-bar">
          <div class="details-bar-bg" style="width= 250">${product.category}</div>
        </div>
      </div><div class="details-row">
        <div>Product_type</div>
        <div class="details-bar">
          <div class="details-bar-bg" style="width= 250">${product.product_type}</div>
        </div>
      </div>`;

  const productDetails = document.createElement("section");
  productDetails.classList.add("product-details");
  productDetails.innerHTML = details;

  elem.appendChild(productDetails);
}
  

start();

