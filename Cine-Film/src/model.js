"use strict"
/* Module de recherche dans une base de données de films */
const Sqlite = require('better-sqlite3');
const fs = require("fs");

let db = new Sqlite('db.sqlite');

exports.loadList = (id) => {
    let liste = db.prepare('SELECT nomListe FROM Liste WHERE idUtilisateur = ? ORDER BY nomListe').all(id);
    return{
        liste : liste
    }
}

exports.addFilmToList = (id, nomListe, idFilm) => {
    let liste = db.prepare('SELECT nomListe FROM Liste WHERE idUtilisateur = ? AND nomListe = ?').get(id, nomListe);
    if (liste === undefined){
        return -1;
    }
    let film = db.prepare('SELECT nomListe FROM Film_Utilisateur WHERE idUtilisateur = ? AND nomListe = ? AND idFilm = ?').get(id, nomListe, idFilm);
    console.log(film);
    if (film !== undefined){
        return -2;
    }
    db.prepare('INSERT INTO Film_Utilisateur (idUtilisateur, idFilm, nomListe) VALUES (?, ?, ?)').run(id, idFilm, nomListe);
    return 1;
}

exports.loadListTitle = (id, nomListe) => {
    let film = db.prepare('SELECT idFilm FROM Film_Utilisateur WHERE idUtilisateur = ? AND nomListe = ?').all(id, nomListe);
    let results = [];
    for (let i=0; i<film.length ; i++){
        var res = db.prepare('SELECT idFilm, nomFilm, dateFilm, acteursFilm, realisateursFilm, descriptionFilm, dureeFilm, image, noteMoyenne FROM Film WHERE idFilm = ?').get(film[i].idFilm);
        console.log(res.idFilm);
        var j = 0;
        var noteMoyenne = 0;
        var resultsCritiques = db.prepare('SELECT note FROM Critique C, Utilisateur U WHERE C.idFilm = ? AND  U.idUtilisateur = C.idUtilisateur ORDER BY date').all(res.idFilm);
        for (j; j<resultsCritiques.length; j++) {
            noteMoyenne = noteMoyenne + resultsCritiques[j].note;
        }
        if (noteMoyenne === 0){
            noteMoyenne = null;
        }
        else {
            noteMoyenne = noteMoyenne / j;
        }
        db.prepare('UPDATE Film SET noteMoyenne = ? WHERE idFilm = ?').run(noteMoyenne, res.idFilm);
        results.push(db.prepare('SELECT idFilm, nomFilm, dateFilm, acteursFilm, realisateursFilm, descriptionFilm, dureeFilm, image, noteMoyenne FROM Film WHERE idFilm = ?').get(film[i].idFilm));
    }
    console.log(results);
    return{
        results : results,
        nomListe : nomListe,
    }
}

exports.addList = (id, nouvelleListe) => {
    var allList = db.prepare('SELECT nomListe FROM Liste WHERE idUtilisateur = ? ORDER BY nomListe').all(id);
    for (let i = 0; i < allList.length; ++i){
        if (allList[i].nomListe === nouvelleListe){
            return -1;
        }
    }
    db.prepare('INSERT INTO Liste(nomListe, idUtilisateur) VALUES (?, ?)').run(nouvelleListe, id);
    console.log('Nouvelle liste créé: ' + nouvelleListe)
}


exports.read = (id) => {
    let idFilm = id;
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
        idFilm : idFilm,
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
    var acteurs = db.prepare('SELECT nomActeur FROM A_Joue GROUP BY idActeur ORDER BY idActeur').all();
    var realisateurs = db.prepare('SELECT nomRealisateur FROM A_Realise GROUP BY idRealisateur ORDER BY idRealisateur').all();
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
    let results = db.prepare('SELECT idFilm, nomFilm, descriptionFilm, noteMoyenne, dureeFilm, image FROM Film WHERE nomFilm LIKE ? ORDER BY idFilm').all('%' + query + '%');

    return {
        acteurs : acteurs,
        realisateurs : realisateurs,
        genres : genres,
        results: results,
        num_found: num_found,
        query: query,
    };
};

exports.searchProfil = (id) => {
    let results = db.prepare('SELECT pseudoUtilisateur, mailUtilisateur, nomUtilisateur, prenomUtilisateur, dateNaissance, nomGenre, idActeur, idRealisateur FROM Utilisateur WHERE idUtilisateur = ?').get(id);
    let resultsActeur = db.prepare('SELECT nomActeur FROM A_Joue  WHERE idActeur = ?').get(results.idActeur).nomActeur;
    let resultsReal = db.prepare('SELECT nomRealisateur FROM A_Realise  WHERE idRealisateur = ?').get(results.idRealisateur).nomRealisateur;
    return {
        results : results,
        resultsActeur : resultsActeur,
        resultsReal : resultsReal,
    }
};



exports.searchActeur = (acteur) => {
    var results = db.prepare('SELECT idActeur FROM A_Joue  WHERE nomActeur = ?').get(acteur.toUpperCase());
    if (results === undefined) return 1;
    return results.idActeur
};

exports.searchRealisateur = (real) => {
    var results = db.prepare('SELECT idRealisateur FROM A_Realise WHERE nomRealisateur = ? ').get(real.toUpperCase());
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
    console.log(listeActeurs[0].toUpperCase());

    for (let i=0; i<listeActeurs.length; i++){
        db.prepare('INSERT INTO A_Joue (idFilm, nomActeur) VALUES (?, ?)').run(idFilm, listeActeurs[i].toUpperCase());
        console.log("acteur ajouté");
    }

    for (let i=0; i<listeRealisateurs.length; i++){
        db.prepare('INSERT INTO A_Realise (idFilm, nomRealisateur) VALUES (?, ?)').run(idFilm, listeRealisateurs[i].toUpperCase());
    }

    for (let i=0; i<listeGenres.length; i++){
        db.prepare('INSERT INTO Genre (idFilm, nomGenre) VALUES (?, ?)').run(idFilm, listeGenres[i].toUpperCase());
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
            console.log(acteur);
            var results = db.prepare('INSERT INTO Utilisateur (pseudoUtilisateur, mailUtilisateur, mdpUtilisateur, nomUtilisateur, prenomUtilisateur, dateNaissance, nomGenre, idActeur, idRealisateur) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)').run(user, mail, password, nom, prenom, date, genre.toUpperCase(), acteur, realisateur);
            return results.lastIndex;
        }
        console.log("pseudo déja présent");
        return db.prepare('SELECT idUtilisateur FROM Utilisateur WHERE pseudoUtilisateur = ?').get(user).idUtilisateur;
    }
    catch (e){
        console.log(e);
    }

}

exports.update_userMdp = function(id, mdp) {
    try {
        db.prepare('UPDATE Utilisateur SET mdpUtilisateur = ?  WHERE idUtilisateur = ?').run(mdp, id);
    }
    catch (e){
        console.log(e);
    }
}

exports.update_userInfos = function(id, pseudo, nom, prenom, email, date) {
    try{
        var existpseudo = db.prepare('SELECT pseudoUtilisateur FROM Utilisateur WHERE pseudoUtilisateur = ? AND idUtilisateur != ?').get(pseudo, id);
        if (existpseudo === undefined){
            var existemail = db.prepare('SELECT mailUtilisateur FROM Utilisateur WHERE mailUtilisateur = ? AND idUtilisateur != ?').get(email, id);
            if (existemail === undefined) {
                db.prepare('UPDATE Utilisateur SET pseudoUtilisateur = ?, mailUtilisateur = ?, nomUtilisateur = ?, prenomUtilisateur = ?, dateNaissance = ?  WHERE idUtilisateur = ?').run(pseudo, email, nom, prenom, date, id);
                return;
            }
            console.log("email déja présent");
            return;
        }
        console.log("pseudo déja présent");
    }
    catch (e){
        console.log(e);
    }
}

exports.update_userPref = function(id, genre, acteur, realisateur) {
    try {
        db.prepare('UPDATE Utilisateur SET nomGenre = ?, idActeur = ?, idRealisateur = ?  WHERE idUtilisateur = ?').run(genre, acteur, realisateur, id);
    }
    catch (e){
        console.log(e);
    }
}

