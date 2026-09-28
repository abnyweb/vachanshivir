<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Razorpay-Signature');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS' || $_SERVER['REQUEST_METHOD'] === 'GET') {
    http_response_code(200);
    echo json_encode(['status' => 'ok', 'message' => 'Razorpay Webhook Endpoint Active']);
    exit;
}

require_once __DIR__ . '/db_helper.php';

$secret = 'whsec_vachan_shivir_2026_prod';
$rawInput = file_get_contents('php://input');
$signature = isset($_SERVER['HTTP_X_RAZORPAY_SIGNATURE']) ? $_SERVER['HTTP_X_RAZORPAY_SIGNATURE'] : '';

// Audit logging
$logEntry = [
    'timestamp' => date('c'),
    'ip' => isset($_SERVER['REMOTE_ADDR']) ? $_SERVER['REMOTE_ADDR'] : '',
    'signature' => $signature,
    'body' => json_decode($rawInput, true)
];
@file_put_contents(__DIR__ . '/data/webhooks.log', json_encode($logEntry, JSON_UNESCAPED_UNICODE) . PHP_EOL, FILE_APPEND | LOCK_EX);

// Verify Signature if provided
if (!empty($signature)) {
    $expected = hash_hmac('sha256', $rawInput, $secret);
    if (!hash_equals($expected, $signature)) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid webhook signature']);
        exit;
    }
}

$data = json_decode($rawInput, true);
if (!$data || !isset($data['event'])) {
    http_response_code(200);
    echo json_encode(['status' => 'ok', 'message' => 'No event payload']);
    exit;
}

$event = $data['event'];
$payload = isset($data['payload']) ? $data['payload'] : [];

if ($event === 'payment.captured' || $event === 'order.paid') {
    $payment = isset($payload['payment']['entity']) ? $payload['payment']['entity'] : [];
    $order = isset($payload['order']['entity']) ? $payload['order']['entity'] : [];

    $paymentId = isset($payment['id']) ? $payment['id'] : '';
    $orderId = isset($order['id']) ? $order['id'] : (isset($payment['order_id']) ? $payment['order_id'] : '');

    $notes = isset($order['notes']) ? $order['notes'] : (isset($payment['notes']) ? $payment['notes'] : []);
    $regIdOrRef = isset($notes['registrationId']) ? $notes['registrationId'] : (isset($notes['reference']) ? $notes['reference'] : '');

    if ($regIdOrRef) {
        updateRegistrationPayment($regIdOrRef, $paymentId, $orderId);
    } elseif (!empty($payment['email']) || !empty($payment['contact'])) {
        // Fallback: match by email or phone
        $db = getDatabase();
        $email = strtolower(trim($payment['email'] ?? ''));
        $phone = preg_replace('/\D/', '', $payment['contact'] ?? '');

        if (isset($db['registrations'])) {
            foreach ($db['registrations'] as &$r) {
                $rEmail = strtolower(trim($r['email'] ?? ''));
                $rPhone = preg_replace('/\D/', '', $r['phone'] ?? '');
                if (($email && $rEmail === $email) || ($phone && substr($rPhone, -10) === substr($phone, -10))) {
                    updateRegistrationPayment($r['id'], $paymentId, $orderId);
                    break;
                }
            }
        }
    }
} elseif ($event === 'payment.failed') {
    $payment = isset($payload['payment']['entity']) ? $payload['payment']['entity'] : [];
    $notes = isset($payment['notes']) ? $payment['notes'] : [];
    $regIdOrRef = isset($notes['registrationId']) ? $notes['registrationId'] : (isset($notes['reference']) ? $notes['reference'] : '');
    $errorDesc = isset($payment['error_description']) ? $payment['error_description'] : 'Payment cancelled or failed';

    if ($regIdOrRef) {
        updateRegistrationPaymentFailed($regIdOrRef, $errorDesc);
    } elseif (!empty($payment['email'])) {
        $db = getDatabase();
        $email = strtolower(trim($payment['email'] ?? ''));
        if (isset($db['registrations'])) {
            foreach ($db['registrations'] as $r) {
                if (strtolower(trim($r['email'] ?? '')) === $email) {
                    updateRegistrationPaymentFailed($r['id'], $errorDesc);
                    break;
                }
            }
        }
    }
}

http_response_code(200);
echo json_encode(['status' => 'ok', 'received' => true]);
