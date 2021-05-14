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

const APIKEY = '45c7524a7adb09538e00b07bff05d4e3';
let baseURL = 'https://api.themoviedb.org/3/';
let configData = null;
let baseImageURL = null;
let searchURL = 'search/movie?api_key='
let baseSearchURL = baseURL + searchURL + APIKEY + '&query='
let changeLanguageToFr = '&language=fr'

let movieSearch = function (keyword){
    let concatenedKeyword = keyword.replace(/ /g, '%20')
    let url = ''.concat(baseSearchURL, concatenedKeyword, changeLanguageToFr);
    fetch(url).then(response => response.json()).then(text => console.log(text))
}

let runSearch = function (keyword) {
    let url = ''.concat(baseURL, 'search/movie?api_key=', APIKEY, '&query=', keyword);
    fetch(url)
        .then(result=>result.json())
        .then((data)=>{
            //process the returned data
            document.getElementById('output').innerHTML = JSON.stringify(data, null, 4);
            //work with results array...

        })
}

movieSearch("les dents")
//document.addEventListener('DOMContentLoaded', getConfig);

