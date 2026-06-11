<?php

header("Content-Type: application/json; charset=utf-8");

require_once __DIR__ . "/../../config/database.php";

function sendJson(
    bool $success,
    string $message,
    int $statusCode = 200,
    array $extra = []
): never {
    http_response_code($statusCode);

    echo json_encode(
        array_merge([
            "success" => $success,
            "message" => $message
        ], $extra),
        JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES
    );

    exit;
}

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    sendJson(
        false,
        "Phương thức không được hỗ trợ",
        405
    );
}

/* Nhận JSON từ JavaScript */

$rawData = file_get_contents("php://input");
$data = json_decode($rawData, true);

if (!is_array($data)) {
    sendJson(
        false,
        "Dữ liệu gửi lên không hợp lệ",
        400
    );
}

$fullname = trim($data["fullname"] ?? "");
$username = trim($data["username"] ?? "");
$email = trim($data["email"] ?? "");
$password = $data["password"] ?? "";

/* Kiểm tra dữ liệu */

if (
    $fullname === "" ||
    $username === "" ||
    $email === "" ||
    $password === ""
) {
    sendJson(
        false,
        "Vui lòng nhập đầy đủ thông tin",
        422
    );
}

if (strlen($fullname) > 100) {
    sendJson(
        false,
        "Họ tên không được vượt quá 100 ký tự",
        422
    );
}

if (
    strlen($username) < 3 ||
    strlen($username) > 30
) {
    sendJson(
        false,
        "Tên đăng nhập phải từ 3 đến 30 ký tự",
        422
    );
}

/*
 * Chỉ cho phép chữ, số, dấu gạch dưới,
 * dấu chấm và dấu gạch ngang.
 */
if (!preg_match("/^[a-zA-Z0-9_.-]+$/", $username)) {
    sendJson(
        false,
        "Tên đăng nhập chứa ký tự không hợp lệ",
        422
    );
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    sendJson(
        false,
        "Email không hợp lệ",
        422
    );
}

if (strlen($email) > 150) {
    sendJson(
        false,
        "Email quá dài",
        422
    );
}

if (strlen($password) < 8) {
    sendJson(
        false,
        "Mật khẩu phải có ít nhất 8 ký tự",
        422
    );
}

if (strlen($password) > 72) {
    sendJson(
        false,
        "Mật khẩu không được vượt quá 72 ký tự",
        422
    );
}

/* Chuyển email về chữ thường */

$email = strtolower($email);

try {
    /* Kiểm tra username hoặc email đã tồn tại */

    $checkStatement = $pdo->prepare("
        SELECT username, email
        FROM users
        WHERE username = :username
           OR email = :email
    ");

    $checkStatement->execute([
        "username" => $username,
        "email" => $email
    ]);

    $existingUsers = $checkStatement->fetchAll();

    foreach ($existingUsers as $existingUser) {
        if (
            strcasecmp(
                $existingUser["username"],
                $username
            ) === 0
        ) {
            sendJson(
                false,
                "Tên đăng nhập đã được sử dụng",
                409
            );
        }

        if (
            strcasecmp(
                $existingUser["email"],
                $email
            ) === 0
        ) {
            sendJson(
                false,
                "Email đã được sử dụng",
                409
            );
        }
    }

    /* Hash mật khẩu */

    $passwordHash = password_hash(
        $password,
        PASSWORD_DEFAULT
    );

    if ($passwordHash === false) {
        sendJson(
            false,
            "Không thể xử lý mật khẩu",
            500
        );
    }

    $defaultAvatar =
        "https://res.cloudinary.com/dngjmqa1q/image/upload/v1778679148/acoijmsaftfjmvstcubt.png";

    /* Thêm tài khoản */

    $insertStatement = $pdo->prepare("
        INSERT INTO users (
            fullname,
            username,
            email,
            password,
            avatar,
            role
        )
        VALUES (
            :fullname,
            :username,
            :email,
            :password,
            :avatar,
            :role
        )
    ");

    $insertStatement->execute([
        "fullname" => $fullname,
        "username" => $username,
        "email" => $email,
        "password" => $passwordHash,
        "avatar" => $defaultAvatar,
        "role" => "member"
    ]);

    sendJson(
        true,
        "Đăng ký tài khoản thành công",
        201,
        [
            "data" => [
                "id" => (int) $pdo->lastInsertId(),
                "fullname" => $fullname,
                "username" => $username,
                "email" => $email,
                "avatar" => $defaultAvatar,
                "role" => "member"
            ]
        ]
    );

} catch (PDOException $error) {
    /*
     * 23000 thường là lỗi trùng dữ liệu UNIQUE.
     */
    if ($error->getCode() === "23000") {
        sendJson(
            false,
            "Tên đăng nhập hoặc email đã tồn tại",
            409
        );
    }

    error_log($error->getMessage());

    sendJson(
        false,
        "Không thể tạo tài khoản",
        500
    );
}
?>