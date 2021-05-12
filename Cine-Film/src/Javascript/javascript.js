//GESTION DES FORMULAIRES

window.onclick = function (event) {
    if (event.target != document.getElementById("formConnec") && event.target !=  document.getElementById("connection") &&  event.target !=  document.getElementById("btnSeConnecter") && event.target != document.getElementById("usernameConnec") && event.target != document.getElementById("pswConnec") && event.target != document.getElementById("pswForgotten") && event.target != document.getElementById("seConnecter")){
        console.log(document.getElementById("formConnec"));
        console.log(event.target);
        document.getElementById("myFormConnec").style.display = "none";
    }

    /*if (event.target != document.getElementById("formInscr") && event.target !=  document.getElementById("inscription") &&  event.target !=  document.getElementById("btnInscription") && event.target != document.getElementById("usernameInscr") && event.target != document.getElementById("emailInscr") && event.target != document.getElementById("pswInscr") && event.target != document.getElementById("s'inscrire") && event.target != document.getElementById("surname") && event.target != document.getElementById("name") && event.target != document.getElementById("birthdate")){
        console.log(document.getElementById("formInscr"));
        console.log(event.target);
        document.getElementById("myFormInscr").style.display = "none";
    }*/

};


function openFormConnec() {
    document.getElementById("myFormConnec").style.display = "block";
}

function closeFormConnec() {
    document.getElementById("myFormConnec").style.display = "none";
}
/*
function openFormInscr() {
    document.getElementById("myFormInscr").style.display = "block";
}

function closeFormInscr() {
    document.getElementById("myFormInscr").style.display = "none";
}
*/
//GESTION DES ONGLETS

function home(){/*
    document.getElementById("film").hidden = false;
    document.getElementById("filmIndividuel").hidden = true;
    document.getElementById("listes").hidden = true;
    document.getElementById("suggestion").hidden = true;
    document.getElementById("myFormInscr").hidden = true;*/
}

function openListes(){/*
    document.getElementById("listes").hidden = false;
    document.getElementById("film").hidden = true;
    document.getElementById("suggestion").hidden = true;
    document.getElementById("tri").hidden = true;
    document.getElementById("myFormInscr").hidden = true;
    document.getElementById("filmIndividuel").hidden = true;*/
}

function openSuggestions(){/*
    document.getElementById("suggestion").hidden = false;
    document.getElementById("tri").hidden = false;
    document.getElementById("listes").hidden = true;
    document.getElementById("film").hidden = true;
    document.getElementById("myFormInscr").hidden = true;
    document.getElementById("filmIndividuel").hidden = true;*/
}

function openProfil(){/*
    document.getElementById("suggestion").hidden = true;
    document.getElementById("film").hidden = true;
    document.getElementById("listes").hidden = true;
    document.getElementById("tri").hidden = true;
    document.getElementById("myFormInscr").hidden = true;
    document.getElementById("filmIndividuel").hidden = true;*/
}

function openInscription(){/*
    document.getElementById("myFormInscr").hidden = false;
    document.getElementById("film").hidden = true;
    document.getElementById("listes").hidden = true;
    document.getElementById("suggestion").hidden = true;
    document.getElementById("tri").hidden = true;
    document.getElementById("filmIndividuel").hidden = true;*/
}

function openFilmIndiv(){/*
    document.getElementById("filmIndividuel").hidden = false;
    document.getElementById("tri").hidden = true;
    document.getElementById("film").hidden = true;
    document.getElementById("listes").hidden = true;
    document.getElementById("suggestion").hidden = true;
    document.getElementById("myFormInscr").hidden = true;*/
}

function userGetConnected(){
    document.getElementById("liste").hidden = false;
    document.getElementById("suggestions").hidden = false;
    document.getElementById("profil").hidden = false;
    document.getElementById("tri").hidden = false;
    document.getElementById("film").hidden = false;
    document.getElementById("deconnection").hidden = false;
    document.getElementById("inscription").hidden = true;
    document.getElementById("connection").hidden = true;
    document.getElementById("listes").hidden = true;
    document.getElementById("suggestion").hidden = true;
    document.getElementById("myFormInscr").hidden = true;
    document.getElementById("filmIndividuel").hidden = true;
}

function userGetDisconnected(){
    document.getElementById("film").hidden = false;
    document.getElementById("inscription").hidden = false;
    document.getElementById("connection").hidden = false;
    document.getElementById("deconnection").hidden = true;
    document.getElementById("liste").hidden = true;
    document.getElementById("suggestions").hidden = true;
    document.getElementById("profil").hidden = true;
    document.getElementById("tri").hidden = true;
    document.getElementById("listes").hidden = true;
    document.getElementById("suggestion").hidden = true;
    document.getElementById("myFormInscr").hidden = true;
    document.getElementById("filmIndividuel").hidden = true;
}

