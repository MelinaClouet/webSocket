// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
require('dotenv').config({ path: '../.env' });

router.get('/users', userController.getAllUsers);
router.get('/users/:id', userController.getUserById);
router.post('/users', userController.createUser);
router.put('/users/:id', userController.updateUser);
router.delete('/users/:id', userController.deleteUser);
router.get('/google-maps-key', (req, res) => {
    const key = process.env.KEY_GOOGLE; // Récupérer la clé depuis le fichier .env



    res.json({ key: key }); // Renvoyer la clé en réponse JSON
});

module.exports = router;
