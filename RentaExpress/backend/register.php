<?php
session_start();
include 'config.php';

$allowed_origin = 'http://localhost:5500';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: $allowed_origin');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Manejar preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    
    // Verificar que se recibió JSON válido
    if (json_last_error() !== JSON_ERROR_NONE) {
        echo json_encode([
            'success' => false,
            'message' => 'Datos JSON inválidos'
        ]);
        exit;
    }
    
    // Obtener datos del formulario
    $username = trim($input['username'] ?? '');
    $email = trim($input['email'] ?? '');
    $password = $input['password'] ?? '';
    $name = trim($input['name'] ?? '');
    $phone = trim($input['phone'] ?? '');
    
    // Validaciones básicas
    if (empty($username) || empty($email) || empty($password) || empty($name)) {
        echo json_encode([
            'success' => false,
            'message' => 'Todos los campos obligatorios deben completarse'
        ]);
        exit;
    }
    
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        echo json_encode([
            'success' => false,
            'message' => 'Email no válido'
        ]);
        exit;
    }
    
    if (strlen($password) < 6) {
        echo json_encode([
            'success' => false,
            'message' => 'La contraseña debe tener al menos 6 caracteres'
        ]);
        exit;
    }
    
    try {
        // Verificar si el email ya existe
        $stmt = $conn->prepare("SELECT id FROM users WHERE email = ?");
        $stmt->execute([$email]);
        
        if ($stmt->fetch()) {
            echo json_encode([
                'success' => false,
                'message' => 'El email ya está registrado'
            ]);
            exit;
        }
        
        // Verificar si el username ya existe
        $stmt = $conn->prepare("SELECT id FROM users WHERE username = ?");
        $stmt->execute([$username]);
        
        if ($stmt->fetch()) {
            echo json_encode([
                'success' => false,
                'message' => 'El nombre de usuario ya existe'
            ]);
            exit;
        }
        
        // ✅ HASH de la contraseña para seguridad
        $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
        
        // Insertar usuario con contraseña hasheada
        $stmt = $conn->prepare("INSERT INTO users (username, email, password, name, phone, type) VALUES (?, ?, ?, ?, ?, 'user')");
        $result = $stmt->execute([$username, $email, $hashedPassword, $name, $phone]);
        
        if ($result) {
            $user_id = $conn->lastInsertId();
            
            // Iniciar sesión automáticamente
            $_SESSION['user_id'] = $user_id;
            $_SESSION['username'] = $username;
            $_SESSION['user_type'] = 'user';
            $_SESSION['name'] = $name;
            
            echo json_encode([
                'success' => true,
                'message' => 'Registro exitoso. ¡Bienvenido a RentExpress!',
                'user' => [
                    'id' => $user_id,
                    'username' => $username,
                    'name' => $name,
                    'email' => $email,
                    'type' => 'user'
                ],
                'redirect' => 'index.html'
            ]);
        } else {
            echo json_encode([
                'success' => false,
                'message' => 'Error al registrar usuario'
            ]);
        }
        
    } catch(PDOException $e) {
        // Log del error para debugging
        error_log("Error de registro: " . $e->getMessage());
        
        echo json_encode([
            'success' => false,
            'message' => 'Error en el servidor. Intenta nuevamente.'
        ]);
    }
} else {
    echo json_encode([
        'success' => false,
        'message' => 'Método no permitido'
    ]);
}
?>