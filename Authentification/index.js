const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Utilisateur = require('./Authentification');

const app = express();
app.use(express.json());

mongoose.set('strictQuery', true);
const url = "mongodb://db:27017/mydatabase";

async function ConnectDB() {
    try {
        await mongoose.connect(url);
        console.log('Authentification_Service Connected to DB');
    } catch (error) {
        console.error('Authentification_Service Connection Error:', error);
    }
}
ConnectDB();

// Route pour l'inscription d'un utilisateur
app.post('/auth/register', async (req, res) => {
    try {
        const { nom_utilisateur, email_utilisateur, mot_de_passe } = req.body;

        if (!nom_utilisateur || !email_utilisateur || !mot_de_passe) {
            return res.status(400).json({ message: 'Tous les champs sont obligatoires' });
        }

        const existingUser = await Utilisateur.findOne({ email_utilisateur });
        if (existingUser) {
            return res.status(400).json({ message: "L'utilisateur existe déjà !" });
        }

        const hashedPassword = await bcrypt.hash(mot_de_passe, 10);
        const newUtilisateur = new Utilisateur({ nom_utilisateur, email_utilisateur, mot_de_passe: hashedPassword });
        const savedUser = await newUtilisateur.save();
        res.status(201).json(savedUser);
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de l'inscription", error });
    }
});

// Route pour la connexion d'un utilisateur
app.post("/auth/login", async (req, res) => {
    try {
        const { email_utilisateur, mot_de_passe } = req.body;
        const utilisateur = await Utilisateur.findOne({ email_utilisateur });

        if (!utilisateur) {
            return res.status(404).json({ message: "Utilisateur introuvable" });
        }

        const isMatch = await bcrypt.compare(mot_de_passe, utilisateur.mot_de_passe);
        if (!isMatch) {
            return res.status(401).json({ message: "Mot de passe incorrect" });
        }

        const token = jwt.sign({ email_utilisateur: utilisateur.email_utilisateur }, 'secret', { expiresIn: '1h' });
        res.json({ token });
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la connexion', error });
    }
});

// Lancer le serveur
app.listen(4002, () => {
    console.log('Serveur Authentification démarré sur http://localhost:4002');
});