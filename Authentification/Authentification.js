const mongoose=require('mongoose')  ; 

const AuthentificationShema=mongoose.Schema({
    nom_utilisateur:String , 
    email_utilisateur:String,
    mot_de_passe:String,
    created_at:{
        type: Date,
        default: Date.now,
    },
        

}) ; 

module.exports=Utilisateur=mongoose.model("Authentification",AuthentificationShema)

