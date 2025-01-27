// models/userModel.js
const db = require('../config/database');

const User = {
    getAllUsers: (callback) => {
        db.query('SELECT * FROM users', (err, results) => {
            if (err) throw err;
            callback(results);
        });
    },

    getUserById: (id, callback)  => {
        db.query('SELECT * FROM users WHERE id = ?', [id], (err, result) => {
            if (err) throw err;
            callback(result);
        });
    },

    createUser: (userData, callback) => {
        const { name, email, longitude, latitude, isConnected } = userData;

        // Ne pas spécifier l'id car MySQL va l'incrémenter automatiquement
        db.query('INSERT INTO users (name, email, longitude, latitude, isConnected) VALUES (?, ?, ?, ?,?)',
            [name, email, longitude, latitude, isConnected],
            (err, result) => {
                if (err) throw err;
                callback(result);
            });
    },


    updateUser: (id, userData, callback) => {
        const { name, email, longitude,latitude, isConnected } = userData;
        db.query('UPDATE users SET name = ?, email = ?, longitude = ? , latitude = ?, isConnected WHERE id = ?', [name, email, longitude,latitude,isConnected, id], (err, result) => {
            if (err) throw err;
            callback(result);
        });
    },

    deleteUser: (id, callback) => {
        db.query('DELETE FROM users WHERE id = ?', [id], (err, result) => {
            if (err) throw err;
            callback(result);
        });
    },

    getAllUsersConnected: (callback) => {
        db.query('SELECT * FROM users WHERE isConnected = 1', (err, results) => {
            if (err) throw err;
            callback(results);
        });
    },

    closeAllConnections: () => {
        db.query('UPDATE users SET isConnected = 0', (err, results) => {
            if (err) throw err;
            callback(results);

        });
    },
    getUserByEmail: (email, callback) => {
        const query = `SELECT * FROM users WHERE email = ?`;
        db.query(query, [email], (error, results) => {
            if (error) throw error;
            callback(results);
        });

    },

    updateUserByEmail: (email, userData, callback) => {
        const query = `UPDATE users SET latitude = ?, longitude = ?, isConnected = ? WHERE email = ?`;
        db.query(query, [userData.latitude, userData.longitude, userData.isConnected, email], (error, results) => {
            if (error) throw error;
            callback(results);
        });
    }
};

module.exports = User;
