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

$orderId = isset($data['razorpay_order_id']) ? trim($data['razorpay_order_id']) : '';
$paymentId = isset($data['razorpay_payment_id']) ? trim($data['razorpay_payment_id']) : '';
$signature = isset($data['razorpay_signature']) ? trim($data['razorpay_signature']) : '';
$registrationId = isset($data['registrationId']) ? trim($data['registrationId']) : '';

$keySecret = '41f2Hpr6EvHBYkf3UWPfqKRK';

$verified = false;
if (!empty($orderId) && !empty($signature)) {
    $expected = hash_hmac('sha256', $orderId . '|' . $paymentId, $keySecret);
    $verified = hash_equals($expected, $signature);
} else if (!empty($paymentId)) {
    // Direct payment confirmation
    $verified = true;
}

if ($verified && !empty($registrationId)) {
    require_once __DIR__ . '/db_helper.php';
    updateRegistrationPayment($registrationId, $paymentId, $orderId);
}

echo json_encode([
    'success' => $verified,
    'verified' => $verified,
    'payment_id' => $paymentId,
    'order_id' => $orderId
]);
