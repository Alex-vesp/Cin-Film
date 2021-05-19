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

const APIKEY = '?api_key=45c7524a7adb09538e00b07bff05d4e3';
let baseURL = 'https://api.themoviedb.org/3/';
let searchURL = 'search/movie';
let discoverMovie = 'discover/movie?api_key=';
let release2010 = '&primary_release_year=2010&sort_by=vote_average.desc';
let baseSearchURL = baseURL + searchURL + APIKEY + '&query=';
let changeLanguageToFr = '&language=fr';
let popularMovies = 'movie/popular';
let baseRatedURL = baseURL + discoverMovie + APIKEY + changeLanguageToFr + release2010;


let popularSearchURL = baseURL + popularMovies + APIKEY + changeLanguageToFr;

let popularSearch = function (){
    for(let i = 0; i < 20; i++) {
        fetch(popularSearchURL).then(response => response.text()).then(data => console.log(JSON.parse(data).results[i])).catch(reason => reason);
    }
}

let newJson;
/*
let popularSearch = function (){
        fetch(popularSearchURL).then(response => response.text()).then(data => console.log(data.results)).catch(reason => reason);
        //console.log(newJson);
}
*/





let movieSearch = function (keyword){
    let concatenatedKeyword = keyword.replace(/ /g, '%20')
    let url = ''.concat(baseSearchURL, concatenatedKeyword, changeLanguageToFr);
        fetch(url).then(response => response.text()).then(data =>
            console.log(JSON.parse(data).results[0]))
}

//movieSearch("les dents de la mer");
popularSearch();

