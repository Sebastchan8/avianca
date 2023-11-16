<?php
    include_once("../data-access/dataAccess.php");

    header("Content-Type: application/json");

    if($_SERVER['REQUEST_METHOD'] == "GET"){
        DataAccess::showTrip();
    }
?>