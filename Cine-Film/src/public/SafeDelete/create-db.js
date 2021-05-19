"use strict"

const fs = require('fs');
const Sqlite = require('better-sqlite3');

let db = new Sqlite('db.sqlite');

var load = function() {

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

    db.prepare('CREATE TABLE A_Realise (idFilm INTEGER NOT NULL, idRealisateur INTEGER NOT NULL, PRIMARY KEY(idFilm, idRealisateur))').run();
    db.prepare('CREATE TABLE A_joue (idFilm INTEGER NOT NULL, idActeur INTEGER NOT NULL, PRIMARY KEY(idFilm, idActeur))').run();
    db.prepare('CREATE TABLE Acteur (idActeur INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT UNIQUE, nomActeur varchar(30) NOT NULL, prenomActeur varchar(30) NOT NULL)').run();
    db.prepare('CREATE TABLE Critique (idFilm INTEGER NOT NULL , idUtilisateur INTEGER NOT NULL, message TEXT NOT NULL, date NOT NULL, note NUMERIC NOT NULL CHECK(note BETWEEN 0 and 10), PRIMARY KEY(idFilm, idUtilisateur))').run();
    db.prepare('CREATE TABLE Film (idFilm INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, nomFilm varchar(30) NOT NULL, dateFilm DATE NOT NULL, acteursFilm varchar(255) NOT NULL, realisateursFilm varchar(255) NOT NULL, descriptionFilm TEXT NOT NULL, dureeFilm NUMERIC NOT NULL CHECK(dureeFilm > 0), noteMoyenne NUMERIC CHECK(noteMoyenne BETWEEN 0 and 10) )').run();
    db.prepare('CREATE TABLE Film_Utilisateur (idUtilisateur INTEGER NOT NULL, idFilm INTEGER NOT NULL, nomListe varchar(30) NOT NULL, PRIMARY KEY(idUtilisateur, idFilm, nomListe))').run();
    db.prepare('CREATE TABLE Genre (idFilm INTEGER NOT NULL, nomGenre varchar(30) NOT NULL, PRIMARY KEY(idFilm, nomGenre))').run();
    db.prepare('CREATE TABLE Liste (nomListe varchar(30) NOT NULL PRIMARY KEY)').run();
    db.prepare('CREATE TABLE Realisateur (idRealisateur INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, nomRealisateur varchar(30) NOT NULL, prenomRealisateur varchar(30) NOT NULL)').run();
    db.prepare('CREATE TABLE Utilisateur (idUtilisateur INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, pseudoUtilisateur varchar(20) NOT NULL UNIQUE, mailUtilisateur varchar(50) NOT NULL UNIQUE, mdpUtilisateur varchar(50) NOT NULL UNIQUE, nomUtilisateur varchar(50) NOT NULL UNIQUE, prenomUtilisateur varchar(50) NOT NULL UNIQUE, dateNaissance INTEGER NOT NULL, nomGenre varchar(50) NOT NULL UNIQUE, idActeur INTEGER NOT NULL, idRealisateur INTEGER NOT NULL)').run();



}

load();