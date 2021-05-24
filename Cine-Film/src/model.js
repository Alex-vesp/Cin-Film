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

exports.loadInscription = () => {

    let acteurs = db.prepare('SELECT nomActeur FROM A_Joue GROUP BY nomActeur ORDER BY idActeur').all();
    let realisateurs = db.prepare('SELECT nomRealisateur FROM A_Realise GROUP BY nomRealisateur ORDER BY idRealisateur').all();
    let genres = db.prepare('SELECT nomGenre FROM Genre GROUP BY nomGenre').all();


    return {
        acteurs : acteurs,
        realisateurs : realisateurs,
        genres : genres,
    }
}

exports.addFilmToList = (id, nomListe, idFilm) => {
    let liste = db.prepare('SELECT nomListe FROM Liste WHERE idUtilisateur = ? AND nomListe = ?').get(id, nomListe);
    if (liste === undefined){
        return -1;
    }
    let film = db.prepare('SELECT nomListe FROM Film_Utilisateur WHERE idUtilisateur = ? AND nomListe = ? AND idFilm = ?').get(id, nomListe, idFilm);
    if (film !== undefined){
        return -2;
    }
    db.prepare('INSERT INTO Film_Utilisateur (idUtilisateur, idFilm, nomListe) VALUES (?, ?, ?)').run(id, idFilm, nomListe);
    return 1;
}


exports.addCritique = (id, idFilm, message, date, note) => {
    let existing = db.prepare('SELECT idUtilisateur FROM Critique WHERE idUtilisateur = ? AND idFilm = ?').get(id, idFilm);
    if (existing !== undefined){
        return -1;
    }
    db.prepare('INSERT INTO Critique (idUtilisateur, idFilm, message, date, note) VALUES (?, ?, ?, ?, ?)').run(id, idFilm, message, date, note);
    var res = db.prepare('SELECT idFilm, nomFilm, dateFilm, acteursFilm, realisateursFilm, descriptionFilm, dureeFilm, image, noteMoyenne FROM Film WHERE idFilm = ?').get(idFilm);
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


}

exports.loadListTitle = (id, nomListe) => {
    let film = db.prepare('SELECT idFilm FROM Film_Utilisateur WHERE idUtilisateur = ? AND nomListe = ?').all(id, nomListe);
    let results = [];
    for (let i=0; i<film.length ; i++){
        var res = db.prepare('SELECT idFilm, nomFilm, dateFilm, acteursFilm, realisateursFilm, descriptionFilm, dureeFilm, image, noteMoyenne FROM Film WHERE idFilm = ?').get(film[i].idFilm);
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
    if (db.prepare('SELECT idUtilisateur FROM Utilisateur WHERE idUtilisateur = ?').get(id) === undefined){
        return -1;
    }
    db.prepare('DELETE FROM Utilisateur WHERE idUtilisateur = ?').run(id);
}



exports.search = (query) => {
    query = query || "";

    let num_found = db.prepare('SELECT count(*) FROM Film WHERE nomFilm LIKE ?').get('%' + query + '%')['count(*)'];
    let res = db.prepare('SELECT idFilm, nomFilm, descriptionFilm, noteMoyenne, dureeFilm, image FROM Film WHERE nomFilm LIKE ? ORDER BY idFilm').all('%' + query + '%');
    let acteurs = db.prepare('SELECT nomActeur FROM A_Joue GROUP BY nomActeur ORDER BY idActeur').all();
    let realisateurs = db.prepare('SELECT nomRealisateur FROM A_Realise GROUP BY nomRealisateur ORDER BY idRealisateur').all();
    let genres = db.prepare('SELECT nomGenre FROM Genre GROUP BY nomGenre').all();
    let i=0;
    for (i; i<res.length; i++){
        let j = 0;
        let noteMoyenne = 0;
        let resultsCritiques = db.prepare('SELECT note FROM Critique C, Utilisateur U WHERE C.idFilm = ? AND  U.idUtilisateur = C.idUtilisateur ORDER BY date').all(res[i].idFilm);
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

exports.loadSuggestions  = (id) => {
    let userPref = db.prepare('SELECT nomGenre, idActeur, idRealisateur FROM Utilisateur WHERE idUtilisateur = ?').get(id);
    let realPref = db.prepare('SELECT idFilm FROM A_Realise WHERE idRealisateur = ?').all(userPref.idRealisateur);
    let acteurPref = db.prepare('SELECT idFilm FROM A_Joue WHERE idActeur = ?').all(userPref.idActeur);
    let genrePref = db.prepare('SELECT idFilm FROM Genre WHERE nomGenre = ?').all(userPref.nomGenre);
    let listeIdFilm = [];
    for (let i = 0; i < realPref.length ; i++){
        listeIdFilm.push(realPref[i].idFilm);
    }
    for (let i = 0; i < acteurPref.length ; i++){
        listeIdFilm.push(acteurPref[i].idFilm);
    }
    for (let i = 0; i < genrePref.length ; i++){
        listeIdFilm.push(genrePref[i].idFilm);
    }
    let uniqueListeIdFilm = [...new Set(listeIdFilm)];
    let results = [];
    for (let i = 0; i < uniqueListeIdFilm.length ; i++){
        let film = db.prepare('SELECT F.idFilm, nomFilm, descriptionFilm, noteMoyenne, dureeFilm, image FROM Film F WHERE F.idFilm = ? GROUP BY F.idFilm ORDER BY F.idFilm').get(uniqueListeIdFilm[i]);
        if (film !== undefined){
            results.push(film);
        }
    }
    return {
        results : results,
    }
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
    let results = db.prepare('SELECT idActeur FROM A_Joue  WHERE nomActeur = ?').get(acteur.toUpperCase());
    if (results === undefined) return 1;
    return results.idActeur
};

exports.searchRealisateur = (real) => {
    let results = db.prepare('SELECT idRealisateur FROM A_Realise WHERE nomRealisateur = ? ').get(real.toUpperCase());
    if (results === undefined) return 1;
    return results.idRealisateur;
};

exports.searchGenre = (genre) => {
    let results = db.prepare('SELECT nomGenre FROM Genre WHERE nomGenre = ? ').get(genre.toUpperCase());
    if (results === undefined) return 'ACTION';
    return results.nomGenre;
};

exports.searchTriGenre = (genre) => {
    let results = db.prepare('SELECT idFilm FROM Genre WHERE nomGenre = ? GROUP BY idFilm').all(genre.toUpperCase());
    if (results === undefined) return -1;
    return {
        results : results,
    }
};

exports.searchTriActeur = (acteur) => {
    let results = db.prepare('SELECT idFilm FROM A_Joue WHERE nomActeur = ? GROUP BY idFilm').all(acteur.toUpperCase());
    if (results === undefined) return -1;
    return {
        results : results,
    }
};

exports.searchTriReal = (real) => {
    let results = db.prepare('SELECT idFilm FROM A_Realise WHERE nomRealisateur = ? GROUP BY idFilm').all(real.toUpperCase());
    if (results === undefined) return -1;
    return {
        results : results,
    }
};

exports.searchTriAnnee = (annee) => {
    let anneeFin = annee + "-12-31";
    let anneeDebut = annee + "-01-01";
    let results = db.prepare('SELECT idFilm FROM Film WHERE dateFilm > ? AND dateFilm < ? GROUP BY idFilm').all(anneeDebut, anneeFin);
    if (results === undefined) return -1;
    return {
        results : results,
    }
};

exports.searchInfTriAnnee = (annee) => {
    annee = annee + "-12-31";
    let results = db.prepare('SELECT idFilm FROM Film WHERE dateFilm <= ? GROUP BY idFilm').all(annee);
    if (results === undefined) return -1;
    return {
        results : results,
    }
};

exports.searchTriNote = (note, liste) => {
    let listeResults = [];
    for (let i=0 ; i < liste.length ; i++){
        let search = db.prepare('SELECT idFilm FROM Film WHERE noteMoyenne >= ? AND idFilm = ? GROUP BY idFilm').get(note, liste[i]);
        if (search !== undefined){
            listeResults.push(search.idFilm);
        }
    }

    if (listeResults.length === 0) return -1;
    return {
        listeResults : listeResults ,
    }
};

exports.searchFilms = (finalListe) => {
    let results = [];
    for (let i = 0; i < finalListe.length ; i++){
        let film = db.prepare('SELECT F.idFilm, nomFilm, descriptionFilm, noteMoyenne, dureeFilm, image FROM Film F WHERE F.idFilm = ? GROUP BY F.idFilm ORDER BY F.idFilm').get(finalListe[i]);
        if (film !== undefined){
            results.push(film);
        }
    }
    return {
        results : results,
    }
};




exports.ajouterFilm = function(titre, date, realisateurs, acteurs, description, duree, image, genres) {
    let listeActeurs = acteurs.split(",");
    let listeRealisateurs = realisateurs.split(",");
    let listeGenres = genres.split(",");
    var exist = db.prepare('SELECT nomFilm FROM Film WHERE nomFilm = ?').get(titre);
    if (exist === undefined){
        db.prepare('INSERT INTO Film (nomFilm, dateFilm, acteursFilm, realisateursFilm, descriptionFilm, dureeFilm, image) VALUES (?, ?, ?, ?, ?, ?, ?)').run(titre, date, acteurs.toUpperCase(), realisateurs.toUpperCase(), description, duree, image);
        var result = db.prepare('SELECT idFilm FROM Film WHERE nomFilm = ?').get(titre).idFilm;
        exports.ajouter(listeActeurs, listeRealisateurs, listeGenres, result);
        return result;
    }
    return -1;
    return db.prepare('SELECT idFilm FROM Film WHERE nomFilm = ?').get(titre).idFilm;
}

exports.ajouter = function(listeActeurs, listeRealisateurs, listeGenres, idFilm){

    for (let i=0; i<listeActeurs.length; i++){
        db.prepare('INSERT INTO A_Joue (idFilm, nomActeur) VALUES (?, ?)').run(idFilm, listeActeurs[i].toUpperCase());
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

    let today = new Date();
    let yyyy = today.getFullYear();
    let yearDate = date.split("-")[0];


    if (yyyy - yearDate < 13){
        return -3;
    }
    let existpseudo = db.prepare('SELECT pseudoUtilisateur FROM Utilisateur WHERE pseudoUtilisateur = ?').get(user);
    if (existpseudo === undefined){
        let existmail = db.prepare('SELECT mailUtilisateur FROM Utilisateur WHERE mailUtilisateur = ?').get(mail);
        if (existmail === undefined){
            db.prepare('INSERT INTO Utilisateur (pseudoUtilisateur, mailUtilisateur, mdpUtilisateur, nomUtilisateur, prenomUtilisateur, dateNaissance, nomGenre, idActeur, idRealisateur) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)').run(user, mail, password, nom, prenom, date, genre.toUpperCase(), acteur, realisateur);
            return db.prepare('SELECT idUtilisateur FROM Utilisateur WHERE pseudoUtilisateur = ?').get(user).pseudoUtilisateur;
        }
        return -1;
    }
    return -2;
}

exports.update_userMdp = function(id, mdp) {
    db.prepare('UPDATE Utilisateur SET mdpUtilisateur = ?  WHERE idUtilisateur = ?').run(mdp, id);
}

exports.update_userInfos = function(id, pseudo, nom, prenom, email, date) {
    let found = false;
    if (pseudo.length === 0 ) pseudo = db.prepare('SELECT pseudoUtilisateur FROM Utilisateur WHERE idUtilisateur = ?').get(id).pseudoUtilisateur;
    else found = true;
    if (nom.length === 0 ) nom = db.prepare('SELECT nomUtilisateur FROM Utilisateur WHERE idUtilisateur = ?').get(id).nomUtilisateur;
    else found = true;
    if (prenom.length === 0 ) prenom = db.prepare('SELECT prenomUtilisateur FROM Utilisateur WHERE idUtilisateur = ?').get(id).prenomUtilisateur;
    else found = true;
    if (email.length === 0 ) email = db.prepare('SELECT mailUtilisateur FROM Utilisateur WHERE idUtilisateur = ?').get(id).mailUtilisateur;
    else found = true;
    if (date.length === 0 ) date = db.prepare('SELECT dateNaissance FROM Utilisateur WHERE idUtilisateur = ?').get(id).dateNaissance;
    else found = true;
    if (found === false) return -3;
    let existpseudo = db.prepare('SELECT pseudoUtilisateur FROM Utilisateur WHERE pseudoUtilisateur = ? AND idUtilisateur != ?').get(pseudo, id);
    if (existpseudo === undefined){
        var existemail = db.prepare('SELECT mailUtilisateur FROM Utilisateur WHERE mailUtilisateur = ? AND idUtilisateur != ?').get(email, id);
        if (existemail === undefined) {
            db.prepare('UPDATE Utilisateur SET pseudoUtilisateur = ?, mailUtilisateur = ?, nomUtilisateur = ?, prenomUtilisateur = ?, dateNaissance = ?  WHERE idUtilisateur = ?').run(pseudo, email, nom, prenom, date, id);
            return 0;
        }
        return -1;
    }
    return -2;
}

exports.update_userPref = function(id, genre, acteur, realisateur) {
    db.prepare('UPDATE Utilisateur SET nomGenre = ?, idActeur = ?, idRealisateur = ?  WHERE idUtilisateur = ?').run(genre, acteur, realisateur, id);
}

