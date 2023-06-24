<?php
// this php script is for connecting with database
// data has to be fetched from local server
  
// Username is root
$user = 'root';
$password = '1234';
  
// Database name is geeksforgeeks
$database = 'test';
  
// Server is localhost with
// port number 3306
$servername='localhost:3306';
$mysqli = new mysqli($servername, $user,
                $password, $database);
  
// Checking for connections
if (!$mysqli){
    echo "Connection Unsuccessful!!!";
}
  
?>