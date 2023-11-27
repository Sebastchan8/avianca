import { serverIP } from './ip-config';
let URI = `http://${serverIP}/avianca-master/Controller/tripController.php`
var htmlTable = "";


window.onload = function(){
    showTrip();
}

async function showTrip(){
    let serverAnswer = await fetch(URI);
    let data = await serverAnswer.json();
    console.log(data);
    for(let i = 0; i < data.length; i++){
        if(data[i].vueloVuelta != 0){
            htmlTable += '<tr>'+
                            '<td>' + data[i].vueloIda.nombreAerolinea + ' <img src="img/' + data[i].vueloIda.imagenAerolinea + '" height="35px">' + '</td>'+
                            '<td>' + data[i].vueloIda.salida + ' - ' + data[i].vueloIda.destino + '</td>'+
                            '<td>' + data[i].vueloIda.fechaSalida + ' ' + data[i].vueloIda.horaSalida + '</td>'+
                            '<td>' + data[i].vueloVuelta.fechaSalida + ' ' + data[i].vueloVuelta.horaSalida + '</td>'+
                            '<td>' + data[i].adultos + '</td>'+
                            '<td>' + data[i].ninos + '</td>'+
                            '<td>' + (parseInt(data[i].vueloIda.costoAdulto) + parseInt(data[i].vueloVuelta.costoAdulto)) + '</td>'+
                            '<td>' + (parseInt(data[i].vueloIda.costoNino) + parseInt(data[i].vueloVuelta.costoNino)) + '</td>'+
                            '<td>' 
                                + (((parseInt(data[i].vueloIda.costoAdulto) + parseInt(data[i].vueloVuelta.costoAdulto))) * parseInt(data[i].adultos) +
                                ((parseInt(data[i].vueloIda.costoNino) + parseInt(data[i].vueloVuelta.costoNino))) * parseInt(data[i].ninos)) +
                            '</td>'+
                        '</tr>';
        }else{
            htmlTable += '<tr>'+
                            '<td>' + data[i].vueloIda.nombreAerolinea + ' <img src="img/' + data[i].vueloIda.imagenAerolinea + '" height="35px">' + '</td>'+
                            '<td>' + data[i].vueloIda.salida + ' - ' + data[i].vueloIda.destino + '</td>'+
                            '<td>' + data[i].vueloIda.fechaSalida + ' ' + data[i].vueloIda.horaSalida + '</td>'+
                            '<td> --- </td>'+
                            '<td>' + data[i].vueloIda.disponibilidad + '</td>'+
                            '<td>' + data[i].vueloIda.costoAdulto + '</td>'+
                            '<td>' + data[i].vueloIda.costoNino + '</td>'+
                            '<td>' + data[i].vueloIda.costo + '</td>'+
                        '</tr>';
        }

        document.querySelector("#dataTable tbody").outerHTML = htmlTable;
    }
        
}