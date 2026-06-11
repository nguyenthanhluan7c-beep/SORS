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

/* Nhận JSON */

$rawData = file_get_contents("php://input");
$data = json_decode($rawData, true);

if (!is_array($data)) {
    sendJson(
        false,
        "Dữ liệu gửi lên không hợp lệ",
        400
    );
}

/*
 * auth.js của mày gửi tên trường là username,
 * nhưng người dùng có thể nhập username hoặc email.
 */
$loginValue = trim($data["username"] ?? "");
$password = $data["password"] ?? "";

$rememberMe = filter_var(
    $data["rememberMe"] ?? false,
    FILTER_VALIDATE_BOOLEAN
);

if ($loginValue === "" || $password === "") {
    sendJson(
        false,
        "Vui lòng nhập tài khoản và mật khẩu",
        422
    );
}

try {
    $statement = $pdo->prepare("
    SELECT
        id,
        fullname,
        username,
        email,
        password,
        avatar,
        role,
        created_at
    FROM users
    WHERE username = :username
       OR email = :email
    LIMIT 1
");

$statement->execute([
    "username" => $loginValue,
    "email" => $loginValue
]);

    $user = $statement->fetch();

    /*
     * Dùng chung một thông báo cho cả trường hợp:
     * - Không tồn tại tài khoản
     * - Sai mật khẩu
     */
    if (
        !$user ||
        !password_verify($password, $user["password"])
    ) {
        sendJson(
            false,
            "Tên đăng nhập, email hoặc mật khẩu không chính xác",
            401
        );
    }

    /*
     * Nếu PHP đổi thuật toán hash trong tương lai,
     * tự cập nhật lại hash mới.
     */
    if (
        password_needs_rehash(
            $user["password"],
            PASSWORD_DEFAULT
        )
    ) {
        $newPasswordHash = password_hash(
            $password,
            PASSWORD_DEFAULT
        );

        $updatePassword = $pdo->prepare("
            UPDATE users
            SET password = :password
            WHERE id = :id
        ");

        $updatePassword->execute([
            "password" => $newPasswordHash,
            "id" => $user["id"]
        ]);
    }

    /* Cấu hình session */

    $sessionLifetime = $rememberMe
        ? 60 * 60 * 24 * 30
        : 0;

    if ($rememberMe) {
        ini_set(
            "session.gc_maxlifetime",
            (string) $sessionLifetime
        );
    }

    session_name("sors_session");

    session_set_cookie_params([
        "lifetime" => $sessionLifetime,
        "path" => "/",
        "domain" => "",
        "secure" => isset($_SERVER["HTTPS"]),
        "httponly" => true,
        "samesite" => "Lax"
    ]);

    session_start();

    /* Chống session fixation */

    session_regenerate_id(true);

    $_SESSION["user"] = [
        "id" => (int) $user["id"],
        "fullname" => $user["fullname"],
        "username" => $user["username"],
        "email" => $user["email"],
        "avatar" => $user["avatar"],
        "role" => $user["role"]
    ];

    sendJson(
        true,
        "Đăng nhập thành công",
        200,
        [
            "data" => [
                "id" => (int) $user["id"],
                "fullname" => $user["fullname"],
                "username" => $user["username"],
                "email" => $user["email"],
                "avatar" => $user["avatar"],
                "role" => $user["role"],
                "created_at" => $user["created_at"]
            ]
        ]
    );

} catch (PDOException $error) {
    error_log($error->getMessage());

    sendJson(
        false,
        "Không thể đăng nhập vào lúc này",
        500
    );
}
?>