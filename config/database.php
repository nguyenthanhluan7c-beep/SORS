<?php

$host = "localhost";
$database = "webserver";
$username = "root";
$password = ""; // XAMPP thường để rỗng

$dsn = "mysql:host=$host;dbname=$database;charset=utf8mb4";

$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false
];

try {
    $pdo = new PDO(
        $dsn,
        $username,
        $password,
        $options
    );
} catch (PDOException $error) {
    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" => $error->getMessage()
    ], JSON_UNESCAPED_UNICODE);

    exit;
}
?>