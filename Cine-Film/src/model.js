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
    var results = db.prepare('SELECT * FROM Critique WHERE idFilm = ?').all(id);
    return{
        nomFilm : nomFilm,
        dateFilm : dateFilm,
        realisateursFilm : realisateursFilm,
        acteursFilm : acteursFilm,
        noteMoyenne : noteMoyenne,
        descriptionFilm : descriptionFilm,
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
    var results = db.prepare('SELECT idFilm, nomFilm, descriptionFilm, noteMoyenne FROM Film WHERE nomFilm LIKE ? ORDER BY idFilm').all('%' + query + '%');

    return {
        results: results,
        num_found: num_found,
        query: query,
    };
};



exports.login = function(user, password) {
    var result = db.prepare('SELECT idUtilisateur FROM Utilisateur WHERE pseudoUtilisateur = ? AND mdpUtilisateur = ?').get(user, password);
    if(result === undefined) return -1;
    return result.id;
}

exports.new_user = function(user, mail, password, nom, prenom, date, genre, acteur, realisateur) {
    var result = db.prepare('INSERT INTO Utilisateur (pseudoUtilisateur, mailUtilisateur, mdpUtilisateur, nomUtilisateur, prenomUtilisateur, dateNaissance, nomGenre, idActeur, idRealisateur) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)').run(user, mail, password, nom, prenom, date, genre, acteur, realisateur);
    return result.lastInsertRowid;
}


