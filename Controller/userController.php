<?php
    include_once("../data-access/dataAccess.php");
    
    header("Content-Type: application/json");
    
    switch($_SERVER['REQUEST_METHOD']){
        case 'GET': 
            DataAccess::login();
            break;
        case 'POST':
            DataAccess::insertUser();
            break;
    }
?>