"use strict"
/* Module de recherche dans une base de données de films */
const Sqlite = require('better-sqlite3');
const fs = require("fs");

let db = new Sqlite('db.sqlite');


exports.read = (id) => {
    var nomFilm = db.prepare('SELECT nomFilm FROM Film WHERE idFilm = ?').get(id).nomFilm;
    var dateFilm = db.prepare('SELECT  dateFilm FROM Film WHERE idFilm = ?').get(id).dateFilm;
    var realisateursFilm = db.prepare('SELECT realisateursFilm FROM Film WHERE idFilm = ?').get(id).realisateursFilm;
    var acteursFilm = db.prepare('SELECT acteursFilm FROM Film WHERE idFilm = ?').get(id).acteursFilm;
    var descriptionFilm = db.prepare('SELECT descriptionFilm FROM Film WHERE idFilm = ?').get(id).descriptionFilm;
    var duree = db.prepare('SELECT dureeFilm FROM Film WHERE idFilm = ?').get(id).dureeFilm;
    var image = db.prepare('SELECT image FROM Film WHERE idFilm = ?').get(id).image ;
    var results = db.prepare('SELECT pseudoUtilisateur, note, date, message FROM Critique C, Utilisateur U WHERE C.idFilm = ? AND  U.idUtilisateur = C.idUtilisateur ORDER BY date').all(id);
    var noteMoyenne = 0;
    let i=0;
    for (i; i<results.length; i++){
        noteMoyenne = noteMoyenne + results[i].note;
    }
    if (noteMoyenne === 0){
        noteMoyenne = null;
    }
    else {
        noteMoyenne = noteMoyenne / i;
    }
    return{
        nomFilm : nomFilm,
        dateFilm : dateFilm,
        realisateursFilm : realisateursFilm,
        acteursFilm : acteursFilm,
        noteMoyenne : noteMoyenne,
        descriptionFilm : descriptionFilm,
        duree: duree,
        image: image,
        results : results,
    };
};




exports.supprimerFilm = function(id) {
    db.prepare('DELETE FROM Film WHERE id = ?').run(id);
}

exports.supprimerUtilisateur = function(id) {
    db.prepare('DELETE FROM Utilisateur WHERE id = ?').run(id);
}



exports.search = (query) => {
    query = query || "";

    var num_found = db.prepare('SELECT count(*) FROM Film WHERE nomFilm LIKE ?').get('%' + query + '%')['count(*)'];
    var res = db.prepare('SELECT idFilm, nomFilm, descriptionFilm, noteMoyenne, dureeFilm, image FROM Film WHERE nomFilm LIKE ? ORDER BY idFilm').all('%' + query + '%');
    var acteurs = db.prepare('SELECT idActeur FROM A_Joue GROUP BY idActeur ORDER BY idActeur').all();
    var realisateurs = db.prepare('SELECT idRealisateur FROM A_Realise GROUP BY idRealisateur ORDER BY idRealisateur').all();
    var genres = db.prepare('SELECT nomGenre FROM Genre GROUP BY nomGenre').all();
    let i=0;
    for (i; i<res.length; i++){
        var j = 0;
        var noteMoyenne = 0;
        var resultsCritiques = db.prepare('SELECT note FROM Critique C, Utilisateur U WHERE C.idFilm = ? AND  U.idUtilisateur = C.idUtilisateur ORDER BY date').all(res[i].idFilm);
        for (j; j<resultsCritiques.length; j++) {
            noteMoyenne = noteMoyenne + resultsCritiques[j].note;
        }
        if (noteMoyenne === 0){
            noteMoyenne = null;
        }
        else {
            noteMoyenne = noteMoyenne / j;
        }
        db.prepare('UPDATE Film SET noteMoyenne = ? WHERE idFilm = ?').run(noteMoyenne, res[i].idFilm);
    }
    var results = db.prepare('SELECT idFilm, nomFilm, descriptionFilm, noteMoyenne, dureeFilm, image FROM Film WHERE nomFilm LIKE ? ORDER BY idFilm').all('%' + query + '%');

    return {
        acteurs : acteurs,
        realisateurs : realisateurs,
        genres : genres,
        results: results,
        num_found: num_found,
        query: query,
    };
};

exports.searchActeur = (acteur) => {
    var results = db.prepare('SELECT idActeur FROM Acteur  WHERE nomActeur = ?').get(acteur);
    if (results === undefined) return 1;
    return results.idActeur
};

exports.searchRealisateur = (real) => {
    var results = db.prepare('SELECT idRealisateur FROM Realisateur WHERE nomRealisateur = ? ').get(real);
    if (results === undefined) return 1;
    return results.idRealisateur;
};

exports.ajouterFilm = function(titre, date, realisateurs, acteurs, description, duree, image, genres) {
    let listeActeurs = acteurs.split(",");
    let listeRealisateurs = realisateurs.split(",");
    let listeGenres = genres.split(",");
    var exist = db.prepare('SELECT nomFilm FROM Film WHERE nomFilm = ?').get(titre);
    if (exist === undefined){
        db.prepare('INSERT INTO Film (nomFilm, dateFilm, acteursFilm, realisateursFilm, descriptionFilm, dureeFilm, image) VALUES (?, ?, ?, ?, ?, ?, ?)').run(titre, date, acteurs, realisateurs, description, duree, image);
        var result = db.prepare('SELECT idFilm FROM Film WHERE nomFilm = ?').get(titre).idFilm;
        exports.ajouter(listeActeurs, listeRealisateurs, listeGenres, result);
        return result;
    }
    console.log("film déja présent");
    return db.prepare('SELECT idFilm FROM Film WHERE nomFilm = ?').get(titre).idFilm;
}

exports.ajouter = function(listeActeurs, listeRealisateurs, listeGenres, idFilm){
        for (let i=0; i<listeActeurs.length; i++){
            db.prepare('INSERT INTO A_Joue (idFilm, idActeur) VALUES (?, ?)').run(idFilm, listeActeurs[i]);
        }

        for (let i=0; i<listeRealisateurs.length; i++){
            db.prepare('INSERT INTO A_Realise (idFilm, idRealisateur) VALUES (?, ?)').run(idFilm, listeRealisateurs[i]);
        }

        for (let i=0; i<listeGenres.length; i++){
        db.prepare('INSERT INTO Genre (idFilm, nomGenre) VALUES (?, ?)').run(idFilm, listeGenres[i]);
        }
}

exports.login = function(user, password) {
    var result = db.prepare('SELECT idUtilisateur FROM Utilisateur WHERE pseudoUtilisateur = ? AND mdpUtilisateur = ?').get(user, password);
    if(result === undefined) return -1;
    return result.idUtilisateur;
}

exports.new_user = function(user, mail, password, nom, prenom, date, genre, acteur, realisateur) {
    try{
        var exist = db.prepare('SELECT pseudoUtilisateur FROM Utilisateur WHERE pseudoUtilisateur = ?').get(user);
        if (exist === undefined){
        var results = db.prepare('INSERT INTO Utilisateur (pseudoUtilisateur, mailUtilisateur, mdpUtilisateur, nomUtilisateur, prenomUtilisateur, dateNaissance, nomGenre, idActeur, idRealisateur) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)').run(user, mail, password, nom, prenom, date, genre, acteur, realisateur);
        return results.lastIndex;
        }
        console.log("pseudo déja présent");
        return db.prepare('SELECT idUtilisateur FROM Utilisateur WHERE pseudoUtilisateur = ?').get(user).idUtilisateur;
    }
    catch (e){
        console.log(e);
    }

}
/*

let entries = JSON.parse(fs.readFileSync('popular.json').toString());
let load = function(filename) {
    const movies = JSON.parse(fs.readFileSync(filename));

    let insertFilm = db.prepare('INSERT INTO Film  VALUES (@idFilm, @nomFilm, @dateFilm, @acteursFilm, @realisateursFilm, @descriptionFilm, @dureeFilm, @noteMoyenne)');

    let transaction = db.transaction((movies) => {

        for(let id = 0;id < movies.length; id++) {
            movies.results.title = nomFilm;
            insertFilm.run(movies);
        }
    });

    transaction(movies);
}
*/

//load('popular.json');


