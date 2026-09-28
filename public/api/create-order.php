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

$amount = isset($data['amount']) ? intval($data['amount']) : 300000;
$currency = isset($data['currency']) ? $data['currency'] : 'INR';
$receipt = isset($data['receipt']) ? $data['receipt'] : 'rcpt_' . time();
$notes = isset($data['notes']) && is_array($data['notes']) ? $data['notes'] : [];

$keyId = 'rzp_live_Tfk3yh7AAwlNYr';
$keySecret = '41f2Hpr6EvHBYkf3UWPfqKRK';

$payload = json_encode([
    'amount' => $amount,
    'currency' => $currency,
    'receipt' => $receipt,
    'notes' => $notes,
    'payment_capture' => 1
]);

$ch = curl_init('https://api.razorpay.com/v1/orders');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_USERPWD, $keyId . ':' . $keySecret);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
curl_setopt($ch, CURLOPT_TIMEOUT, 15);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curlError = curl_error($ch);
curl_close($ch);

if ($httpCode >= 200 && $httpCode < 300 && $response) {
    $resData = json_decode($response, true);
    if (!empty($resData['id'])) {
        echo json_encode([
            'success' => true,
            'order_id' => $resData['id'],
            'amount' => $resData['amount'],
            'currency' => $resData['currency'],
            'key_id' => $keyId
        ]);
        exit;
    }
}

// Fallback response with key_id
echo json_encode([
    'success' => false,
    'key_id' => $keyId,
    'amount' => $amount,
    'currency' => $currency,
    'error' => $curlError ?: 'Razorpay order fallback'
]);
