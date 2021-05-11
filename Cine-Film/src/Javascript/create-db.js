"use strict"

const fs = require('fs');
const Sqlite = require('better-sqlite3');

let db = new Sqlite('db.sqlite');

var load = function(filename) {
    const recipes = JSON.parse(fs.readFileSync(filename));

    db.prepare('DROP TABLE IF EXISTS A_Realise').run();
    db.prepare('DROP TABLE IF EXISTS A_joue').run();
    db.prepare('DROP TABLE IF EXISTS Acteur').run();
    db.prepare('DROP TABLE IF EXISTS Critique').run();
    db.prepare('DROP TABLE IF EXISTS Film').run();
    db.prepare('DROP TABLE IF EXISTS Film_Utilisateur').run();
    db.prepare('DROP TABLE IF EXISTS Genre').run();
    db.prepare('DROP TABLE IF EXISTS Liste').run();
    db.prepare('DROP TABLE IF EXISTS Realisateur').run();
    db.prepare('DROP TABLE IF EXISTS Utlisateur').run();

    db.prepare('CREATE TABLE A_Realise (idFilm INTEGER NOT NULL PRIMARY KEY, idRealisateur INTEGER NOT NULL PRIMARY KEY)').run();
    db.prepare('CREATE TABLE A_joue (idFilm INTEGER NOT NULL PRIMARY KEY, idActeur INTEGER NOT NULL PRIMARY KEY)').run();
    db.prepare('CREATE TABLE Acteur (idActeur INTEGER NOT NULL PRIMARY KEY UNIQUE, nomActeur varchar(30) NOT NULL, prenomActeur varchar(30) NOT NULL)').run();
    db.prepare('CREATE TABLE Critique (idFilm INTEGER NOT NULL PRIMARY KEY, idUtilisateur INTEGER NOT NULL PRIMARY KEY, message TEXT NOT NULL, date NOT NULL, note NUMERIC NOT NULL CHECK(note BETWEEN 0 and 10))').run();
    db.prepare('CREATE TABLE Film (idFilm INTEGER NOT NULL PRIMARY KEY, nomFilm varchar(30) NOT NULL, dateFilm DATE NOT NULL, acteursFilm varchar(255) NOT NULL, realisateursFilm varchar(255) NOT NULL, descriptionFilm TEXT NOT NULL, noteMoyenne NUMERIC NOT NULL CHECK(note BETWEEN 0 and 10) )').run();
    db.prepare('CREATE TABLE Film_Utilisateur (idUtilisateur INTEGER NOT NULL PRIMARY KEY, idFilm INTEGER NOT NULL PRIMARY KEY, nomListe varchar(30) NOT NULL PRIMARY KEY)').run();
    db.prepare('CREATE TABLE Genre (idFilm INTEGER NOT NULL PRIMARY KEY, nomGenre varchar(30) NOT NULL PRIMARY KEY)').run();
    db.prepare('CREATE TABLE Liste (nomListe varchar(30) NOT NULL PRIMARY KEY)').run();
    db.prepare('CREATE TABLE Realisateur (idRealisateur INTEGER NOT NULL PRIMARY KEY, nomRealisateur varchar(30) NOT NULL, prenomRealisateur varchar(30) NOT NULL)').run();
    db.prepare('CREATE TABLE Utilisateur (idUtilisateur INTEGER NOT NULL PRIMARY KEY, pseudoUtilisateur varchar(20) NOT NULL UNIQUE, mailUtilisateur varchar(50) NOT NULL UNIQUE, mdpUtilisateur varchar(50) NOT NULL UNIQUE, nomUtilisateur varchar(50) NOT NULL UNIQUE, prenomUtilisateur varchar(50) NOT NULL UNIQUE, dateNaissance INTEGER NOT NULL, nomGenre varchar(50) NOT NULL UNIQUE, idActeur INTEGER NON NULL, idRealisateur INTEGER NOT NULL)').run();

    var insert1 = db.prepare('INSERT INTO recipe VALUES (@idFilm, @title, @img, @description, @duration)');
    var insert2 = db.prepare('INSERT INTO ingredient VALUES (@recipe, @rank, @name)');
    var insert3 = db.prepare('INSERT INTO stage VALUES (@recipe, @rank, @description)');

    var transaction = db.transaction((recipes) => {

        for(var id = 0;id < recipes.length; id++) {
            var recipe = recipes[id];
            recipe.id = id;
            insert1.run(recipe);
            for(var j = 0; j < recipe.ingredients.length; j++) {
                insert2.run({recipe: id, rank: j, name: recipe.ingredients[j].name});
            }
            for(var j = 0; j < recipe.stages.length; j++) {
                insert3.run({recipe: id, rank: j, description: recipe.stages[j].description});
            }
        }
    });

    transaction(recipes);
}

load('data.json');

db.prepare('DROP TABLE IF EXISTS user').run();
db.prepare('CREATE TABLE user (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, password TEXT)').run();
db.prepare("INSERT INTO user (name, password) VALUES ('admin', 'miam')").run();

