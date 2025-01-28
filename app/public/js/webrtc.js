import { initWebSocket, sendWebSocketData } from "/js/websocket.js";

let localStream; // Flux local (caméra et microphone)
let localVideo = document.getElementById("localVideo"); // Vidéo locale
let videoContainer = document.getElementById("videoContainer"); // Conteneur pour les vidéos
let peerConnections = {}; // Stocker les connexions WebRTC pour chaque utilisateur
let socket; // WebSocket pour la signalisation

// Configuration des serveurs STUN/TURN pour WebRTC
const config = {
    iceServers: [
        { urls: "stun:stun.l.google.com:19302" }, // Serveur STUN public de Google
    ],
};

// Initialiser la connexion WebSocket pour la signalisation
export function initSignaling() {
    socket = initWebSocket("ws://localhost:3000");

    // Gérer les messages WebSocket
    socket.onmessage = async (message) => {
        const data = JSON.parse(message.data);

        if (data.type === "new-user") {
            console.log("Nouvel utilisateur connecté :", data.sender);
            await connectToNewUser(data.sender); // Établir une connexion avec le nouvel utilisateur
        } else if (data.type === "offer") {
            console.log("Offre WebRTC reçue :", data);
            await handleOffer(data.offer, data.sender);
        } else if (data.type === "answer") {
            console.log("Réponse WebRTC reçue :", data);
            await handleAnswer(data.answer, data.sender);
        } else if (data.type === "ice-candidate") {
            console.log("Candidat ICE reçu :", data);
            handleIceCandidate(data.candidate, data.sender);
        } else if (data.type === "user-disconnected") {
            console.log("Utilisateur déconnecté :", data.sender);
            removeRemoteVideo(data.sender);
        }
    };
}

// Obtenir le flux vidéo/audio local
export async function initLocalStream() {
    try {
        localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        localVideo.srcObject = localStream; // Afficher le flux local dans la vidéo locale
    } catch (error) {
        console.error("Erreur lors de l'accès au flux local :", error);
        alert("Impossible d'accéder à votre caméra/microphone.");
    }
}

// Établir une connexion avec un nouvel utilisateur
async function connectToNewUser(userId) {
    const peerConnection = createPeerConnection(userId);
    peerConnections[userId] = peerConnection;

    // Ajouter les pistes locales (audio/vidéo) à la connexion
    localStream.getTracks().forEach((track) => peerConnection.addTrack(track, localStream));

    // Créer une offre et l'envoyer à l'utilisateur
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);

    sendWebSocketData({
        type: "offer",
        offer,
        receiver: userId,
    });
}

// Créer une connexion WebRTC
function createPeerConnection(remoteUserId) {
    const peerConnection = new RTCPeerConnection(config);

    // Gérer les candidats ICE
    peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
            sendWebSocketData({
                type: "ice-candidate",
                candidate: event.candidate,
                receiver: remoteUserId,
            });
        }
    };

    // Gérer les flux distants
    peerConnection.ontrack = (event) => {
        addRemoteVideo(remoteUserId, event.streams[0]);
    };

    return peerConnection;
}

// Ajouter une vidéo distante
function addRemoteVideo(userId, stream) {
    let videoElement = document.getElementById(`video-${userId}`);
    if (!videoElement) {
        videoElement = document.createElement("video");
        videoElement.id = `video-${userId}`;
        videoElement.autoplay = true;
        videoContainer.appendChild(videoElement);
    }
    videoElement.srcObject = stream;
}

// Supprimer une vidéo distante
function removeRemoteVideo(userId) {
    const videoElement = document.getElementById(`video-${userId}`);
    if (videoElement) {
        videoElement.remove();
    }

    // Supprimer la connexion WebRTC de l'utilisateur
    if (peerConnections[userId]) {
        peerConnections[userId].close();
        delete peerConnections[userId];
    }
}

// Gérer les offres WebRTC
async function handleOffer(offer, sender) {
    const peerConnection = createPeerConnection(sender);
    peerConnections[sender] = peerConnection;

    await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);

    sendWebSocketData({
        type: "answer",
        answer,
        receiver: sender,
    });
}

// Gérer les réponses WebRTC
async function handleAnswer(answer, sender) {
    const peerConnection = peerConnections[sender];
    if (peerConnection) {
        await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
    }
}

// Gérer les candidats ICE
function handleIceCandidate(candidate, sender) {
    const peerConnection = peerConnections[sender];
    if (peerConnection) {
        peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
    }
}