<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PATCH, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/db_helper.php';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $db = getDatabase();
    $regs = isset($db['registrations']) && is_array($db['registrations']) ? $db['registrations'] : [];
    $atts = isset($db['attendees']) && is_array($db['attendees']) ? $db['attendees'] : [];

    $paidCount = count(array_filter($regs, fn($r) => ($r['paymentStatus'] ?? '') === 'paid'));
    $unpaidCount = count(array_filter($regs, fn($r) => ($r['paymentStatus'] ?? '') !== 'paid'));

    echo json_encode([
        'success' => true,
        'total' => count($regs),
        'counts' => [
            'total' => count($regs),
            'paid' => $paidCount,
            'unpaid' => $unpaidCount,
        ],
        'registrations' => $regs,
        'attendees' => $atts
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $rawInput = file_get_contents('php://input');
    $data = json_decode($rawInput, true);

    if (!$data || !is_array($data)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Invalid JSON body. Registration payload is required.']);
        exit;
    }

    // 1. Mandatory Field Validation
    $fullName = trim(isset($data['fullName']) ? $data['fullName'] : trim(($data['firstName'] ?? '') . ' ' . ($data['lastName'] ?? '')));
    $email = strtolower(trim($data['email'] ?? ''));
    $rawPhone = trim($data['phone'] ?? '');
    $cleanPhone = preg_replace('/\D/', '', $rawPhone);

    if (empty($fullName) || strlen($fullName) < 2) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Full Name is required and must be at least 2 characters.']);
        exit;
    }

    if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'A valid email address is required (e.g. delegate@example.com).']);
        exit;
    }

    if (empty($cleanPhone) || strlen($cleanPhone) < 10) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'A valid 10-digit mobile number is required.']);
        exit;
    }

    // 2. Strict Duplicate Prevention (Email & Phone)
    $db = getDatabase();
    if (isset($db['registrations']) && is_array($db['registrations'])) {
        foreach ($db['registrations'] as $existing) {
            $exEmail = strtolower(trim($existing['email'] ?? ''));
            $exPhone = preg_replace('/\D/', '', $existing['phone'] ?? '');

            $emailMatch = !empty($email) && $exEmail === $email;
            $phoneMatch = !empty($cleanPhone) && strlen($cleanPhone) >= 10 && substr($exPhone, -10) === substr($cleanPhone, -10);

            if ($emailMatch || $phoneMatch) {
                http_response_code(409);
                $dupField = $emailMatch ? "Email Address ({$email})" : "Mobile Number ({$rawPhone})";
                echo json_encode([
                    'success' => false,
                    'error' => "A registration already exists with this {$dupField}. Duplicate registrations are strictly not allowed.",
                    'duplicateReference' => $existing['reference'] ?? '',
                    'reference' => $existing['reference'] ?? '',
                    'registrationId' => $existing['id'] ?? ''
                ], JSON_UNESCAPED_UNICODE);
                exit;
            }
        }
    }

    // 3. Save new registration with continuous sequential Entry ID and Reference
    require_once __DIR__ . '/mailer.php';
    $registration = saveNewRegistration($data);

    // If unpaid, dispatch pending payment email with payment link
    if (isset($registration['email']) && !empty($registration['email'])) {
        @sendPendingPaymentEmail($registration);
    }

    http_response_code(201);
    echo json_encode([
        'status' => 'success',
        'success' => true,
        'registration' => $registration,
        'message' => "Registration {$registration['reference']} recorded successfully."
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'PATCH') {
    $rawInput = file_get_contents('php://input');
    $data = json_decode($rawInput, true);
    $id = isset($_GET['id']) ? trim($_GET['id']) : (isset($data['id']) ? trim($data['id']) : '');

    if (!$id) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Missing registration ID to update']);
        exit;
    }

    $db = getDatabase();
    $targetIndex = -1;
    if (isset($db['registrations'])) {
        foreach ($db['registrations'] as $idx => $r) {
            if ($r['id'] === $id || ($r['reference'] ?? '') === $id) {
                $targetIndex = $idx;
                break;
            }
        }
    }

    if ($targetIndex === -1) {
        http_response_code(404);
        echo json_encode(['success' => false, 'error' => 'Registration not found']);
        exit;
    }

    // Apply patch updates
    unset($data['id']);
    $db['registrations'][$targetIndex] = array_merge($db['registrations'][$targetIndex], $data);
    $updatedReg = $db['registrations'][$targetIndex];

    // Sync to attendees
    if (isset($db['attendees'])) {
        foreach ($db['attendees'] as &$a) {
            if ($a['registrationId'] === $updatedReg['id'] || ($a['reference'] ?? '') === $updatedReg['reference']) {
                if (isset($data['paymentStatus'])) $a['paymentStatus'] = $data['paymentStatus'];
                if (isset($data['checkInStatus'])) $a['checkInStatus'] = $data['checkInStatus'];
            }
        }
    }

    saveDatabaseDirect($db);
    dispatchRealtimeEvent('registration.updated', [
        'id' => $updatedReg['id'],
        'reference' => $updatedReg['reference'],
        'registration' => $updatedReg
    ]);

    echo json_encode(['success' => true, 'registration' => $updatedReg]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $rawInput = file_get_contents('php://input');
    $data = json_decode($rawInput, true);
    $id = isset($_GET['id']) ? trim($_GET['id']) : (isset($data['id']) ? trim($data['id']) : '');

    if (!$id) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing registration ID to delete']);
        exit;
    }

    $deleted = deleteRegistrationById($id);
    echo json_encode([
        'success' => $deleted,
        'message' => $deleted ? "Entry {$id} deleted" : "Entry not found"
    ]);
    exit;
}
