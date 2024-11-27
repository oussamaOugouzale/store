let db;

let request = indexedDB.open("maDB", 1);

request.onupgradeneeded = function (event) {
    db = event.target.result;
    let objectStore = db.createObjectStore("livres", { keyPath: "id", autoIncrement: true });
    objectStore.createIndex("titre", "titre", { unique: false });
    objectStore.createIndex("auteur", "auteur", { unique: false });
};

request.onsuccess = function (event) {
    db = event.target.result;
    console.log("Base de données ouverte avec succès");
};

request.onerror = function (event) {
    console.error("Erreur lors de l'ouverture de la base de données", event);
};
