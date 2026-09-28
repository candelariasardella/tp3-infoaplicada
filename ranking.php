<?php
$conn = new mysqli("localhost", "root", "", "juego_arcade");
if ($conn->connect_error) die("Error de conexión");

// Reglas de orden: Más niveles, luego más estrellas, luego menos tiempo
$sql = "SELECT apodo, tiempo_total, estrellas_totales 
        FROM ranking 
        ORDER BY niveles_completados DESC, estrellas_totales DESC, tiempo_total ASC 
        LIMIT 5";

$result = $conn->query($sql);
$ranking = [];
while($row = $result->fetch_assoc()) {
    $ranking[] = $row;
}
echo json_encode($ranking);
$conn->close();
?>