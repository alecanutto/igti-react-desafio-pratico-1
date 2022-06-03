const URL_BASE = "http://makeup-api.herokuapp.com/api/v1/";

let allProducts = [];
let productBrands = [];
let productTypes = [];
let productChild = "";

const messageSection = document.querySelector(".message");
const catalogSection = document.querySelector(".catalog");

const nameSearch = document.querySelector("#filter-name");
const brandSearch = document.querySelector("#filter-brand");
const typeSearch = document.querySelector("#filter-type");
const orderSearch = document.querySelector("#sort-type");

(async () => {

  messageSection.style.display = "flex";
  messageSection.innerHTML = `<div><h3>Loading Catalog...</h3><p><img src="./img/loading.gif" alt="Loading Catalog"/></p></div>`;

  allProducts = await fetchProducts();

  loadProducts();
  loadComboOptions(brandSearch, productBrands.uniq().sort());
  loadComboOptions(typeSearch, productTypes.uniq().sort());

  productChild = Array.from(document.querySelectorAll(".product"));

  enableControls();
  enableEvents();

  messageSection.style.display = "none";

})();

async function fetchProducts() {
  try {
    const resource = await fetch(`${URL_BASE}/products.json`);
    const json = await resource.json();

    return json.map(({ id, brand, name, price, product_type, rating, category, api_featured_image }) => {
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
  } catch (error) {
    console.error(error);
    messageSection.style.display = "flex";
    messageSection.innerHTML = `<div><h3>Error...</h3><p>${error}</p></div>`;
  }
}

function enableControls() {
  nameSearch.disabled = false;
  brandSearch.disabled = false;
  typeSearch.disabled = false;
  orderSearch.disabled = false;
  nameSearch.focus();
}

function enableEvents() {
  nameSearch.addEventListener("input", withDelay(loadFilters, 500));  
  brandSearch.addEventListener("change", loadFilters);  
  typeSearch.addEventListener("change", loadFilters);
  orderSearch.addEventListener("change", () => {
    loadProducts();
    loadFilters();
  });
}

function loadProducts() {
  let view = sortProducts(allProducts, orderSearch.value)
    .map((product) => renderProducts(product))
    .join("");

  catalogSection.innerHTML = view;
}

function loadFilters() {
  const name = nameSearch.value;
  const brand = brandSearch.value;
  const type = typeSearch.value;

  productChild.forEach((product) => {
    if (validateProduct(product, name, brand, type)) {
      product.style.display = "block";
    } else {
      product.style.display = "none";
    }
  });
}

function sortProducts(products, sortType) {
  switch (sortType) {
    case "1":
      return products.sort((a, b) => b.rating - a.rating);
    case "2":
      return products.sort((a, b) => a.price - b.price);
    case "3":
      return products.sort((a, b) => b.price - a.price);
    case "4":
      return products.sort((a, b) => a.name.localeCompare(b.name));
    case "5":
      return products.sort((a, b) => b.name.localeCompare(a.name));
    default:
      break;
  }
}

function renderProducts(product) {
  productBrands = productBrands.concat([product.brand]);
  productTypes = productTypes.concat([product.product_type]);

  return `
      <div class="product" data-name="${product.name}" data-brand="${product.brand}" data-type="${product.product_type}" tabindex="${product.id}">
        <figure class="product-figure">
          <img src="${product.image_link}" width="215" height="215" alt="${product.name}" onerror="javascript:this.src='img/unavailable.png'">
        </figure>
        <section class="product-description">
          <h1 class="product-name">${product.name}</h1>
          <div class="product-brands"><span class="product-brand background-brand">${product.brand}</span>
            <span class="product-brand background-price">${product.formattedPrice}</span>
          </div>
        </section> 
        <section class="product-details">
          ${renderProductDetails(product)}
        </section>
      </div>`;
}

function renderProductDetails(product) {
  let details = ["brand", "price", "product_type", "category", "rating"];
  return Object.entries(product)
    .filter(([name, _]) => details.includes(name))
    .map(([name, value]) => {
      return `<div class="details-row">
       <div>${name}</div>
       <div class="details-bar">
         <div class="details-bar-bg" style="width= 250">${value}</div>
       </div>
     </div>`;
    })
    .join("");
}

function validateProduct(product, name, brand, type) {
  const search = new RegExp(name, "i");

  const checkName = search.test(product.dataset.name);
  const checkBrand = product.dataset.brand.includes(brand);
  const checkType = product.dataset.type.includes(type);

  return checkName && checkBrand && checkType;
}

function withDelay(fn, delay) {
  let timeout;
  return function () {
    clearTimeout(timeout);
    timeout = setTimeout(fn, delay);
  };
}

function loadComboOptions(combo, data) {
  data.map((opt) =>
    combo.insertAdjacentHTML("beforeend", `<option>${opt}</option>`)
  );
}

Array.prototype.uniq = function () {
  return this.filter(function (value, index, self) {
    return self.indexOf(value) === index;
  });
};

String.prototype.capitalize = function () {
  return this.charAt(0).toUpperCase() + this.slice(1);
};
  
