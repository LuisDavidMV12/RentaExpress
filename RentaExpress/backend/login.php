<?php
session_start();
include 'config.php'; // asegúrate de que $conn (PDO) esté definido

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *'); // si front/back mismo origen, no es crítico
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { exit(0); }
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Método no permitido']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
if (json_last_error() !== JSON_ERROR_NONE) {
    echo json_encode(['success' => false, 'message' => 'JSON inválido']);
    exit;
}

$email = trim($input['email'] ?? '');
$password = $input['password'] ?? '';

if (empty($email) || empty($password)) {
    echo json_encode(['success' => false, 'message' => 'Email y contraseña requeridos']);
    exit;
}

try {
    $stmt = $conn->prepare("SELECT id, username, password, name, type FROM users WHERE email = ?");
    $stmt->execute([$email]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user) {
        echo json_encode(['success' => false, 'message' => 'Usuario no encontrado']);
        exit;
    }

    if (!password_verify($password, $user['password'])) {
        echo json_encode(['success' => false, 'message' => 'Contraseña incorrecta']);
        exit;
    }

    // Login OK: crear sesión
    $_SESSION['user_id'] = $user['id'];
    $_SESSION['username'] = $user['username'];
    $_SESSION['user_type'] = $user['type'];
    $_SESSION['name'] = $user['name'];

    echo json_encode([
        'success' => true,
        'message' => 'Login exitoso',
        'redirect' => 'inicio.html'
    ]);
} catch (PDOException $e) {
    error_log('Login error: '.$e->getMessage());
    echo json_encode(['success' => false, 'message' => 'Error en el servidor']);
}
?>
