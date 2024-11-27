// Lancer l'application quand le DOM est chargé
document.addEventListener('onload', getProducts());
let produits = []
//Question 2 : 
// récupérer les données des produits depuis l'API
function getProducts() {
    fetch("https://fake-coffee-api.vercel.app/api")
        .then((res) => res.json())
        .then((data) => {
            produits = data;
            addProductsToDB(produits);
            displayProducts(data);
        })
        .catch(error => {
            console.error("Erreur lors de la récupération des produits:",
                error);
            loadProductsFromDB();
        });;
}
function getData(data) {
    produits = data;
}

//loadProductsFromDB

function loadProductsFromDB() {
    const db = openDB();
    const transaction = db.transaction("products", "readonly");
    const productStore = transaction.objectStore("products");
    const request = productStore.openCursor();

    request.onsuccess = function (event) {
        const cursor = event.target.result;
        if (cursor) {
            console.log("Produit récupéré:", cursor.value);
            cursor.continue(); // Passe au prochain enregistrement
        } else {
            console.log("Tous les produits ont été récupérés.");
        }
    };

    request.onerror = function (event) {
        console.error("Erreur lors de la récupération des produits:", event.target.error);
    };
}


// addProductsToDB(products)
function addProductsToDB(products) {
    const dbRequest = openDB();

    dbRequest.onsuccess = () => {
        const db = dbRequest.result;
        let transaction = db.transaction("products", "readwrite");
        let objectStore = transaction.objectStore("products");
        products.forEach(p => {
            objectStore.put(p);
        })
        console.log("termine")
    }

}


//Question 3 : 
// Créer une carte de produit
    function createProductCard(product) {
        const card = document.createElement('div');
        card.classList.add("product-card");
        card.innerHTML = `
            <img src="${product.image_url}" alt="">
            <h3>${product.name}</h3>
            <div class="product-info">
                <h4 class="price">${product.price} </h4>
                <p class="description">${product.description}</p>
                <button class="add-to-cart" onclick="addToCart('${product.id}')">+</button>
            </div>
        `;
        return card;
    }











    
// Afficher les produits
function displayProducts(products) {
    var productContent = document.querySelector('.product-content');

    productContent.innerHTML = '';


    products.forEach(product => {
        let productt = createProductCard(product);
        productContent.appendChild(productt);
    });
}


//Question 4 :
// Mode view
// Ajouter les écouteurs d'événements aux icônes
document.getElementById('grid').addEventListener('click', setGridView);
document.getElementById('list').addEventListener('click', setListView);



// Fonction pour passer en vue grille
function setGridView() {


    let productContainer = document.querySelector('.product-content');
    productContainer.classList.remove('list-view')
    productContainer.classList.add('grid-view')

    document.querySelectorAll('.product-card').forEach(card => {

    });


}


// Fonction pour passer en vue liste
function setListView() {

    let productContainer = document.querySelector('.product-content');
    productContainer.classList.remove('grid-view')
    productContainer.classList.add('list-view')


    document.querySelectorAll('.product-card').forEach(card => {




    });

    document.querySelectorAll('.product-card img ').forEach(img => {
        img.style.maxWidth = "200px";
    });

    document.querySelectorAll('.product-card button').forEach(btn => {
        btn.style.alignSelf = 'flex-end';
    });

}


// Initialiser la vue par défaut (grille)
setGridView();



//Question 5:
// Fonction pour filtrer les produits
function filterProducts() {
    let input = document.getElementById('search-input').value;
    const filteredProducts = produits.filter(product =>
        product.name.toLowerCase().includes(input.toLowerCase())
    );
    displayProducts(filteredProducts);
}

// Écouteur d'événement pour le champ de recherche
document.getElementById('search-input').addEventListener('input', filterProducts);




function openDB() {
    const dbRequest = indexedDB.open("CoffeeShopDB", 1);

    dbRequest.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains("products")) {
            db.createObjectStore("products", { keyPath: "id" });
        }
        if (!db.objectStoreNames.contains("cart")) {
            db.createObjectStore("cart", { keyPath: "id" });
        }
    };

    return dbRequest;
}




function addToCart(productId) {
    const productDetail = produits.find(p => p.id == productId);
    const cartItem = {
        id: productId,
        image_url: productDetail.image_url,
        name: productDetail.name,
        price: productDetail.price,
        quantity: 1
    };

    const dbRequest = openDB();
    dbRequest.onsuccess = () => {
        const db = dbRequest.result;
        const transaction = db.transaction("cart", "readwrite");
        const cartStore = transaction.objectStore("cart");

        const getRequest = cartStore.get(productId);
        getRequest.onsuccess = () => {
            if (getRequest.result) {
                const updatedItem = getRequest.result;
                updatedItem.quantity += 1;
                cartStore.put(updatedItem);
            } else {
                cartStore.put(cartItem);
            }
        };

        transaction.oncomplete = () => {
            console.log("Produit ajouté au panier avec succès !");
        };

        transaction.onerror = (event) => {
            console.error("Erreur lors de l'ajout au panier :", event.target.error);
        };
    };
}




function loadProductsFromCart() {
    const dbRequest = openDB();

    dbRequest.onsuccess = () => {
        const db = dbRequest.result;
        const transaction = db.transaction("cart", "readonly");
        const cartStore = transaction.objectStore("cart");
        const request = cartStore.getAll();

        request.onsuccess = (event) => {
            const cartItems = event.target.result;
            if (cartItems.length > 0) {
                displayCartItems(cartItems);
            } else {
                console.log("Le panier est vide.");
            }
        };

        request.onerror = (event) => {
            console.error("Erreur lors de la récupération des articles du panier :", event.target.error);
        };
    };
}


function displayCartItems(cartItems) {
    const cartContainer = document.getElementById('cart-items');
    cartContainer.innerHTML = ''; // Vider le contenu actuel

    cartItems.forEach(item => {
        const cartRow = createCartItemRow(item);
        cartContainer.appendChild(cartRow);
    });
}

function createCartItemRow(item) {
    const row = document.createElement('div');
    row.classList.add('cart-item');

    row.innerHTML = `
        <div class="cart-item-img">
            <img src="${item.image_url}" alt="${item.name}">
        </div>
        <div class="cart-item-details">
            <h3>${item.name}</h3>
            <p>Prix : ${item.price} dh</p>
            <p>Quantité : 
                <input type="number" value="${item.quantity}" min="1" onchange="updateQuantity('${item.id}', this.value)">
            </p>
            <button onclick="removeFromCart('${item.id}')">Supprimer</button>
        </div>
    `;

    return row;
}


