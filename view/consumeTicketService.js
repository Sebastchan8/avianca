import { serverIP } from './ip-config';
let URI = `http://${serverIP}/avianca-master/Controller/ticketController.php`

// window.onload = function(){
//     searchData();
// }

let departure;
let destination;
let adults;
let kids;
let round;

async function searchData(){
    /*Se aumenta a la variable URI a manera de URLencoded con los nombres que espera el servicio en php. Si no es vuelo de ida y 
    vuelta, returnDate debe ser igual a null*/
    let fromSelect = document.querySelector('#fromSelect');
    let fromPlace = fromSelect.options[fromSelect.selectedIndex].value;

    let toSelect = document.querySelector('#toSelect');
    let toPlace = toSelect.options[toSelect.selectedIndex].value;

    adults = document.getElementById("adults").value;
    kids = document.getElementById("kids").value;

    
    departure = fromSelect.selectedIndex + 1;
    destination = toSelect.selectedIndex + 1;
    let departureDate = document.getElementById("departure").value;
    let returnDate = document.getElementById("return").value == "" ? "null" : document.getElementById("return").value;
    
    if(fromPlace == toPlace){
        alert("Los lugares de salida y destino son los mismos.");
        return;
    }
    
    if(adults == 0 && kids == 0){
        alert("Al menos un adulto o un niño");
        return;
    }
    
    if(document.getElementById("departure").value == ""){
        alert("Seleccionar Fecha de Salida");
        return;
    }
    
    if(document.getElementById("return").value == "" && round){
        alert("Seleccionar Fecha de Retorno");
        return;
    }
    
    if(round && !(Date.parse(returnDate) >= Date.parse(departureDate))){
        alert("Fecha de retorno luego de la Fecha de Salida.");
    }else{
        // let serverAnswer = await fetch(URI + '?departure=2&destination=3&departureDate=2023-09-28&returnDate=2023-09-29&adults=1&kids=0');
        let serverAnswer = await fetch(URI + '?departure=' + departure + 
                                            '&destination=' + destination + 
                                            '&departureDate=' + departureDate +
                                            '&returnDate=' + returnDate +
                                            '&adults=' + adults +
                                            '&kids=' + kids);
        let data = await serverAnswer.json();
        round = document.getElementById("round").checked;
        let htmlTable = "";
        if(round){
            for(let i=0; i<data.length;i++){
                htmlTable += '<tr>'+
                                '<td>' + data[i].departureTrip.nombreAerolinea + ' <img src="img/' + data[i].departureTrip.imagenAerolinea + '" height="35px">' + '</td>'+
                                '<td>' + fromPlace + ' - ' + toPlace + '</td>'+
                                '<td>' + data[i].departureTrip.fechaSalida + ' ' + data[i].departureTrip.horaSalida + '</td>'+
                                '<td>' + data[i].returnTrip.fechaSalida + ' ' + data[i].returnTrip.horaSalida + '</td>'+
                                '<td>' + data[i].departureTrip.disponibilidad + ' (ida) - ' + data[i].returnTrip.disponibilidad + ' (vuelta)</td>'+
                                '<td>' + (parseInt(data[i].departureTrip.costoAdulto) + parseInt(data[i].returnTrip.costoAdulto)) + '</td>'+
                                '<td>' + (parseInt(data[i].departureTrip.costoNino) + parseInt(data[i].returnTrip.costoNino)) + '</td>'+
                                '<td>' + (parseInt(data[i].departureTrip.costo) + parseInt(data[i].returnTrip.costo)) + '</td>'+
                                '<td><button type="button" class="btn btn-success" onclick="buyTicket(' + data[i].departureTrip.idVuelo  + ', ' + data[i].returnTrip.idVuelo + ')">Comprar</button></td>'+
                            '</tr>';
            }
        }else{
            for(let i=0; i<data.length;i++){
                htmlTable += '<tr>'+
                                '<td>' + data[i].nombreAerolinea + ' <img src="img/' + data[i].imagenAerolinea + '" height="35px">' + '</td>'+
                                '<td>' + fromPlace + ' - ' + toPlace + '</td>'+
                                '<td>' + data[i].fechaSalida + ' ' + data[i].horaSalida + '</td>'+
                                '<td> --- </td>'+
                                '<td>' + data[i].disponibilidad + '</td>'+
                                '<td>' + data[i].costoAdulto + '</td>'+
                                '<td>' + data[i].costoNino + '</td>'+
                                '<td>' + data[i].costo + '</td>'+
                                '<td><button type="button" class="btn btn-success" onclick="buyTicket(' + data[0].idVuelo  + ', ' + 0 + ')">Comprar</button></td>'+
                            '</tr>';
            }
        }

        document.querySelector("#dataTable tbody").outerHTML = htmlTable;
        console.log(htmlTable);
    }

}

async function buyTicket(departureFlight, returnFlight){

    /*Estos son los nombres que espera el servicio y los datos que hay que enviar */

    let dataToModify = {
        "departureFlight" : departureFlight,
        "returnFlight" : returnFlight,
        "adults" : adults,
        "kids" : kids,
        "id": sessionStorage.getItem("user")
    }
    let serverAnswer = await fetch(URI,{
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(dataToModify),
    });
    let data = await serverAnswer.json();
    console.log(data);
    alert("Compra exitosa!");
    location.reload();
}