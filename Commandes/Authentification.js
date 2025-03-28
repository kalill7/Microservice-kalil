const jwt = require('jsonwebtoken');

function isAuthenticated(req, res, next) {
    const authHeader = req.headers['authorization'];
    console.log("Header Authorization reçu :", authHeader); // DEBUG

    if (!authHeader) {
        return res.status(401).json({ message: 'Accès non autorisé, aucun token fourni' });
    }

    const token = authHeader.split(' ')[1]; // Récupération du token après "Bearer "
    console.log("Token extrait :", token); // DEBUG

    if (!token) {
        return res.status(401).json({ message: 'Token manquant' });
    }

    try {
        const decoded = jwt.verify(token, 'secret'); // Remplace 'SECRET_KEY' par ta vraie clé secrète
        console.log("Token décodé avec succès :", decoded); // DEBUG

        req.user = decoded;
        req.token = token;
        next();
    } catch (error) {
        console.error("Erreur de vérification du token :", error);
        return res.status(403).json({ message: 'Token invalide' });
    }
}

module.exports = isAuthenticated;
