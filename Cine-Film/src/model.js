"use strict"
/* Module de recherche dans une base de données de films */
const Sqlite = require('better-sqlite3');

let db = new Sqlite('db.sqlite');


exports.read = (id) => {
    var nomFilm = db.prepare('SELECT nomFilm FROM Film WHERE idFilm = ?').get(id).nomFilm;
    var dateFilm = db.prepare('SELECT  dateFilm FROM Film WHERE idFilm = ?').get(id).dateFilm;
    var realisateursFilm = db.prepare('SELECT realisateursFilm FROM Film WHERE idFilm = ?').get(id).realisateursFilm;
    var acteursFilm = db.prepare('SELECT acteursFilm FROM Film WHERE idFilm = ?').get(id).acteursFilm;
    var noteMoyenne = db.prepare('SELECT noteMoyenne FROM Film WHERE idFilm = ?').get(id).noteMoyenne;
    var descriptionFilm = db.prepare('SELECT descriptionFilm FROM Film WHERE idFilm = ?').get(id).descriptionFilm;
    var duree = db.prepare('SELECT dureeFilm FROM Film WHERE idFilm = ?').get(id).dureeFilm;
    var image = db.prepare('SELECT image FROM Film WHERE idFilm = ?').get(id).image ;
    var results = db.prepare('SELECT pseudoUtilisateur, note, date, message FROM Critique C, Utilisateur U WHERE C.idFilm = ? AND  U.idUtilisateur = C.idUtilisateur ORDER BY date').all(id);
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





/*
exports.create = function(recipe) {
    var id = db.prepare('INSERT INTO recipe (title, img, description, duration) VALUES (@title, @img, @description, @duration)').run(recipe).lastInsertRowid;

    var insert1 = db.prepare('INSERT INTO ingredient VALUES (@recipe, @rank, @name)');
    var insert2 = db.prepare('INSERT INTO stage VALUES (@recipe, @rank, @description)');

    var transaction = db.transaction((recipe) => {
        for(var j = 0; j < recipe.ingredients.length; j++) {
            insert1.run({recipe: id, rank: j, name: recipe.ingredients[j].name});
        }
        for(var j = 0; j < recipe.stages.length; j++) {
            insert2.run({recipe: id, rank: j, description: recipe.stages[j].description});
        }
    });

    transaction(recipe);
    return id;
}


exports.update = function(id, Film) {
    var result = db.prepare('UPDATE recipe SET nomFilm = @nomFilm, dateFilm = @dateFilm, acteursFilm = @acteursFilm, realisateursFilm = @realisateursFilm, descriptionFilm = @descriptionFilm, dureeFilm = @dureeFilm,  WHERE idFilm = ?').run(Film, id);
    if(result.changes == 1) {
        var insert1 = db.prepare('INSERT INTO ingredient VALUES (@recipe, @rank, @name)');
        var insert2 = db.prepare('INSERT INTO stage VALUES (@recipe, @rank, @description)');

        var transaction = db.transaction((recipe) => {
            db.prepare('DELETE FROM ingredient WHERE recipe = ?').run(id);
            for(var j = 0; j < recipe.ingredients.length; j++) {
                insert1.run({recipe: id, rank: j, name: recipe.ingredients[j].name});
            }
            db.prepare('DELETE FROM stage WHERE recipe = ?').run(id);
            for(var j = 0; j < recipe.stages.length; j++) {
                insert2.run({recipe: id, rank: j, description: recipe.stages[j].description});
            }
        });

        transaction(recipe);
        return true;
    }
    return false;
}*/


exports.supprimerFilm = function(id) {
    db.prepare('DELETE FROM Film WHERE id = ?').run(id);
}

exports.supprimerUtilisateur = function(id) {
    db.prepare('DELETE FROM Utilisateur WHERE id = ?').run(id);
}



exports.search = (query) => {
    query = query || "";

    var num_found = db.prepare('SELECT count(*) FROM Film WHERE nomFilm LIKE ?').get('%' + query + '%')['count(*)'];
    var results = db.prepare('SELECT idFilm, nomFilm, descriptionFilm, noteMoyenne, dureeFilm, image FROM Film WHERE nomFilm LIKE ? ORDER BY idFilm').all('%' + query + '%');
    var acteurs = db.prepare('SELECT idActeur FROM A_Joue GROUP BY idActeur ORDER BY idActeur').all();
    var realisateurs = db.prepare('SELECT idRealisateur FROM A_Realise GROUP BY idRealisateur ORDER BY idRealisateur').all();
    var genres = db.prepare('SELECT nomGenre FROM Genre GROUP BY nomGenre').all();


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



