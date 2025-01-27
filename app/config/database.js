// db.js
const mysql = require('mysql2');

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root', // ton utilisateur MySQL
    password: 'root', // ton mot de passe MySQL
    database: 'websocket' // nom de ta base de données
});

connection.connect((err) => {
    if (err) {
        console.error('Erreur de connexion à la base de données:', err);
    } else {
        console.log('Connexion à la base de données réussie');
    }
});

module.exports = connection;
