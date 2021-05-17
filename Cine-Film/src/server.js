"use strict"
/* Serveur pour le site de films */
var express = require('express');
var mustache = require('mustache-express');

var model = require('./model');
var app = express();
var isAuthentificated = false;





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
        isAuthentificated = true;
        res.locals.authenticated = true;
        res.locals.name = req.session.name;
    }
    return next();
});


/** POST **/



app.post('pageConnexion.html', (req, res) => {
    res.redirect("index.html");
    const user = model.login(req.body.pseudoConnec, req.body.mdpConnec);
    if(user != -1) {
        req.session.user = user;
        req.session.name = req.body.pseudoConnec;
        window.alert(req.session.name);
        res.redirect('index.html');
        window.alert(req.session.name);
    } else {
        res.redirect('pageConnexion.html');
    }
});

app.post('/pageInscription.html', (req, res) => {
    const user = model.new_user(req.body.pseudo, req.body.mail, req.body.mdp, req.body.nom, req.body.prenom, req.body.dateN, req.body.genre, req.body.acteur, req.body.realisateur );
    if(user != -1) {
        req.session.user = user;
        req.session.name = req.body.pseudoConnec;
        window.alert(req.session.name);
        res.redirect('index.html');
        window.alert(req.session.name);
    } else {
        res.redirect('/pageInscription.html');
    }
});


/** GET **/

app.get('/', (req, res) => {
    res.redirect('index.html');
});

app.get('/index.html', (req, res) => {
    var found = model.search(req.query.query);
    res.render('index', found);
});

app.get('/pageConnecte.html', (req, res) => {
    res.render('pageConnecte');
});

app.get('/pageConnexion.html', (req, res) => {
    res.render('pageConnexion');
});


app.get('/pageFilm.html/:id', (req, res) => {
    var critique = model.critique(req.params.id);
    var entry = model.read(req.params.id);
    res.render('pageFilm', entry);
});

app.get('/pageFilmListe.html', (req, res) => {
    res.render('pageFilmListe');
});

app.get('/pageInscription.html', (req, res) => {
    res.render('pageInscription');
});

app.get('/pageListe.html', (req, res) => {
    res.render('pageListe');
});

app.get('/pageProfil.html', (req, res) => {
    res.render('pageProfil');
});

app.get('/pageSuggestions.html', (req, res) => {
    res.render('pageSuggestions');
});

app.get('/deconnexion.html', (req, res) => {
    req.session = null;
    res.redirect('index.html');
});



/*app.get('/search', (req, res) => {
    var found = model.search(req.query.query, req.query.page);
    res.render('search', found);
});*/

/**** Routes pour voir les pages du site ****/







/**Méthodes a utiliser (pour s'inspirer) -> **/

/*
app.get('/read/:id', (req, res) => {
    var entry = model.read(req.params.id);
    res.render('read', entry);
});

app.get('/create', is_authenticated, (req, res) => {
    res.render('create');
});

app.get('/update/:id', is_authenticated, (req, res) => {
    var entry = model.read(req.params.id);
    res.render('update', entry);
});

app.get('/delete/:id', is_authenticated, (req, res) => {
    var entry = model.read(req.params.id);
    res.render('delete', {id: req.params.id, title: entry.title});
});




function post_data_to_recipe(req) {
    return {
        title: req.body.title,
        description: req.body.description,
        img: req.body.img,
        duration: req.body.duration,
        ingredients: req.body.ingredients.trim().split(/\s*-/).filter(e => e.length > 0).map(e => ({name: e.trim()})),
        stages: req.body.stages.trim().split(/\s*-/).filter(e => e.length > 0).map(e => ({description: e.trim()})),
    };
}

app.post('/delete/:id', is_authenticated, (req, res) => {
    model.delete(req.params.id);
    res.redirect('/');
});
*/
app.listen(4000, () => console.log('listening on http://localhost:4000'));

