<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$rawInput = file_get_contents('php://input');
$data = json_decode($rawInput, true);

if ($data && is_array($data)) {
    require_once __DIR__ . '/db_helper.php';
    $merged = syncMergeDatabase($data);
    echo json_encode([
        'success' => true,
        'message' => 'Database synchronized safely',
        'registrationsCount' => count($merged['registrations'] ?? []),
        'attendeesCount' => count($merged['attendees'] ?? []),
        'crmContactsCount' => count($merged['crmContacts'] ?? []),
        'usersCount' => count($merged['users'] ?? [])
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

http_response_code(400);
echo json_encode(['error' => 'Invalid data payload']);
