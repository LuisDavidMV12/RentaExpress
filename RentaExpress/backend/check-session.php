<?php
session_start();
header('Content-Type: application/json');

$authenticated = isset($_SESSION['user_id']);

echo json_encode([
  'authenticated' => $authenticated,
  'user' => $authenticated ? [
      'id' => $_SESSION['user_id'],
      'username' => $_SESSION['username'] ?? null,
      // tu JS espera 'role'; lo mapeamos desde user_type
      'role' => $_SESSION['user_type'] ?? 'user'
  ] : null
]);
