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



// teste si l'utilisateur est authentifié
function is_authenticated(req, res, next) {
    if(req.session.user !== undefined) {
        return next();
    }
    res.status(401).send('Authentification demandée');
}

// ajoute deux variables de session aux templates : authenticated et le nom de l'utilisateur
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
    res.redirect('/pageFilmsListe.html/:' + req.body.ajoutListe);
})

app.post('/login', (req, res) => {
    console.log("login");
    const user = model.login(req.body.user, req.body.password);
    if(user != -1) {
        req.session.user = user;
        req.session.name = req.body.user;
        req.session.mdp = req.body.password;
        res.redirect('index.html');
    } else {
        res.redirect('/pageConnexion.html');
    }
});

app.post('/pageAjouterFilm.html', (req, res) => {
    console.log("ajout film");
    let image;
    if(req.body.image === ""){
        image = "https://sobusygirls.fr/uploads/2012/02/inconnue2-2.jpg";
    }
    else image = req.body.image;
    const user = model.ajouterFilm(req.body.titrefilm, req.body.datesortiefilm, req.body.realisateurs, req.body.acteurs, req.body.description, req.body.duree, image, req.body.genres);
    res.redirect('index.html');
});

app.post('/pageInscription.html', (req, res) => {
    if (req.body.mdp === req.body.mdpconfirm) {
        const idActeur = model.searchActeur(req.body.prefAct);
        const idReal = model.searchRealisateur(req.body.prefReal);
        const user = model.new_user(req.body.pseudo, req.body.mail, req.body.mdp, req.body.nom, req.body.prenom, req.body.dateN, req.body.prefGenre, idActeur, idReal );
        if(user != -1) {
            res.redirect('/index.html');
        } else {
            res.redirect('/pageInscription.html');
        }
    }
});

app.post('/pageModifierProfil.html/1', (req, res) => {
    model.update_userInfos(req.session.user, req.body.pseudo, req.body.nom, req.body.prenom,  req.body.mail, req.body.dateN);
    res.redirect('/pageModifierProfil.html');
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
        }
        else console.log("les 2 mdp de confirmation ne sont pas les memes");
    }
    else console.log("le mdp n'est pas celui de l'utilisateur")
    res.redirect('/pageModifierProfil.html');
});


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
    var found = model.search(req.query.query);
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
    res.render('pageModifierProfil');
});

app.get('/search.html', (req, res) => {
    var entry = model.search(req.query.query);
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
    res.render('pageInscription');
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

app.get('/pageSuggestions.html', (req, res) => {
    res.render('pageSuggestions');
});

app.get('/deconnexion.html', (req, res) => {
    req.session = null;
    res.redirect('index.html');
});








app.listen(3000, () => console.log('listening on http://localhost:3000'));

