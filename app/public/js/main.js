import { initWebSocket, sendWebSocketData, closeWebSocketConnection } from '/js/websocket.js';
import { addMarker, getGeolocation } from '/js/position.js';


let map;
let markers = []; // Tableau global pour stocker les marqueurs


window.initMap = function () {
    getGeolocation()
        .then((coords) => {
            // Initialiser la carte centrée sur les coordonnées récupérées
             map = new google.maps.Map(document.getElementById("map"), {
                center: { lat: coords.lat, lng: coords.lng },
                zoom: 12,
            });

            console.log("Carte chargée avec succès :", map);
        })
        .catch((err) => {
            console.error("Erreur lors de la récupération de la géolocalisation :", err.message);

            // Charger une carte centrée sur une position par défaut en cas d'erreur
            map = new google.maps.Map(document.getElementById("map"), {
                center: { lat: 48.8566, lng: 2.3522 }, // Paris par défaut
                zoom: 12,
            });

            alert("Impossible d'obtenir votre position. Une carte par défaut sera affichée.");
        });
};
document.getElementById("loginForm").addEventListener("submit", (e) => {
    e.preventDefault();

    initWebSocket("ws://localhost:3000", map, markers);

    const email = document.getElementById("email").value;
    const name = document.getElementById("name").value;
    const loginModal = document.getElementById("loginModal");
    const loadingOverlay = document.getElementById("loadingOverlay");
    const userInfo = document.getElementById("userInfo");
    const currentUser = document.getElementById("currentUser");

    console.log("Données utilisateur saisies :", { email, name });

    // Afficher le chargement
    loadingOverlay.style.display = "flex";

    getGeolocation()
        .then((coords) => {
            const latitude = coords.lat;
            const longitude = coords.lng;

            // Effectuer les actions nécessaires
            closeModalAndLoader(loginModal, loadingOverlay); // Fermer modale et loader
            console.log("Coordonnées de géolocalisation récupérées :", { latitude, longitude });
            sendUserData(email, name, latitude, longitude); // Envoyer les données au serveur
            //updateUserInterface(userInfo, currentUser, name, email); // Mettre à jour l'interface
            addUserMarker(latitude, longitude, name, email); // Ajouter un marqueur sur la carte
        })
        .catch((err) => {
            console.error(err.message);

            // Masquer le chargement même en cas d'erreur
            loadingOverlay.style.display = "none";

            // Vous pouvez afficher un message d'erreur à l'utilisateur ici
            alert("Erreur : " + err.message);
        });
});

//close websocket connection when user closes the browser
window.onbeforeunload = function () {
    const email = document.getElementById("email").value;

    // Envoyer l'e-mail et d'autres informations au serveur
    closeWebSocketConnection({
        type: "close",
        email: email,
        latitude: 48.8566, // Exemple de latitude
        longitude: 2.3522, // Exemple de longitude
    });
};

// Sous-fonctions
function closeModalAndLoader(modalElement, loaderElement) {
    modalElement.style.display = "none";
    loaderElement.style.display = "none";
}

function sendUserData(email, name, latitude, longitude) {
    sendWebSocketData({
        type: "user",
        email,
        name,
        latitude,
        longitude,
    });

    console.log("Utilisateur connecté avec géolocalisation :", {
        email,
        name,
        latitude,
        longitude,
    });
}

function updateUserInterface(userInfoElement, currentUserElement, name, email) {
    userInfoElement.style.display = "block";
    currentUserElement.textContent = `${name} (${email})`;
}

function addUserMarker(latitude, longitude, name, email) {
    console.log("Ajout d'un marqueur pour :", { latitude, longitude, name, email });
    console.log("Map :", map);
    console.log("Markers :", markers);
    addMarker(map, markers, latitude, longitude, `${name} (${email})`);
}