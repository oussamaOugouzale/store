// Attendre que le DOM soit chargé avant de charger les produits du panier
document.addEventListener('DOMContentLoaded', loadProductsFromCart);

// Fonction pour charger les produits du panier à partir de IndexedDB
function loadProductsFromCart() {
    const dbRequest = openDB();

    dbRequest.onsuccess = () => {
        const db = dbRequest.result;
        const transaction = db.transaction("cart", "readonly");
        const cartStore = transaction.objectStore("cart");
        const request = cartStore.getAll();

        request.onsuccess = (event) => {
            const cartItems = event.target.result;
            console.log("Articles actuels dans le panier :", cartItems);

            if (cartItems.length > 0) {
                displayCartItems(cartItems); // Affiche les articles
                updateTotalPrice(cartItems); // Met à jour le prix total
            } else {
                document.getElementById('fields').style.display = 'none';
                document.getElementById('totalTitle').style.display = 'none';
                updateTotalPrice([]); // Si le panier est vide, le total doit être 0
            }
        };

        request.onerror = (event) => {
            console.error("Erreur lors de la récupération des articles du panier :", event.target.error);
        };
    };
}


// Fonction pour afficher les articles du panier
function displayCartItems(cartItems) {
    const cartContainer = document.getElementById('cart-items');
    cartContainer.innerHTML = ''; // Vider le contenu actuel

    cartItems.forEach(item => {
        const cartRow = createCartItemRow(item);
        cartContainer.appendChild(cartRow);
    });
}

// Fonction pour créer une ligne d'article du panier
function createCartItemRow(item) {
    const row = document.createElement('div');
    row.classList.add('cart-item');
    row.setAttribute('data-item-id', item.id); // Attribut pour identifier l'article dans le DOM

    row.innerHTML = `
    <div class="row">
        <div class="cart-item-img">
            <img src="${item.image_url}" alt="${item.name}">
            <h5>${item.name}</h5>
        </div>
        <div class="cart-item-details">
            <p> ${item.price} dh</p>
            <p>
                <button onclick="updateQuantity('${item.id}', 'decrement')">-</button>
                <span id="quantity-${item.id}">${item.quantity}</span>
                <button onclick="updateQuantity('${item.id}', 'increment')">+</button>
            </p>
            <h4>${item.price * item.quantity} dh</h4>
            <button class="remove" onclick="removeFromCart('${item.id}')">
                <span class="material-symbols-outlined">close</span>
            </button>
        </div>
    </div>
    `;

    return row;
}


// Fonction pour mettre à jour la quantité d'un article dans le panier
function updateQuantity(itemId, action) {
    const dbRequest = openDB();
    dbRequest.onsuccess = () => {
        const db = dbRequest.result;
        const transaction = db.transaction("cart", "readwrite");
        const cartStore = transaction.objectStore("cart");

        const getRequest = cartStore.get(itemId);
        getRequest.onsuccess = () => {
            const item = getRequest.result;

            if (action === 'increment') {
                item.quantity += 1; // Incrémenter la quantité
            } else if (action === 'decrement' && item.quantity > 1) {
                item.quantity -= 1; // Décrémenter la quantité
            }

            cartStore.put(item); // Mise à jour de l'article dans IndexedDB

            transaction.oncomplete = () => {
                console.log("Quantité mise à jour !");
                loadProductsFromCart(); // Recharger les produits pour afficher les modifications
            };
        };

        transaction.onerror = (event) => {
            console.error("Erreur lors de la mise à jour de la quantité :", event.target.error);
        };
    };
}

// Fonction pour supprimer un article du panier
function removeFromCart(itemId) {
    console.log("Suppression de l'article avec l'id :", itemId);

    const dbRequest = openDB();
    dbRequest.onsuccess = () => {
        const db = dbRequest.result;
        const transaction = db.transaction("cart", "readwrite");
        const cartStore = transaction.objectStore("cart");

        cartStore.delete(itemId); // Supprime l'article dans IndexedDB

        transaction.oncomplete = () => {
            console.log(`Article avec id ${itemId} supprimé !`);

            // Suppression immédiate dans le DOM
            const cartItem = document.querySelector(`[data-item-id="${itemId}"]`);
            if (cartItem) {
                cartItem.remove(); // Supprime l'élément du DOM
            }

            // Recalculer le total après suppression
            updateCartAndTotal();
        };

        transaction.onerror = (event) => {
            console.error("Erreur lors de la suppression de l'article :", event.target.error);
        };
    };
}




// Fonction pour mettre à jour le prix total du panier
function updateTotalPrice(cartItems) {
    // Calculer le total du panier
    const totalPrice = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);

    // Mettre à jour l'élément total dans le DOM
    document.getElementById('total').textContent = `${totalPrice} dh`;

    // Si le panier est vide, afficher 0 dh
    if (cartItems.length === 0) {
        document.getElementById('total').textContent = `0 dh`;
    }
}


// Fonction pour ouvrir la base de données IndexedDB
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

function updateCartAndTotal() {
    const dbRequest = openDB();
    dbRequest.onsuccess = () => {
        const db = dbRequest.result;
        const transaction = db.transaction("cart", "readonly");
        const cartStore = transaction.objectStore("cart");

        const request = cartStore.getAll(); // Récupère tous les articles du panier
        request.onsuccess = (event) => {
            const cartItems = event.target.result;

            // Vérifie si le panier est vide
            if (cartItems.length === 0) {
                const mainElement = document.getElementsByTagName('main')[0];
                if (mainElement) {
                    mainElement.style.display = 'none'; // Masque l'élément main si le panier est vide
                }
            } else {
                // Si des articles sont présents, met à jour l'affichage et le total
                displayCartItems(cartItems); // Fonction qui affiche les articles
                updateTotalPrice(cartItems); // Met à jour le total
            }
        };

        request.onerror = (event) => {
            console.error("Erreur lors de la récupération des articles du panier :", event.target.error);
        };
    };
}
