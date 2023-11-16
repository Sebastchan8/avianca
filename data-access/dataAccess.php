<?php
    include_once("connection.php");

    class DataAccess{
        
        static $connectedInstance;

        private static function establishConnection(){
            if(self::$connectedInstance == null){
                self::$connectedInstance = Connection::connect();
            }
        }

        static function selectAvailableFlights(){
            self::establishConnection();

            /*Estos son los nombres que está esperando el servicio, mismos que se enviarán por el URL 
            departure se usará para definir la salida, y destination para el destino, o return para la vuelta*/
            $departure = $_GET['departure'];
            $destination = $_GET['destination'];
            $departureDate = $_GET['departureDate'];
            $returnDate = $_GET['returnDate'];
            $adults = $_GET['adults'];
            $kids = $_GET['kids'];


            /*En caso de notar algo que se traiga y sea innecesario, avisarme para modificar esta parte*/
            $sql = "SELECT DISTINCT v.id idVuelo, a.id idAerolinea, a.nombre nombreAerolinea, a.imagen imagenAerolinea, ".
                "v.fecha_salida fechaSalida, v.hora_salida horaSalida, v.hora_llegada horaLlegada, v.id_salida idSalida, v.id_destino idDestino, ".
                "v.disponibilidad disponibilidad, v.costo_adulto costoAdulto, v.costo_nino costoNino, ".
                "(v.costo_adulto * $adults + v.costo_nino * $kids) costo ".
                "FROM vuelos v, aerolineas a, ciudades c ".
                "WHERE v.id_aerolinea = a.id ".
                "AND v.id_salida = $departure AND v.id_destino = $destination ".
                "AND v.fecha_salida = '$departureDate'";
                

            $preparedStatement = self::$connectedInstance->prepare($sql);
            if(!$preparedStatement->execute()){
                die("Error en la operación de Busqueda 1");
            }
            $departureTrip = $preparedStatement->fetchAll(PDO::FETCH_ASSOC);
            $answer = $departureTrip;

            /*Dado que la info se pasa por URL, entonces cuando el vuelo sea solo de ida, se ha de registrar la palabra "null"
            Si el vuelo es de ida y vuelta, entonces ejecuta la consulta debajo dado que el regreso se trata como un vuelo nuevo
            cuyo origen es el destino seleccionado y el destino es el origen seleccionado*/
            if($returnDate != "null"){
                $sql = "SELECT DISTINCT v.id idVuelo, a.id idAerolinea, a.nombre nombreAerolinea, a.imagen imagenAerolinea, ".
                "v.fecha_salida fechaSalida, v.hora_salida horaSalida, v.hora_llegada horaLlegada, v.id_salida idSalida, v.id_destino idDestino, ".
                "v.disponibilidad disponibilidad, v.costo_adulto costoAdulto, v.costo_nino costoNino, ".
                "(v.costo_adulto * $adults + v.costo_nino * $kids) costo ".
                "FROM vuelos v, aerolineas a, ciudades c ".
                "WHERE v.id_aerolinea = a.id ".
                "AND v.id_salida = $destination AND v.id_destino = $departure ".
                "AND v.fecha_salida = '$returnDate'";

                $preparedStatement = self::$connectedInstance->prepare($sql);
                if(!$preparedStatement->execute()){
                    die("Error en la operación de Busqueda 2");
                }
                $returnTrip = $preparedStatement->fetchAll(PDO::FETCH_ASSOC);
                
                /*Hace pares entre los vuelos de ida, y los vuelos de regreso, generando un solo objeto que tiene 2 vuelos */
                $answer = array();
                $arrayLenght = min(count($departureTrip),count($returnTrip));
                for($i = 0; $i < $arrayLenght; $i++){
                    $answer[] = new stdClass();
                    $answer[$i]->departureTrip = $departureTrip[$i];
                    $answer[$i]->returnTrip = $returnTrip[$i];
                }
            }

            echo json_encode($answer);
            return;
        }

        static function buyFlight(){

            self::establishConnection();

            /*Los nombres después de '->' son los que se han de usar en el cuerpo de la solicitud PUT, y por tanto con los que se debe 
            generar el JSON en el cliente*/
            $clientInfo = json_decode(file_get_contents("php://input"));
            $departureFlight = $clientInfo->departureFlight;
            $returnFlight = $clientInfo->returnFlight;
            $adults = $clientInfo->adults;
            $kids = $clientInfo->kids;
            $id = $clientInfo->id;
            
            $sql = "UPDATE vuelos SET disponibilidad = disponibilidad - ($adults + $kids) WHERE id = $departureFlight";

            if($returnFlight != null){
                $sql = $sql . " OR id = $returnFlight";
            }

            $preparedStatement = self::$connectedInstance->prepare($sql);
            if(!$preparedStatement->execute()){
                die("Error en la operación de Actualización");
            }

            $sql = "INSERT INTO viajes VALUES($id,$departureFlight,$returnFlight,$adults,$kids)";

            $preparedStatement = self::$connectedInstance->prepare($sql);
            if(!$preparedStatement->execute()){
                die("Error en la operación de Inserción");
            }
        }


        static function showTrip(){
            
            self::establishConnection();
            
            /*Aquí también hay que cambiar '1' por la variable de sesión*/
            $sql = "SELECT id_vuelo_ida vueloIda, id_vuelo_regreso vueloVuelta, adultos, ninos ".
                "FROM viajes ".
                "WHERE cedula = '1'";

            $preparedStatement = self::$connectedInstance->prepare($sql);
            if(!$preparedStatement->execute()){
                die("Error en la operación de Selección de los datos de Viajes");
            }

            $tripInfo = $preparedStatement->fetchAll(PDO::FETCH_ASSOC);
            
            for($i = 0; $i < count($tripInfo); $i++){
                $tripInfo[$i]['vueloIda'] = self::getTripInfo($tripInfo[$i]['vueloIda']);
                if($tripInfo[$i]['vueloVuelta'] != 0){
                    $tripInfo[$i]['vueloVuelta'] = self::getTripInfo($tripInfo[$i]['vueloVuelta']);
                }
            }
            
            echo json_encode($tripInfo);
        }

        private static function getTripInfo($tripId){
            $sql = "
                SELECT v.id idVuelo, a.nombre nombreAerolinea, a.imagen imagenAerolinea, 
                v.fecha_salida fechaSalida, v.hora_salida horaSalida, v.hora_llegada horaLlegada, 
                v.id_salida salida, v.id_destino destino, 
                v.costo_adulto costoAdulto, v.costo_nino costoNino
                FROM vuelos v, aerolineas a
                WHERE v.id = $tripId
                AND a.id = v.id_aerolinea
            ";

            $preparedStatement = self::$connectedInstance->prepare($sql);
            if(!$preparedStatement->execute()){
                die("Error en la operación de Selección de la información del Vuelo");
            }

            $trip = $preparedStatement->fetchAll(PDO::FETCH_ASSOC);

            for($i = 0; $i < count($trip); $i++){
                $trip[$i]['salida'] = self::getCityName($trip[$i]['salida']);
                $trip[$i]['destino'] = self::getCityName($trip[$i]['destino']);
            }

            return $trip[0];

        }

        private static function getCityName($cityID){
            $sql = "
                SELECT nombre
                FROM ciudades
                WHERE id = $cityID
            ";

            $preparedStatement = self::$connectedInstance->prepare($sql);
            if(!$preparedStatement->execute()){
                die("Error en la operación de Selección de la Ciudad");
            }

            return $preparedStatement->fetchAll(PDO::FETCH_ASSOC)[0]['nombre'];
        }

        static function login(){
            self::establishConnection();

            $user = $_GET['user'];
            $password = $_GET['password'];

            $sql = "SELECT * FROM usuarios WHERE cedula = '$user' AND contrasenia = '$password'";
                

            $preparedStatement = self::$connectedInstance->prepare($sql);
            if(!$preparedStatement->execute()){
                die("Error en la operación de login");
            }
            $departureTrip = $preparedStatement->fetchAll(PDO::FETCH_ASSOC);
            $answer = $departureTrip;

            echo json_encode($answer);
            return;
        }


        static function insertUser(){

            self::establishConnection();
            
            $clientInfo = json_decode(file_get_contents("php://input"));
            $id = $clientInfo->id;
            $name = $clientInfo->name;
            $lastName = $clientInfo->lastName;
            $phone = $clientInfo->phone;
            $card = $clientInfo->card;
            $password = $clientInfo->password;
            
            $sql = "INSERT INTO usuarios VALUES('$id','$name','$lastName','$phone','$card','$password')";
            
            $preparedStatement = self::$connectedInstance->prepare($sql);
            if(!$preparedStatement->execute()){
                die("Error en la operación de Inserción");
            }
        }

    }
?>