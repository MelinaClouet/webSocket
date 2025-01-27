// controllers/userController.js
const User = require('../models/User.js');

const userController = {
    getAllUsers: (req, res) => {
        User.getAllUsers((users) => {
            res.status(200).json(users);
        });
    },

    getUserById: (req, res) => {
        const userId = req.params.id;
        User.getUserById(userId, (user) => {
            if (user.length > 0) {
                res.status(200).json(user[0]);
            } else {
                res.status(404).json({ message: 'Utilisateur non trouvé' });
            }
        });
    },


    createUser: (req, res) => {
        const { name, email, longitude, latitude } = req.body;
        if (!name || !email || !longitude || !latitude) {
            return res.status(400).json({ message: 'Tous les champs sont obligatoires' });
        }

        // Convertir longitude et latitude en nombres
        const longitudeNum = parseFloat(longitude);
        const latitudeNum = parseFloat(latitude);

        // Vérifier si les conversions ont échoué
        if (isNaN(longitudeNum) || isNaN(latitudeNum)) {
            return res.status(400).json({ message: 'Les coordonnées doivent être des nombres valides' });
        }


        User.createUser({ name, email, longitude, latitude }, (result) => {
            res.status(201).json({ id: result.insertId, name, email, longitude,latitude });
        });
    },

    updateUser: (req, res) => {
        const userId = req.params.id;
        const { name, email, longitude, latitude } = req.body;
        if (!name || !email || !longitude || !latitude){
            return res.status(400).json({ message: 'Tous les champs sont obligatoires' });
        }
        User.updateUser(userId, { name, email, longitude, latitude }, (result) => {
            res.status(200).json({ message: 'Utilisateur mis à jour avec succès' });
        });
    },

    deleteUser: (req, res) => {
        const userId = req.params.id;
        User.deleteUser(userId, (result) => {
            if (result.affectedRows > 0) {
                res.status(200).json({ message: 'Utilisateur supprimé' });
            } else {
                res.status(404).json({ message: 'Utilisateur non trouvé' });
            }
        });
    }
};

module.exports = userController;
