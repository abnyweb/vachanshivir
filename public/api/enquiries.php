<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/db_helper.php';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $db = getDatabase();
    echo json_encode([
        'success' => true,
        'enquiries' => isset($db['enquiries']) ? $db['enquiries'] : []
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $rawInput = file_get_contents('php://input');
    $data = json_decode($rawInput, true);

    if (!$data || !is_array($data)) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid JSON body']);
        exit;
    }

    $db = getDatabase();
    $now = date('c');
    $id = 'enq_' . time() . '_' . substr(md5(uniqid()), 0, 4);

    $name = trim($data['name'] ?? 'Inquirer');
    $email = strtolower(trim($data['email'] ?? ''));
    $phone = trim($data['phone'] ?? '');

    $newEnquiry = [
        'id' => $id,
        'name' => $name,
        'email' => $email,
        'phone' => $phone,
        'subject' => trim($data['subject'] ?? 'Website Inquiry'),
        'message' => trim($data['message'] ?? ''),
        'status' => 'new',
        'createdAt' => $now,
    ];

    if (!isset($db['enquiries'])) $db['enquiries'] = [];
    array_unshift($db['enquiries'], $newEnquiry);

    // Sync to CRM Contacts as lead if email is provided
    if ($email) {
        $contactId = 'crm_cnt_' . time() . '_' . substr(md5($email), 0, 5);
        $nameParts = explode(' ', $name, 2);
        if (!isset($db['crmContacts'])) $db['crmContacts'] = [];
        $existingIdx = -1;
        foreach ($db['crmContacts'] as $idx => $c) {
            if (strtolower($c['email'] ?? '') === $email) {
                $existingIdx = $idx;
                break;
            }
        }
        if ($existingIdx === -1) {
            array_unshift($db['crmContacts'], [
                'id' => $contactId,
                'firstName' => $nameParts[0],
                'lastName' => $nameParts[1] ?? '',
                'fullName' => $name,
                'email' => $email,
                'phone' => $phone,
                'whatsapp' => $phone,
                'contactType' => 'inquiry',
                'lifecycle' => 'lead',
                'leadSource' => 'Website Inquiry Form',
                'tags' => ['WEBSITE_INQUIRY', 'LEAD'],
                'consent' => true,
                'notes' => 'Inquiry message: ' . ($newEnquiry['message'] ?? ''),
                'createdAt' => $now,
                'updatedAt' => $now,
            ]);
        }
    }

    saveDatabaseDirect($db);

    echo json_encode([
        'success' => true,
        'enquiry' => $newEnquiry
    ], JSON_UNESCAPED_UNICODE);
    exit;
}
