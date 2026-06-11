<?php

header("Content-Type: application/json; charset=utf-8");

require_once __DIR__ . "/../../config/database.php";

$username = trim($_GET["username"] ?? "");

if ($username === "") {
    http_response_code(400);

    echo json_encode([
        "success" => false,
        "message" => "Thiếu username"
    ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

    exit;
}

$sql = "
    SELECT
        id,
        fullname,
        username,
        email,
        avatar,
        role,
        created_at
    FROM users
    WHERE username = ?
    LIMIT 1
";

$statement = $pdo->prepare($sql);
$statement->execute([$username]);

$user = $statement->fetch();

if (!$user) {
    http_response_code(404);

    echo json_encode([
        "success" => false,
        "message" => "Không tìm thấy người dùng"
    ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

    exit;
}

echo json_encode([
    "success" => true,
    "data" => $user
], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);