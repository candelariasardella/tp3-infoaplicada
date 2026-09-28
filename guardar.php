<?php
$conn = new mysqli("localhost", "root", "", "juego_arcade");
if ($conn->connect_error) die("Error de conexión");

$data = json_decode(file_get_contents("php://input"), true);
$apodo = $conn->real_escape_string($data['apodo']);
$niveles = (int)$data['niveles'];
$estrellas = (int)$data['estrellas'];
$tiempo = (float)$data['tiempo'];

$sql = "INSERT INTO ranking (apodo, niveles_completados, estrellas_totales, tiempo_total) 
        VALUES ('$apodo', $niveles, $estrellas, $tiempo)";
$conn->query($sql);
$conn->close();
?>