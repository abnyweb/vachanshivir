<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/db_helper.php';
require_once __DIR__ . '/mailer.php';

$rawInput = file_get_contents('php://input');
$data = json_decode($rawInput, true);

$action = isset($data['action']) ? $data['action'] : 'test';
$to = isset($data['to']) ? trim($data['to']) : '';
$regId = isset($data['registrationId']) ? trim($data['registrationId']) : '';

if ($action === 'test') {
    if (empty($to)) {
        http_response_code(400);
        echo json_encode(['error' => 'Recipient email is required']);
        exit;
    }
    $sent = sendTransactionEmail(
        $to,
        "परीक्षण ईमेल — वचन अध्ययन शिविर 2026 (SMTP Test)",
        "<div style='font-family: sans-serif; padding: 20px; color: #091E3A;'><h2>वचन अध्ययन शिविर 2026</h2><p>ईमेल प्रेषण प्रणाली (SMTP / Mailer) सफलतापूर्वक सक्रिय है।</p><p>समय: " . date('c') . "</p></div>"
    );
    echo json_encode(['success' => $sent, 'sent' => $sent, 'to' => $to]);
    exit;
}

if ($action === 'resend_payment_link' || $action === 'resend_ticket') {
    $db = getDatabase();
    $found = null;
    if (isset($db['registrations'])) {
        foreach ($db['registrations'] as $r) {
            if ($r['id'] === $regId || (isset($r['reference']) && $r['reference'] === $regId)) {
                $found = $r;
                break;
            }
        }
    }

    if (!$found) {
        http_response_code(404);
        echo json_encode(['error' => 'Registration not found']);
        exit;
    }

    if ($action === 'resend_payment_link') {
        $sent = sendPendingPaymentEmail($found);
    } else {
        $sent = sendSuccessTicketEmail($found, $found['transactionId'] ?? '');
    }

    echo json_encode([
        'success' => $sent,
        'sent' => $sent,
        'reference' => $found['reference'],
        'email' => $found['email']
    ]);
    exit;
}

http_response_code(400);
echo json_encode(['error' => 'Unknown action']);
