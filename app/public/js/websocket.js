import { addMarker } from '/js/position.js';

let socket = null; // Variable pour stocker l'instance WebSocket

// Fonction pour initialiser la connexion WebSocket
export function initWebSocket(url, map, markers) {
    socket = new WebSocket(url);

    // Événement lorsque la connexion est ouverte
    socket.addEventListener("open", () => {
        console.log("Connexion WebSocket établie avec le serveur");
    });

    // Événement lorsque le serveur envoie un message
    socket.addEventListener("message", (event) => {
        const data = JSON.parse(event.data);
        console.log("Message reçu du serveur :", data);

        // Si nécessaire, ajoutez ici du code pour gérer les données reçues
        // Exemple : Mettre à jour l'interface utilisateur avec les utilisateurs connectés
        if (data.type === "users") {
            // Mettre à jour l'interface utilisateur
            data.users.forEach((user) => {
                displayUserNotification(user.name, user.email);
                addMarker(map, markers, user.latitude, user.longitude, user.name);
            });
            console.log("Utilisateurs connectés :", data.users);
        }
    });

    // Événement lorsque la connexion WebSocket est fermée
    socket.addEventListener("close", (event) => {
        const data = JSON.parse(event.data);
        console.log("Connexion WebSocket fermée");
    });

    // Événement pour gérer les erreurs WebSocket
    socket.addEventListener("error", (error) => {
        console.error("Erreur WebSocket :", error);
    });
    return socket;
}

// Fonction pour envoyer des données au serveur WebSocket
export function sendWebSocketData(data) {
    if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify(data));
        console.log("Données envoyées au serveur :", data);
    } else {
        console.error("La connexion WebSocket n'est pas ouverte !");
    }
}

export function closeWebSocketConnection(data) {
    if (socket && socket.readyState === WebSocket.OPEN) {
        // Envoyer les données au serveur avant de fermer la connexion
        socket.send(JSON.stringify(data));
        console.log("Données envoyées au serveur avant fermeture :", data);

        // Fermer la connexion WebSocket
        socket.close();
        console.log("Connexion WebSocket fermée");
    } else {
        console.error("La connexion WebSocket n'est pas ouverte !");
    }
}

function displayUserNotification(name, email) {
    // Créer un conteneur pour la notification
    const notification = document.createElement("div");
    notification.className =
        "notification bg-blue-100 text-blue-900 p-2 rounded-md shadow-md mb-2";
    notification.style.position = "relative";
    notification.style.transition = "opacity 0.5s ease-in-out";

    // Ajouter le contenu de la notification
    notification.innerHTML = `
        <strong>${name}</strong> (${email}) est connecté !
    `;

    // Ajouter la notification au conteneur principal (par exemple, #userInfo)
    const userInfoContainer = document.getElementById("userInfo");
    userInfoContainer.style.display = "block"; // Assurez-vous que le conteneur est visible
    userInfoContainer.appendChild(notification);

    // Supprimer la notification après 2 secondes
    setTimeout(() => {
        notification.style.opacity = "0"; // Transition pour masquer l'élément
        setTimeout(() => {
            notification.remove(); // Supprimer l'élément du DOM après la transition
        }, 500); // Attendez que la transition soit terminée (0.5s)
    }, 2000);
}
