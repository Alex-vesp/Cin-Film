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


let movieSearch = function (keyword){
    let concatenatedKeyword = keyword.replace(/ /g, '%20')
    let url = ''.concat(baseSearchURL, concatenatedKeyword, changeLanguageToFr);
    fetch(url).then(response => response.text()).then(text => console.log(JSON.parse(text).results));

}

movieSearch("les dents de la mer");
(function(console){

    console.save = function(data, filename){

        if(!data) {
            console.error('Console.save: No data')
            return;
        }

        if(!filename) filename = 'console.json'

        if(typeof data === "object"){
            data = JSON.stringify(data, undefined, 4)
        }

        var blob = new Blob([data], {type: 'text/json'}),
            e    = document.createEvent('MouseEvents'),
            a    = document.createElement('a')

        a.download = filename
        a.href = window.URL.createObjectURL(blob)
        a.dataset.downloadurl =  ['text/json', a.download, a.href].join(':')
        e.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null)
        a.dispatchEvent(e)
    }
})(console)
