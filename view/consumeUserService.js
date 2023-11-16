let URI = "http://localhost/avianca/Controller/userController.php";


async function login(){
    let user = document.getElementById("user").value;
    let password = document.getElementById("password").value;
    if(user == "" || password == ""){
        alert("Llenar los campos.");
        return;
    }
    let serverAnswer = await fetch(URI + '?user=' + user + 
                                            '&password=' + password);
    let data = await serverAnswer.json();
    if(data == "" || data == null){
        alert("Credenciales incorrectas.");
    }else{
        sessionStorage.setItem("user", data[0].cedula);
        location.replace("./index.html");
    }
}

async function insertUser(){

    let id = document.getElementById("id").value;
    let name = document.getElementById("name").value;
    let lastName = document.getElementById("lastName").value;
    let phone = document.getElementById("phone").value;
    let card = document.getElementById("card").value;
    let password2 = document.getElementById("password2").value;

    let dataToModify = {
        "id" : id,
        "name" : name,
        "lastName" : lastName,
        "phone" : phone,
        "card" : card,
        "password" : password2
    }
    let serverAnswer = await fetch(URI,{
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(dataToModify),
    });
    // let data = await serverAnswer.json();
    // console.log(data);
    alert("Registro exitoso.");
    sessionStorage.setItem("user", id);
    location.replace("./index.html");
}