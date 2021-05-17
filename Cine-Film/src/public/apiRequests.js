/*************
 SAMPLE URLS

 1. To get the config data like image base urls
 https://api.themoviedb.org/3/configuration?api_key=<APIKEY>

 2. To fetch a list of movies based on a keyword
 https://api.themoviedb.org/3/search/movie?api_key=<APIKEY>&query=<keyword>

 3. To fetch more details about a movie
 https://api.themoviedb.org/3/movie/<movie-id>?api_key=<APIKEY>
 *************/

const fetch = require('node-fetch')
const json = require("body-parser/lib/types/json");
const {response} = require("express");
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

const APIKEY = '45c7524a7adb09538e00b07bff05d4e3';
let baseURL = 'https://api.themoviedb.org/3/';
let searchURL = 'search/movie?api_key=';
let baseSearchURL = baseURL + searchURL + APIKEY + '&query=';
let changeLanguageToFr = '&language=fr';
let newText;

let movieSearch = function (keyword){
    let concatenatedKeyword = keyword.replace(/ /g, '%20')
    let url = ''.concat(baseSearchURL, concatenatedKeyword, changeLanguageToFr);
    fetch(url).then(response => response.text()).then(text => newText = JSON.parse(text).results[0]);

}


movieSearch("les dents de la mer");