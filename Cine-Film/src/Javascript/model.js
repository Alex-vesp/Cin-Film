"use strict"
/* Module de recherche dans une base de données de films */
const Sqlite = require('better-sqlite3');

let db = new Sqlite('db.sqlite');


exports.read = (id) => {
    var found = db.prepare('SELECT * FROM Film WHERE idFilm = ?').get(id);
    if(found !== undefined) {
        found.descriptionFilm = db.prepare('SELECT descriptionFilm FROM Film WHERE nomFilm = ? ORDER BY noteMoyenne').all(id);
        found.noteMoyenne = db.prepare('SELECT noteMoyenne FROM Film WHERE nomFilm = ? ORDER BY noteMoyenne').all(id);
        return found;
    } else {
        return null;
    }
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



exports.search = (query, page) => {
    const num_per_page = 30;
    query = query || "";
    page = parseInt(page || 1);

    var num_found = db.prepare('SELECT count(*) FROM Film WHERE nomFilm LIKE ?').get('%' + query + '%')['count(*)'];
    var results = db.prepare('SELECT idFilm, nomFilm, descriptionFilm, noteMoyenne FROM Film WHERE nomFilm LIKE ? ORDER BY idFilm LIMIT ? OFFSET ?').all('%' + query + '%', num_per_page, (page - 1) * num_per_page);

    return {
        results: results,
        num_found: num_found,
        query: query,
        next_page: page + 1,
        page: page,
        num_pages: parseInt(num_found / num_per_page) + 1,
    };
};


exports.login = function(user, password) {
    var result = db.prepare('SELECT idUtilisateur FROM Utilisateur WHERE pseudoUtilisateur = ? AND mdpUtilisateur = ?').get(user, password);
    if(result === undefined) return -1;
    return result.id;
}

exports.new_user = function(user, password) {
    var result = db.prepare('INSERT INTO Utilisateur (pseudoUtilisateur, mdpUtilisateur) VALUES (?, ?)').run(user, password);
    return result.lastInsertRowid;
}


