const express = require('express');
const mongoose = require('mongoose');
const Produit = require('./Produit');
const isAuthenticated = require('./Authentifiaction');
const { setTimeout } = require('timers/promises');

const app = express();
app.use(express.json());

mongoose.set('strictQuery', true);

const mongoUrl = "mongodb://db:27017/mydatabase"; 

// Connexion à MongoDB avec gestion des erreurs et reconnexion
async function connectDB() {
    let retries = 5;
    while (retries) {
        try {
            await mongoose.connect(mongoUrl);

            console.log('Produits_Service connecté à la base de données MongoDB');
            return;
        } catch (error) {
            console.log(`Erreur de connexion à MongoDB: ${error.message}`);
            retries--;
            console.log(`Tentatives restantes: ${retries}`);
            if (retries === 0) {
                throw new Error('Impossible de se connecter à MongoDB après plusieurs tentatives');
            }
            await setTimeout(5000); // Attendre 5 secondes avant de réessayer
        }
    }
}

// Fonction pour vérifier la disponibilité des produits
async function checkProductsAvailability(ids) {
    try {
        if (!Array.isArray(ids) || ids.length === 0) {
            throw new Error("Les IDs des produits ne sont pas valides ou vides.");
        }

        const produits = await Produit.find({ _id: { $in: ids } });

        // Retourner false si certains produits sont manquants
        return produits.length === ids.length; 
    } catch (error) {
        console.error('Erreur lors de la vérification de la disponibilité des produits:', error.message);
        return false;
    }
}

// Route pour ajouter un produit
app.post('/produit/Ajouter', isAuthenticated, async (req, res) => {
    try {
        const { nom, description, prix } = req.body;

        if (!nom || !description || !prix) {
            return res.status(400).json({ error: 'Tous les champs sont obligatoires' });
        }

        const newProduit = new Produit({
            nom,
            description,
            prix
        });

        const produit = await newProduit.save();
        res.status(200).json(produit);
    } catch (error) {
        console.error('Erreur lors de l\'ajout du produit:', error.message);
        res.status(400).json({ error: 'Erreur lors de l\'ajout du produit' });
    }
});

// Route pour acheter des produits
app.post('/produit/Acheter', isAuthenticated, async (req, res) => {
    try {
        const { ids } = req.body;

        if (!Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ error: 'Les IDs des produits sont manquants ou invalides' });
        }

        // Vérifier la disponibilité des produits
        const produitsDisponibles = await checkProductsAvailability(ids);
        if (!produitsDisponibles) {
            return res.status(404).json({ error: 'Certains produits ne sont pas disponibles' });
        }

        // Récupérer les produits disponibles
        const produits = await Produit.find({ _id: { $in: ids } });

        // Retourner les produits achetés
        res.status(200).json(produits);
    } catch (error) {
        console.error('Erreur lors de l\'achat des produits:', error.message);
        res.status(400).json({ error: 'Erreur lors de l\'achat des produits' });
    }
});

// Démarrage de la connexion à MongoDB
(async () => {
    try {
        await connectDB();
    } catch (error) {
        console.error('Erreur lors du démarrage des services:', error.message);
    }
})();

// Lancer le serveur
app.listen(4000, () => {
    console.log('Service Produit démarré sur http://localhost:4000');
});
