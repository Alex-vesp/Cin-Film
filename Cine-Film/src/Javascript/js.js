window.onclick = function (event) {
    if (event.target != document.getElementById("formConnec") && event.target !=  document.getElementById("connection") &&  event.target !=  document.getElementById("btnSeConnecter") && event.target != document.getElementById("usernameConnec") && event.target != document.getElementById("pswConnec") && event.target != document.getElementById("pswForgotten") && event.target != document.getElementById("seConnecter")){
        console.log(document.getElementById("formConnec"));
        console.log(event.target);
        document.getElementById("myFormConnec").style.display = "none";
    }

    if (event.target != document.getElementById("formInscr") && event.target !=  document.getElementById("inscription") &&  event.target !=  document.getElementById("btnInscription") && event.target != document.getElementById("usernameInscr") && event.target != document.getElementById("emailInscr") && event.target != document.getElementById("pswInscr") && event.target != document.getElementById("s'inscrire")){
        console.log(document.getElementById("formInscr"));
        console.log(event.target);
        document.getElementById("myFormInscr").style.display = "none";
    }
};

function openFormConnec() {
    document.getElementById("myFormConnec").style.display = "block";
}

function closeFormConnec() {
    document.getElementById("myFormConnec").style.display = "none";
}

function openFormInscr() {
    document.getElementById("myFormInscr").style.display = "block";
}

function closeFormInscr() {
    document.getElementById("myFormInscr").style.display = "none";
}