"use strict"
/* Serveur pour le site de films */
var express = require('express');
var mustache = require('mustache-express');


var model = require('./model');
var app = express();
var Authentificated = false;

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));

const cookieSession = require('cookie-session');
const path = require("path");
app.use(cookieSession({
    secret: 'mot-de-passe-du-cookie',
}));

app.use(express.static(path.join(__dirname, '/public')));

app.engine('html', mustache());
app.set('view engine', 'html');
app.set('views', 'public/views');
app.set('model', 'model');




app.use(function(req, res, next) {
    if(req.session.user !== undefined) {
        res.locals.authenticated = true;
        res.locals.name = req.session.name;
    }
    return next();
});


/** POST **/

app.post('/pageListe.html', (req, res) =>{
    if (req.body.ajoutListe.length === 0){
        res.status(401).send('Veuillez renseigner au moins un caractère dans le nom de la liste');
        return;
    }
    if (model.addList(req.session.user, req.body.ajoutListe) === -1){
        res.status(401).send('Cette liste existe déjà, renseignez en une autre.');
        return;
    }

    model.addList(req.session.user, req.body.ajoutListe);
    //ici pageNomDeLaListe
    res.redirect('/pageFilmsListe.html/' + req.body.ajoutListe);
});


app.post('/index.html', (req, res) =>{
    let liste = [];
    if (req.body.genre !== "Tous ..."){
        let resultGenre = model.searchTriGenre(req.body.genre);
        if (resultGenre !== -1){
            for (let i = 0; i < resultGenre.results.length; i++){
                liste.push(resultGenre.results[i].idFilm);
            }
        }
    }
    if (req.body.acteur !== "Tous ..."){
        let resultActeur = model.searchTriActeur(req.body.acteur);
        if (resultActeur !== -1){
            for (let i = 0; i < resultActeur.results.length; i++){
                liste.push(resultActeur.results[i].idFilm);
            }
        }
    }
    if (req.body.real !== "Tous ..."){
        let resultReal = model.searchTriReal(req.body.real);
        if (resultReal !== -1){
            for (let i = 0; i < resultReal.results.length; i++){
                liste.push(resultReal.results[i].idFilm);
            }
        }
    }
    if (req.body.annee !== "Tous ..."){
        if (req.body.annee.charAt(0) === "<"){
            let annee = req.body.annee.split(" ")[1];
            let resultAnnee = model.searchInfTriAnnee(annee);
            if (resultAnnee !== -1){
                for (let i = 0; i < resultAnnee.results.length; i++){
                    liste.push(resultAnnee.results[i].idFilm);
                }
            }
        }
        else {
            let resultAnnee = model.searchTriAnnee(req.body.annee);
            if (resultAnnee !== -1){
                for (let i = 0; i < resultAnnee.results.length; i++){
                    liste.push(resultAnnee.results[i].idFilm);
                }
            }
        }
    }
    let finalListe;
    if (req.body.note !== "Tous ..."){
        let search = model.searchTriNote(req.body.note, liste);
        if (search === -1){
            finalListe = [...new Set(liste)];
        }
        else {
            finalListe =  [...new Set(search.listeResults)];
        }
    }
    else{
        finalListe = [...new Set(liste)];
    }
    let results = model.searchFilms(finalListe);
    res.render('indexTri', (results));
});

app.post('/login', (req, res) => {
    const user = model.login(req.body.user, req.body.password);
    if(user !== -1) {
        req.session.user = user;
        req.session.name = req.body.user;
        req.session.mdp = req.body.password;
        res.redirect('index.html');
    } else {
        res.redirect('/pageConnexion.html');
    }
});

app.post('/pageAjouterFilm.html', (req, res) => {
    let image;
    if(req.body.image === ""){
        image = "images/popcorn.png";
    }
    else image = req.body.image;
    if (req.body.titrefilm.length === 0 || req.body.datesortiefilm.length === 0 || req.body.realisateurs.length === 0 || req.body.acteurs.length === 0 || req.body.duree.length === 0 || req.body.genres.length === 0 ){
        res.status(401).send('Un des champs requis est vide');
        return;
    }
    const user = model.ajouterFilm(req.body.titrefilm, req.body.datesortiefilm, req.body.realisateurs, req.body.acteurs, req.body.description, req.body.duree, image, req.body.genres);
    if (user === -1 ) res.status(401).send('Film déjà présent dans la base de donnée !');
    res.redirect('index.html');
});

app.post('/pageInscription.html', (req, res) => {
    if (req.body.mdp === req.body.mdpconfirm) {
        let idActeur = model.searchActeur(req.body.prefAct);
        let idReal = model.searchRealisateur(req.body.prefReal);
        let nomGenre = model.searchGenre(req.body.prefGenre);
        if (req.body.pseudo.length === 0 || req.body.mail.length === 0 || req.body.mdp.length === 0 || req.body.nom.length === 0 || req.body.prenom.length === 0 || req.body.dateN.length === 0 || nomGenre.length === 0 || idActeur.length === 0 || idReal.length === 0 ){
            res.status(401).send('Un des champs requis est vide');
            return;
        }
        let user = model.new_user(req.body.pseudo, req.body.mail, req.body.mdp, req.body.nom, req.body.prenom, req.body.dateN, nomGenre, idActeur, idReal);
        if (user === -1) {
            res.status(401).send('L adresse mail est déjà utilisée par un autre utilisateur !');
            return;
        }
        if (user === -2){
            res.status(401).send('Le pseudo choisi est déjà utilisé par un autre utilisateur');
            return;
        }
        if (user === -3){
            res.status(401).send('Vous devez avoir 13 ans ou +');
            return;
        }
        res.redirect('/pageConnexion.html');
    }
    else {
        res.status(401).send('Veuillez renseigner 2 fois le même mot de passe');
        return;
    }
});

app.post('/pageModifierProfil.html/1', (req, res) => {
    let update = model.update_userInfos(req.session.user, req.body.pseudo, req.body.nom, req.body.prenom,  req.body.mail, req.body.dateN);
    if (update === -1){
        res.status(401).send('L email choisi est déjà utilisé par un autre utilisateur');
    }
    if (update === -2){
        res.status(401).send('Le pseudo choisi est déjà utilisé par un autre utilisateur');
    }
    if (update === -3){
        res.status(401).send('Veuillez renseigner un des champs');
    }
    if (update === 0){
        res.redirect('/pageModifierProfil.html');
    }
});


app.post('/pageModifierProfil.html/3', (req, res) => {
    const idActeur = model.searchActeur(req.body.prefAct);
    const idReal = model.searchRealisateur(req.body.prefReal);
    model.update_userPref(req.session.user, req.body.prefGenre, idActeur, idReal);
    res.redirect('/pageModifierProfil.html');
});

app.post('/pageModifierProfil.html/2', (req, res) => {
    if (req.body.mdpactuel === req.session.mdp){
        if (req.body.nvxmdp === req.body.nvxmdpconfirm){
            model.update_userMdp(req.session.user, req.body.nvxmdp);
            req.session.mdp = req.body.nvxmdp;
            res.redirect('/pageModifierProfil.html');
        }
        res.status(401).send("les 2 mdp de confirmation ne sont pas les memes");
    }
    else res.status(401).send("le mdp n'est pas celui de l'utilisateur");
});

app.post('/pageSuppressionProfil.html', (req, res) =>{
    if (model.supprimerUtilisateur(req.session.user) === -1){
        res.status(401).send("Il n'est pas possible de supprimer un utilisateur qui n'existe pas");
    }
    model.supprimerUtilisateur(req.session.user)
    req.session = null;
    res.redirect('/index.html')
})



app.post('/pageFilm.html/:id', (req, res) => {
    if (req.body.ajoutListe.length === 0){
        res.status(401).send('Veuillez renseigner au moins un caractère dans le nom de la liste');
        return;
    }
    let result = model.addFilmToList(req.session.user, req.body.ajoutListe, req.params.id);
    if ( result === -1){
        res.status(401).send('Cette liste n existe pas, renseignez une liste existente');
        return;
    }
    if (result === -2){
        res.status(401).send('Ce film est déjà présent dans votre liste');
        return;
    }
    model.addFilmToList(req.session.user, req.body.ajoutListe, req.params.id);
    res.redirect('/pageFilm.html/' + req.params.id);
});

app.post('/pageFilm.html/nouvelleCritique/:id', (req, res) => {
    if (req.body.message.length === 0){
        res.status(401).send('Veuillez renseigner au moins un caractère dans le message');
        return;
    }
    if (req.body.note.length === 0){
        res.status(401).send('Veuillez renseigner une note valide');
        return;
    }
    let today = new Date();
    let dd = String(today.getDate()).padStart(2, '0');
    let mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    let yyyy = today.getFullYear();

    today =  dd + '/' + mm + '/' + yyyy;
    let result = model.addCritique(req.session.user, req.params.id, req.body.message, today, req.body.note);
    if ( result === -1){
        res.status(401).send('Vous avez déjà renseigné un commentaire sur ce film');
        return;
    }
    res.redirect('/pageFilm.html/' + req.params.id);
});

/**** Routes pour voir les pages du site ****/


/** GET **/

app.get('/', (req, res) => {
    res.redirect('index.html');
});

app.get('/index.html', (req, res) => {
    let found = model.search(req.query.query);
    res.render('index', found);
});

/*app.get('/pageConnecte.html', (req, res) => {
    res.render('pageConnecte');
});*/

app.get('/pageConnexion.html', (req, res) => {
    res.render('pageConnexion');
});

app.get('/pageAjouterFilm.html', (req, res) => {
    res.render('pageAjouterFilm');
});

app.get('/pageModifierProfil.html', (req, res) => {
    let found = model.loadInscription();
    res.render('pageModifierProfil', (found));
});

app.get('/search.html', (req, res) => {
    let entry = model.search(req.query.query);
    res.render('search', (entry));
});

app.get('/pageFilm.html/:id', (req, res) => {
    var entry = model.read(req.params.id);
    res.render('pageFilm', (entry));
});

app.get('/pageFilmListe.html', (req, res) => {
    res.render('pageFilmListe');
});

app.get('/pageInscription.html', (req, res) => {
    var found = model.loadInscription();
    res.render('pageInscription', (found));
});

app.get('/pageListe.html', (req, res) => {
    var load = model.loadList(req.session.user);
    res.render('pageListe', (load));
});

app.get('/pageFilmsListe.html/:nomlist', (req, res) => {
    var titreliste = model.loadListTitle(req.session.user, req.params.nomlist);
    res.render('pageFilmsListe.html', (titreliste));
});

app.get('/pageProfil.html', (req, res) => {
    var found = model.searchProfil(req.session.user);
    res.render('pageProfil', (found));
});

app.get('/pageSuppressionProfil.html', (req, res) => {
    res.render('pageSuppressionProfil.html');
});

app.get('/pageSuggestions.html', (req, res) => {
    let found = model.loadSuggestions(req.session.user);
    res.render('pageSuggestions', (found));
});

app.get('/deconnexion.html', (req, res) => {
    req.session = null;
    res.redirect('index.html');
});








app.listen(5002, () => console.log('listening on http://localhost:5002'));

