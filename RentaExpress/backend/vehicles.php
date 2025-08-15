<?php
include 'config.php';

header('Content-Type: application/json');

try {
    $stmt = $conn->prepare("SELECT * FROM vehicles WHERE available = 1 ORDER BY created_at DESC");
    $stmt->execute();
    $vehicles = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'success' => true,
        'vehicles' => $vehicles
    ]);

} catch(PDOException $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Error al obtener vehículos'
    ]);
}
?>
