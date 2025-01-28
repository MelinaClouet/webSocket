const https = require('https');
const fs = require('fs');
const express = require('express');
const bodyParser = require('body-parser');
const WebSocket = require('ws');
const userRoutes = require('./routes/userRoutes'); // Routes API
const path = require('path');
const app = express();
const http = require('http');
const User = require('./models/User'); // Modèle pour gérer les utilisateurs

// Créer un serveur HTTP pour Express et WebSocket
const server = http.createServer(app);

// Créer un serveur WebSocket attaché au serveur HTTP
const wss = new WebSocket.Server({ server });

// Tableau pour garder une trace des connexions WebSocket
const clients = new Set();

wss.on('connection', (ws) => {
    console.log('Nouvelle connexion WebSocket');
    clients.add(ws);

    ws.on('message', async (message) => {
        try {
            const data = JSON.parse(message.toString());
            console.log('Message reçu:', data);

            if (data.type === 'close') {
                console.log(`Fermeture de la connexion pour : ${data.email}`);
                User.updateUserByEmail(
                    data.email,
                    {
                        latitude: data.latitude,
                        longitude: data.longitude,
                        isConnected: false,
                    },
                    (updateResult) => {
                        console.log("Position mise à jour :", updateResult);
                    }
                );
            }

            if (data.type === "user") {
                console.log(`Nouvel utilisateur : ${data.name}, Email: ${data.email}`);
                console.log(`Position : Latitude = ${data.latitude}, Longitude = ${data.longitude}`);

                User.getUserByEmail(data.email, async (result) => {
                    if (result.length > 0) {
                        console.log("Utilisateur existant trouvé dans la base de données");
                        User.updateUserByEmail(
                            data.email,
                            {
                                latitude: data.latitude,
                                longitude: data.longitude,
                                isConnected: true,
                            },
                            (updateResult) => {
                                console.log("Position mise à jour :", updateResult);
                            }
                        );
                    } else {
                        console.log("Création d'un nouvel utilisateur");
                        User.createUser(
                            {
                                email: data.email,
                                name: data.name,
                                latitude: data.latitude,
                                longitude: data.longitude,
                                isConnected: true,
                            },
                            (createResult) => {
                                console.log("Nouvel utilisateur créé :", createResult);
                            }
                        );
                    }

                    User.getAllUsersConnected((results) => {
                        const users = results.map((user) => ({
                            email: user.email,
                            name: user.name,
                            latitude: user.latitude,
                            longitude: user.longitude,
                        }));

                        // Diffuser les utilisateurs connectés à tous les clients WebSocket
                        clients.forEach((client) => {
                            if (client.readyState === WebSocket.OPEN) {
                                client.send(JSON.stringify({ type: "users", users }));
                            }
                        });
                    });
                });
            }
        } catch (error) {
            console.error('Erreur lors du traitement du message:', error.message);
        }
    });

    ws.on('close', () => {
        console.log('Connexion WebSocket fermée');
        clients.delete(ws);
    });
});

// Middleware pour parser les requêtes JSON
app.use(bodyParser.json());

// Routes de l'API REST
app.use('/api', userRoutes);

// Servir les fichiers statiques du dossier 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Route principale pour afficher index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});


// Démarrer le serveur HTTP qui gère à la fois Express et WebSocket
server.listen(3000, () => {
    console.log('Serveur démarré sur http://localhost:3000');
});