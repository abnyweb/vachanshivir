<?php
function getDbPath() {
    $dir = __DIR__ . '/data';
    if (!is_dir($dir)) {
        @mkdir($dir, 0755, true);
    }
    return $dir . '/db.json';
}

function saveDatabaseDirect($db) {
    $path = getDbPath();
    file_put_contents($path, json_encode($db, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE), LOCK_EX);
}

function getEventsPath() {
    $dir = __DIR__ . '/data';
    if (!is_dir($dir)) {
        @mkdir($dir, 0755, true);
    }
    return $dir . '/events.json';
}

function dispatchRealtimeEvent($eventName, $payload) {
    $path = getEventsPath();
    $events = [];
    if (file_exists($path)) {
        $content = @file_get_contents($path);
        if ($content) {
            $decoded = json_decode($content, true);
            if (is_array($decoded)) {
                $events = $decoded;
            }
        }
    }

    $eventId = 'evt_' . time() . '_' . substr(md5(uniqid()), 0, 6);
    $newEvent = [
        'id' => $eventId,
        'event' => $eventName,
        'timestamp' => microtime(true),
        'createdAt' => date('c'),
        'data' => $payload
    ];

    $events[] = $newEvent;

    // Keep the last 150 events
    if (count($events) > 150) {
        $events = array_slice($events, -150);
    }

    @file_put_contents($path, json_encode($events, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE), LOCK_EX);
    return $newEvent;
}

function getRealtimeEventsAfter($lastEventId = null, $sinceTimestamp = 0) {
    $path = getEventsPath();
    if (!file_exists($path)) {
        return [];
    }
    $content = @file_get_contents($path);
    if (!$content) {
        return [];
    }
    $events = json_decode($content, true);
    if (!is_array($events)) {
        return [];
    }

    if (!$lastEventId && $sinceTimestamp <= 0) {
        return $events;
    }

    $foundIndex = -1;
    if ($lastEventId) {
        foreach ($events as $idx => $ev) {
            if ($ev['id'] === $lastEventId) {
                $foundIndex = $idx;
                break;
            }
        }
    }

    if ($foundIndex !== -1) {
        return array_slice($events, $foundIndex + 1);
    }

    if ($sinceTimestamp > 0) {
        return array_values(array_filter($events, function($ev) use ($sinceTimestamp) {
            return ($ev['timestamp'] ?? 0) > $sinceTimestamp;
        }));
    }

    return $events;
}

/**
 * Self-healing recovery: reads submissions.log and restores any missing registrations,
 * attendees, CRM contacts, users, and event participations.
 */
function recoverSubmissionsFromLog(&$db) {
    $possiblePaths = [
        __DIR__ . '/data/submissions.log',
        __DIR__ . '/submissions.log',
        dirname(__DIR__) . '/submissions.log',
        dirname(__DIR__) . '/api/submissions.log',
    ];
    $lines = [];
    foreach ($possiblePaths as $p) {
        if (file_exists($p)) {
            $fLines = @file($p, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
            if ($fLines && is_array($fLines)) {
                $lines = array_merge($lines, $fLines);
            }
        }
    }
    if (empty($lines)) {
        return false;
    }

    if (!isset($db['registrations']) || !is_array($db['registrations'])) $db['registrations'] = [];
    if (!isset($db['attendees']) || !is_array($db['attendees'])) $db['attendees'] = [];
    if (!isset($db['users']) || !is_array($db['users'])) $db['users'] = [];
    if (!isset($db['crmContacts']) || !is_array($db['crmContacts'])) $db['crmContacts'] = [];
    if (!isset($db['eventParticipations']) || !is_array($db['eventParticipations'])) $db['eventParticipations'] = [];

    $existingRegIds = [];
    $existingEmails = [];
    $usedRefNumbers = [];

    foreach ($db['registrations'] as $r) {
        if (!empty($r['id'])) $existingRegIds[$r['id']] = true;
        if (!empty($r['email'])) $existingEmails[strtolower(trim($r['email']))] = true;
        if (!empty($r['reference'])) {
            $parts = explode('-', $r['reference']);
            if (isset($parts[1]) && is_numeric($parts[1])) {
                $usedRefNumbers[intval($parts[1])] = true;
            }
        }
    }

    $existingAttRegIds = [];
    foreach ($db['attendees'] as $a) {
        $regId = !empty($a['registrationId']) ? $a['registrationId'] : (!empty($a['id']) ? $a['id'] : '');
        if ($regId) $existingAttRegIds[$regId] = true;
    }

    $existingUserEmails = [];
    foreach ($db['users'] as $u) {
        if (!empty($u['email'])) $existingUserEmails[strtolower(trim($u['email']))] = true;
    }

    $existingContactEmails = [];
    foreach ($db['crmContacts'] as $c) {
        if (!empty($c['email'])) $existingContactEmails[strtolower(trim($c['email']))] = true;
    }

    $updated = false;
    $refCounter = 1;

    foreach ($lines as $line) {
        $entry = json_decode($line, true);
        if (!$entry || !isset($entry['reg']) || !is_array($entry['reg'])) {
            continue;
        }

        $reg = $entry['reg'];
        $regId = !empty($reg['id']) ? $reg['id'] : '';
        $email = !empty($reg['email']) ? strtolower(trim($reg['email'])) : '';

        if (!$regId && !$email) continue;

        // Ensure unique reference
        while (isset($usedRefNumbers[$refCounter])) {
            $refCounter++;
        }
        $assignedRef = !empty($reg['reference']) ? $reg['reference'] : ('VS2026-' . str_pad($refCounter, 4, '0', STR_PAD_LEFT));
        $usedRefNumbers[$refCounter] = true;

        // 1. Restore registration if missing
        if (!isset($existingRegIds[$regId])) {
            $reg['reference'] = $assignedRef;
            $db['registrations'][] = $reg;
            $existingRegIds[$regId] = true;
            $updated = true;
        }

        // 2. Restore attendee if missing
        if (!isset($existingAttRegIds[$regId])) {
            $fullName = !empty($reg['fullName']) ? $reg['fullName'] : trim(($reg['firstName'] ?? '') . ' ' . ($reg['lastName'] ?? ''));
            $att = [
                'id' => 'att_' . $regId,
                'registrationId' => $regId,
                'reference' => $assignedRef,
                'legacyEntryId' => '',
                'entryId' => '',
                'eventId' => $reg['eventId'] ?? 'evt-vachanshivir-2026',
                'name' => $fullName,
                'fullName' => $fullName,
                'email' => $reg['email'] ?? '',
                'phone' => $reg['phone'] ?? '',
                'age' => $reg['age'] ?? null,
                'organisation' => $reg['organisation'] ?? ($reg['churchName'] ?? ''),
                'designation' => $reg['designation'] ?? ($reg['churchRole'] ?? 'Delegate'),
                'churchName' => $reg['churchName'] ?? ($reg['organisation'] ?? ''),
                'role' => $reg['churchRole'] ?? 'Delegate',
                'city' => $reg['city'] ?? '',
                'state' => $reg['state'] ?? '',
                'country' => $reg['country'] ?? 'India',
                'postalCode' => $reg['postalCode'] ?? '',
                'streetAddress' => $reg['streetAddress'] ?? '',
                'paymentStatus' => $reg['paymentStatus'] ?? 'unpaid',
                'checkInStatus' => 'not-arrived',
                'checkedInAt' => null,
                'badgeStatus' => 'not-generated',
                'roomingStatus' => 'unassigned',
                'roomId' => null,
                'isDemo' => false
            ];
            $db['attendees'][] = $att;
            $existingAttRegIds[$regId] = true;
            $updated = true;
        }

        // 3. Restore user in Users Directory if missing
        if ($email && !isset($existingUserEmails[$email])) {
            $fullName = !empty($reg['fullName']) ? $reg['fullName'] : trim(($reg['firstName'] ?? '') . ' ' . ($reg['lastName'] ?? ''));
            $db['users'][] = [
                'id' => 'usr_' . time() . '_' . substr(md5($email), 0, 4),
                'name' => $fullName,
                'email' => $email,
                'phone' => $reg['phone'] ?? '',
                'role' => 'PARTICIPANT',
                'status' => 'ACTIVE',
                'authProvider' => 'email',
                'registeredAt' => $reg['registeredAt'] ?? ($reg['createdAt'] ?? date('c')),
                'lastLogin' => $reg['registeredAt'] ?? ($reg['createdAt'] ?? date('c')),
            ];
            $existingUserEmails[$email] = true;
            $updated = true;
        }

        // 4. Restore CRM Contact in Pastoral CRM if missing
        if ($email && !isset($existingContactEmails[$email])) {
            $fullName = !empty($reg['fullName']) ? $reg['fullName'] : trim(($reg['firstName'] ?? '') . ' ' . ($reg['lastName'] ?? ''));
            $contactId = 'crm_cnt_' . time() . '_' . substr(md5($email), 0, 5);
            $payStatus = !empty($reg['paymentStatus']) ? $reg['paymentStatus'] : 'unpaid';
            $db['crmContacts'][] = [
                'id' => $contactId,
                'firstName' => $reg['firstName'] ?? $fullName,
                'lastName' => $reg['lastName'] ?? '',
                'fullName' => $fullName,
                'email' => $email,
                'phone' => $reg['phone'] ?? '',
                'whatsapp' => $reg['phone'] ?? '',
                'age' => $reg['age'] ?? null,
                'country' => $reg['country'] ?? 'India',
                'state' => $reg['state'] ?? '',
                'city' => $reg['city'] ?? '',
                'houseNumber' => $reg['houseNumber'] ?? '',
                'streetAddress' => $reg['streetAddress'] ?? '',
                'landmark' => $reg['landmark'] ?? '',
                'postalCode' => $reg['postalCode'] ?? '',
                'churchName' => $reg['churchName'] ?? ($reg['organisation'] ?? ''),
                'churchDenomination' => 'Non-Denominational',
                'role' => $reg['churchRole'] ?? ($reg['designation'] ?? 'Delegate'),
                'organisation' => $reg['organisation'] ?? ($reg['churchName'] ?? ''),
                'designation' => $reg['designation'] ?? 'Delegate',
                'contactType' => 'delegate',
                'lifecycle' => 'attendee',
                'leadSource' => 'Online Registration',
                'tags' => ['VS-2026', 'DELEGATE', strtoupper($payStatus)],
                'consent' => true,
                'notes' => !empty($reg['testimony']) ? 'Testimony: ' . $reg['testimony'] : '',
                'createdAt' => $reg['createdAt'] ?? date('c'),
                'updatedAt' => $reg['createdAt'] ?? date('c'),
                'legacyEntryId' => '',
                'entryId' => ''
            ];
            $existingContactEmails[$email] = true;
            $updated = true;

            // 5. Restore Event Participation
            $db['eventParticipations'][] = [
                'id' => 'part_' . time() . '_' . substr(md5($regId), 0, 5),
                'contactId' => $contactId,
                'eventId' => $reg['eventId'] ?? 'evt-vachanshivir-2026',
                'eventYear' => 2026,
                'eventName' => 'वचन अध्ययन शिविर 2026 (Vachan Adhyayan Shivir 2026)',
                'registrationId' => $regId,
                'reference' => $assignedRef,
                'role' => $reg['designation'] ?? 'Delegate',
                'categoryName' => $reg['categoryId'] ?? 'cat-std-full',
                'amountPaid' => $reg['total'] ?? 3000,
                'paymentStatus' => $payStatus,
                'attended' => false,
                'checkedInAt' => null,
                'createdAt' => $reg['createdAt'] ?? date('c'),
            ];
        }
    }

    return $updated;
}

/**
 * Auto-recovers any PARTICIPANT users into registrations, attendees, and CRM contacts
 * if they are missing. This guarantees that every registered user is 100% represented
 * across Registrations and Pastoral CRM even if a client-side sync clobbered db.json in the past.
 */
function recoverParticipantsFromUsers(&$db) {
    if (!isset($db['users']) || !is_array($db['users'])) return false;
    if (!isset($db['registrations']) || !is_array($db['registrations'])) $db['registrations'] = [];
    if (!isset($db['attendees']) || !is_array($db['attendees'])) $db['attendees'] = [];
    if (!isset($db['crmContacts']) || !is_array($db['crmContacts'])) $db['crmContacts'] = [];
    if (!isset($db['eventParticipations']) || !is_array($db['eventParticipations'])) $db['eventParticipations'] = [];

    $existingRegEmails = [];
    $usedRefNumbers = [];
    $maxLegacyId = 1664;

    foreach ($db['registrations'] as $r) {
        if (!empty($r['email'])) $existingRegEmails[strtolower(trim($r['email']))] = true;
        if (!empty($r['legacyEntryId']) && is_numeric($r['legacyEntryId'])) {
            $maxLegacyId = max($maxLegacyId, intval($r['legacyEntryId']));
        }
        if (!empty($r['reference'])) {
            $parts = explode('-', $r['reference']);
            if (isset($parts[1]) && is_numeric($parts[1])) {
                $usedRefNumbers[intval($parts[1])] = true;
            }
        }
    }

    $existingAttEmails = [];
    foreach ($db['attendees'] as $a) {
        if (!empty($a['email'])) $existingAttEmails[strtolower(trim($a['email']))] = true;
        if (!empty($a['legacyEntryId']) && is_numeric($a['legacyEntryId'])) {
            $maxLegacyId = max($maxLegacyId, intval($a['legacyEntryId']));
        }
    }

    $existingCrmEmails = [];
    foreach ($db['crmContacts'] as $c) {
        if (!empty($c['email'])) $existingCrmEmails[strtolower(trim($c['email']))] = true;
    }

    $updated = false;
    $refCounter = 1;

    foreach ($db['users'] as $u) {
        $role = strtoupper($u['role'] ?? '');
        if ($role !== 'PARTICIPANT') continue;

        $email = strtolower(trim($u['email'] ?? ''));
        if (!$email) continue;

        $name = trim($u['name'] ?? 'Delegate');
        $phone = trim($u['phone'] ?? '');
        $registeredAt = $u['registeredAt'] ?? date('c');

        $nameParts = explode(' ', $name, 2);
        $firstName = $nameParts[0];
        $lastName = isset($nameParts[1]) ? $nameParts[1] : '';

        while (isset($usedRefNumbers[$refCounter])) {
            $refCounter++;
        }
        $reference = 'VS2026-' . str_pad($refCounter, 4, '0', STR_PAD_LEFT);
        $usedRefNumbers[$refCounter] = true;
        $maxLegacyId++;
        $legacyEntryId = $maxLegacyId;

        $regId = 'reg_' . ($u['id'] ?? ('u_' . md5($email)));
        $contactId = 'crm_' . ($u['id'] ?? ('u_' . md5($email)));

        // 1. Recover Registration
        if (!isset($existingRegEmails[$email])) {
            $reg = [
                'id' => $regId,
                'reference' => $reference,
                'legacyEntryId' => $legacyEntryId,
                'entryId' => $legacyEntryId,
                'eventId' => 'evt-vachanshivir-2026',
                'fullName' => $name,
                'firstName' => $firstName,
                'lastName' => $lastName,
                'email' => $email,
                'phone' => $phone,
                'city' => '',
                'state' => '',
                'country' => 'India',
                'churchName' => '',
                'organisation' => '',
                'designation' => 'Pastor / Delegate',
                'categoryId' => 'cat-eb-quad',
                'amount' => 3000,
                'tax' => 0,
                'total' => 3000,
                'currency' => 'INR',
                'paymentStatus' => 'unpaid',
                'status' => 'submitted',
                'notes' => 'Registered participant from portal. Payment pending / CRM lead.',
                'createdAt' => $registeredAt,
                'registeredAt' => $registeredAt,
                'isDemo' => false,
            ];
            $db['registrations'][] = $reg;
            $existingRegEmails[$email] = true;
            $updated = true;
        }

        // 2. Recover Attendee
        if (!isset($existingAttEmails[$email])) {
            $att = [
                'id' => 'att_' . $regId,
                'registrationId' => $regId,
                'reference' => $reference,
                'legacyEntryId' => $legacyEntryId,
                'entryId' => $legacyEntryId,
                'eventId' => 'evt-vachanshivir-2026',
                'year' => '2026',
                'edition' => '2026',
                'name' => $name,
                'fullName' => $name,
                'email' => $email,
                'phone' => $phone,
                'city' => '',
                'state' => '',
                'country' => 'India',
                'churchName' => '',
                'organisation' => '',
                'designation' => 'Pastor / Delegate',
                'role' => 'Delegate',
                'categoryId' => 'cat-eb-quad',
                'paymentStatus' => 'unpaid',
                'checkInStatus' => 'not-arrived',
                'checkedInAt' => null,
                'badgeStatus' => 'not-generated',
                'roomingStatus' => 'unassigned',
                'roomId' => null,
                'attendanceIntention' => 'NOT_VERIFIED',
                'whatsappStatus' => 'NOT_ADDED',
                'isDemo' => false,
                'createdAt' => $registeredAt,
            ];
            $db['attendees'][] = $att;
            $existingAttEmails[$email] = true;
            $updated = true;
        }

        // 3. Recover CRM Contact
        if (!isset($existingCrmEmails[$email])) {
            $crm = [
                'id' => $contactId,
                'legacyEntryId' => $legacyEntryId,
                'entryId' => $legacyEntryId,
                'contactType' => 'delegate',
                'lifecycle' => 'lead',
                'firstName' => $firstName,
                'lastName' => $lastName,
                'fullName' => $name,
                'email' => $email,
                'phone' => $phone,
                'country' => 'India',
                'city' => '',
                'state' => '',
                'churchName' => '',
                'churchDenomination' => '',
                'organisation' => '',
                'role' => 'Delegate',
                'designation' => 'Pastor / Delegate',
                'leadSource' => 'Portal Registration',
                'tags' => ['VS-2026', 'REGISTERED_UNPAID', 'PAYMENT_PENDING'],
                'consent' => true,
                'notes' => 'Registered participant account on portal. Payment pending / followup required.',
                'createdAt' => $registeredAt,
                'updatedAt' => date('c'),
            ];
            $db['crmContacts'][] = $crm;
            $existingCrmEmails[$email] = true;
            $updated = true;
        }

        // 4. Recover Event Participation
        $db['eventParticipations'][] = [
            'id' => 'part_' . $regId,
            'contactId' => $contactId,
            'eventId' => 'evt-vachanshivir-2026',
            'eventYear' => 2026,
            'eventName' => 'वचन अध्ययन शिविर 2026 (Vachan Adhyayan Shivir 2026)',
            'registrationId' => $regId,
            'reference' => $reference,
            'role' => 'Delegate',
            'categoryName' => 'Early Bird — Quadruple Sharing',
            'amountPaid' => 3000,
            'paymentStatus' => 'unpaid',
            'attended' => false,
            'checkedInAt' => null,
            'createdAt' => $registeredAt,
        ];
    }

    return $updated;
}

function getDatabase() {
    $path = getDbPath();
    $seedPath = __DIR__ . '/data/seed.json';
    $db = [
        'users' => [],
        'registrations' => [],
        'attendees' => [],
        'crmContacts' => [],
        'eventParticipations' => [],
        'communications' => [],
        'events' => [],
        'speakers' => [],
        'sessions' => [],
        'registrationCategories' => [],
        'rooms' => [],
        'sponsors' => [],
        'partners' => [],
        'exhibitors' => [],
        'stalls' => [],
        'galleryAlbums' => [],
        'galleryImages' => [],
        'enquiries' => [],
        'documents' => [],
        'announcements' => [],
        'faqs' => [],
        'settings' => [],
        'integrations' => [],
        'syncJobs' => [],
        'auditLogs' => []
    ];

    $hasValidData = false;
    if (file_exists($path)) {
        $content = file_get_contents($path);
        $decoded = json_decode($content, true);
        if (is_array($decoded) && (!empty($decoded['users']) || !empty($decoded['crmContacts']) || !empty($decoded['events']))) {
            $db = array_merge($db, $decoded);
            $hasValidData = true;
        }
    }

    if (!$hasValidData && file_exists($seedPath)) {
        $content = file_get_contents($seedPath);
        $decoded = json_decode($content, true);
        if (is_array($decoded)) {
            $db = array_merge($db, $decoded);
            $hasValidData = true;
            saveDatabaseDirect($db);
        }
    }

    // Auto-recover any submissions from log or participant users that might be missing
    $recovered = recoverSubmissionsFromLog($db);
    $recoveredUsers = recoverParticipantsFromUsers($db);
    if ($recovered || $recoveredUsers) {
        saveDatabaseDirect($db);
    }

    return $db;
}

/**
 * Intelligent database sync: merges incoming data without erasing existing registrations,
 * attendees, users, or CRM records.
 */
function syncMergeDatabase($incoming) {
    if (!is_array($incoming)) {
        return getDatabase();
    }

    $current = getDatabase();

    // Critical collections that must be safely merged and never wiped
    $protectedCollections = [
        'registrations' => 'id',
        'attendees' => 'id',
        'crmContacts' => 'email',
        'users' => 'email',
        'eventParticipations' => 'id',
        'communications' => 'id',
        'syncJobs' => 'id',
        'auditLogs' => 'id',
    ];

    foreach ($protectedCollections as $col => $keyField) {
        $existingItems = isset($current[$col]) && is_array($current[$col]) ? $current[$col] : [];
        $incomingItems = isset($incoming[$col]) && is_array($incoming[$col]) ? $incoming[$col] : [];

        // Build index of existing items by primary key and secondary fields
        $map = [];
        foreach ($existingItems as $item) {
            $key = '';
            if ($keyField === 'email' && !empty($item['email'])) {
                $key = strtolower(trim($item['email']));
            } elseif (!empty($item['id'])) {
                $key = $item['id'];
            }
            if ($key) {
                $map[$key] = $item;
            }
        }

        // Merge incoming items
        foreach ($incomingItems as $inItem) {
            $key = '';
            if ($keyField === 'email' && !empty($inItem['email'])) {
                $key = strtolower(trim($inItem['email']));
            } elseif (!empty($inItem['id'])) {
                $key = $inItem['id'];
            }

            if ($key && isset($map[$key])) {
                // Preserve 'paid' status if existing record was already paid
                if (isset($map[$key]['paymentStatus']) && $map[$key]['paymentStatus'] === 'paid') {
                    $inItem['paymentStatus'] = 'paid';
                }
                $map[$key] = array_merge($map[$key], $inItem);
            } elseif ($key) {
                $map[$key] = $inItem;
            } else {
                $map[] = $inItem;
            }
        }

        $current[$col] = array_values($map);
    }

    // Merge other collections & settings directly from incoming
    foreach ($incoming as $k => $v) {
        if (!array_key_exists($k, $protectedCollections)) {
            $current[$k] = $v;
        }
    }

    // Save and re-run recovery just in case
    recoverSubmissionsFromLog($current);
    recoverParticipantsFromUsers($current);
    saveDatabaseDirect($current);
    return $current;
}

function saveDatabase($db) {
    return syncMergeDatabase($db);
}

function saveNewRegistration($draft) {
    $db = getDatabase();
    $now = date('c');
    $regId = !empty($draft['id']) ? $draft['id'] : ('reg_' . time() . '_' . substr(md5(uniqid()), 0, 5));

    $parts = explode(' ', trim(isset($draft['fullName']) ? $draft['fullName'] : ''));
    $firstName = !empty($draft['firstName']) ? trim($draft['firstName']) : (!empty($parts[0]) ? $parts[0] : 'Delegate');
    $lastName = !empty($draft['lastName']) ? trim($draft['lastName']) : trim(implode(' ', array_slice($parts, 1)));
    $fullName = !empty($draft['fullName']) ? trim($draft['fullName']) : trim($firstName . ' ' . $lastName);

    // Calculate sequential Entry ID
    $maxEntryId = 0;
    foreach (['registrations', 'attendees', 'crmContacts'] as $col) {
        if (isset($db[$col]) && is_array($db[$col])) {
            foreach ($db[$col] as $item) {
                $eid = isset($item['entryId']) ? intval($item['entryId']) : (isset($item['legacyEntryId']) ? intval($item['legacyEntryId']) : 0);
                if ($eid > $maxEntryId) $maxEntryId = $eid;
            }
        }
    }
    $nextEntryId = max($maxEntryId, 0) + 1;
    $entryId = !empty($draft['entryId']) ? intval($draft['entryId']) : (!empty($draft['legacyEntryId']) ? intval($draft['legacyEntryId']) : $nextEntryId);

    // Calculate sequential Reference Number
    $reference = !empty($draft['reference']) ? trim($draft['reference']) : '';
    if (!$reference) {
        $maxRefNum = 0;
        if (isset($db['registrations']) && is_array($db['registrations'])) {
            foreach ($db['registrations'] as $r) {
                if (!empty($r['reference'])) {
                    $refParts = explode('-', $r['reference']);
                    if (isset($refParts[1]) && is_numeric($refParts[1])) {
                        $maxRefNum = max($maxRefNum, intval($refParts[1]));
                    }
                }
            }
        }
        $refIndex = $maxRefNum + 1;
        $reference = 'VS2026-' . str_pad($refIndex, 4, '0', STR_PAD_LEFT);
    }

    $amount = isset($draft['amount']) ? floatval($draft['amount']) : (isset($draft['total']) ? floatval($draft['total']) : 3000);
    $tax = isset($draft['tax']) ? floatval($draft['tax']) : 0;
    $total = isset($draft['total']) ? floatval($draft['total']) : ($amount + $tax);
    $payStatus = !empty($draft['paymentStatus']) ? $draft['paymentStatus'] : 'unpaid';

    $reg = [
        'id' => $regId,
        'reference' => $reference,
        'entryId' => $entryId,
        'legacyEntryId' => $entryId,
        'eventId' => isset($draft['eventId']) ? $draft['eventId'] : 'evt-vachanshivir-2026',
        'firstName' => $firstName,
        'lastName' => $lastName,
        'fullName' => $fullName,
        'email' => isset($draft['email']) ? trim($draft['email']) : '',
        'phone' => isset($draft['phone']) ? trim($draft['phone']) : '',
        'age' => isset($draft['age']) ? intval($draft['age']) : null,
        'organisation' => isset($draft['churchName']) ? trim($draft['churchName']) : (isset($draft['organisation']) ? trim($draft['organisation']) : ''),
        'designation' => isset($draft['churchRole']) ? trim($draft['churchRole']) : (isset($draft['designation']) ? trim($draft['designation']) : 'Delegate'),
        'churchName' => isset($draft['churchName']) ? trim($draft['churchName']) : '',
        'churchRole' => isset($draft['churchRole']) ? trim($draft['churchRole']) : '',
        'city' => isset($draft['city']) ? trim($draft['city']) : '',
        'state' => isset($draft['state']) ? trim($draft['state']) : '',
        'country' => isset($draft['country']) ? trim($draft['country']) : 'India',
        'houseNumber' => isset($draft['houseNumber']) ? trim($draft['houseNumber']) : '',
        'streetAddress' => isset($draft['streetAddress']) ? trim($draft['streetAddress']) : '',
        'landmark' => isset($draft['landmark']) ? trim($draft['landmark']) : '',
        'postalCode' => isset($draft['postalCode']) ? trim($draft['postalCode']) : '',
        'isUnmarried' => isset($draft['isUnmarried']) ? $draft['isUnmarried'] : '',
        'testimony' => isset($draft['testimony']) ? trim($draft['testimony']) : '',
        'hasDietaryRestrictions' => isset($draft['hasDietaryRestrictions']) ? $draft['hasDietaryRestrictions'] : 'नहीं',
        'dietaryDetails' => isset($draft['dietaryDetails']) ? trim($draft['dietaryDetails']) : '',
        'educationQualification' => isset($draft['educationQualification']) ? $draft['educationQualification'] : '',
        'otherEducation' => isset($draft['otherEducation']) ? trim($draft['otherEducation']) : '',
        'otherChurchRole' => isset($draft['otherChurchRole']) ? trim($draft['otherChurchRole']) : '',
        'preachFrequency' => isset($draft['preachFrequency']) ? trim($draft['preachFrequency']) : '',
        'trainingExpectations' => isset($draft['trainingExpectations']) ? trim($draft['trainingExpectations']) : '',
        'specialNeeds' => isset($draft['specialNeeds']) ? trim($draft['specialNeeds']) : '',
        'otherInfo' => isset($draft['otherInfo']) ? trim($draft['otherInfo']) : '',
        'categoryId' => isset($draft['categoryId']) ? $draft['categoryId'] : 'cat-std-full',
        'amount' => $amount,
        'tax' => $tax,
        'total' => $total,
        'currency' => isset($draft['currency']) ? $draft['currency'] : 'INR',
        'paymentStatus' => $payStatus,
        'status' => 'submitted',
        'notes' => isset($draft['notes']) ? trim($draft['notes']) : '',
        'createdAt' => $now,
        'registeredAt' => $now,
        'isDemo' => false
    ];

    $att = [
        'id' => 'att_' . $regId,
        'registrationId' => $regId,
        'reference' => $reference,
        'entryId' => $entryId,
        'legacyEntryId' => $entryId,
        'eventId' => $reg['eventId'],
        'name' => $fullName,
        'fullName' => $fullName,
        'email' => $reg['email'],
        'phone' => $reg['phone'],
        'age' => $reg['age'],
        'organisation' => $reg['organisation'],
        'designation' => $reg['designation'],
        'churchName' => $reg['churchName'],
        'role' => $reg['churchRole'] ?: 'Delegate',
        'city' => $reg['city'],
        'state' => $reg['state'],
        'country' => $reg['country'],
        'postalCode' => $reg['postalCode'],
        'streetAddress' => $reg['streetAddress'],
        'paymentStatus' => $payStatus,
        'checkInStatus' => 'not-arrived',
        'checkedInAt' => null,
        'badgeStatus' => 'not-generated',
        'roomingStatus' => 'unassigned',
        'roomId' => null,
        'isDemo' => false,
        'createdAt' => $now
    ];

    $email = strtolower($reg['email']);

    // 1. Sync User Directory Account
    if ($email) {
        $existingUserIndex = -1;
        if (isset($db['users'])) {
            foreach ($db['users'] as $idx => $u) {
                if (strtolower($u['email'] ?? '') === $email) {
                    $existingUserIndex = $idx;
                    break;
                }
            }
        }
        if ($existingUserIndex === -1) {
            array_unshift($db['users'], [
                'id' => 'usr_' . time() . '_' . substr(md5($email), 0, 4),
                'name' => $fullName,
                'email' => $email,
                'phone' => $reg['phone'],
                'role' => 'PARTICIPANT',
                'status' => 'ACTIVE',
                'authProvider' => 'email',
                'registeredAt' => $now,
                'lastLogin' => $now
            ]);
        }
    }

    // 2. Sync Pastoral CRM Contact
    $contactId = 'crm_cnt_' . time() . '_' . substr(md5($email ?: uniqid()), 0, 5);
    $existingContactIndex = -1;
    if (isset($db['crmContacts']) && $email) {
        foreach ($db['crmContacts'] as $cIdx => $c) {
            if (strtolower($c['email'] ?? '') === $email) {
                $existingContactIndex = $cIdx;
                $contactId = $c['id'];
                break;
            }
        }
    }

    $crmContact = [
        'id' => $contactId,
        'entryId' => $entryId,
        'legacyEntryId' => $entryId,
        'firstName' => $firstName,
        'lastName' => $lastName,
        'fullName' => $fullName,
        'email' => $reg['email'],
        'phone' => $reg['phone'],
        'whatsapp' => $reg['phone'],
        'age' => $reg['age'],
        'country' => $reg['country'],
        'state' => $reg['state'],
        'city' => $reg['city'],
        'houseNumber' => $reg['houseNumber'],
        'streetAddress' => $reg['streetAddress'],
        'landmark' => $reg['landmark'],
        'postalCode' => $reg['postalCode'],
        'churchName' => $reg['churchName'] ?: $reg['organisation'],
        'churchDenomination' => 'Non-Denominational',
        'role' => $reg['churchRole'] ?: ($reg['designation'] ?: 'Delegate'),
        'organisation' => $reg['organisation'],
        'designation' => $reg['designation'] ?: 'Delegate',
        'contactType' => 'delegate',
        'lifecycle' => 'attendee',
        'leadSource' => 'Online Registration',
        'tags' => ['VS-2026', 'DELEGATE', strtoupper($payStatus)],
        'consent' => true,
        'notes' => !empty($reg['testimony']) ? 'Testimony: ' . $reg['testimony'] : '',
        'createdAt' => $now,
        'updatedAt' => $now
    ];

    if ($existingContactIndex >= 0) {
        $db['crmContacts'][$existingContactIndex] = array_merge($db['crmContacts'][$existingContactIndex], $crmContact);
    } else {
        if (!isset($db['crmContacts'])) $db['crmContacts'] = [];
        array_unshift($db['crmContacts'], $crmContact);
    }

    // 3. Event Participation
    if (!isset($db['eventParticipations'])) $db['eventParticipations'] = [];
    array_unshift($db['eventParticipations'], [
        'id' => 'part_' . time() . '_' . substr(md5($regId), 0, 5),
        'contactId' => $contactId,
        'entryId' => $entryId,
        'legacyEntryId' => $entryId,
        'eventId' => $reg['eventId'],
        'eventYear' => 2026,
        'eventName' => 'वचन अध्ययन शिविर 2026 (Vachan Adhyayan Shivir 2026)',
        'registrationId' => $regId,
        'reference' => $reference,
        'role' => $reg['designation'],
        'categoryName' => $reg['categoryId'],
        'amountPaid' => $reg['total'],
        'paymentStatus' => $payStatus,
        'attended' => false,
        'checkedInAt' => null,
        'createdAt' => $now,
    ]);

    if (!isset($db['registrations'])) $db['registrations'] = [];
    if (!isset($db['attendees'])) $db['attendees'] = [];

    // Prepend new registration so newest is at the top
    array_unshift($db['registrations'], $reg);
    array_unshift($db['attendees'], $att);

    saveDatabaseDirect($db);

    // Also append to audit log file for permanent disaster-proof persistence
    $logEntry = json_encode(['time' => $now, 'reg' => $reg], JSON_UNESCAPED_UNICODE) . PHP_EOL;
    @file_put_contents(__DIR__ . '/data/submissions.log', $logEntry, FILE_APPEND | LOCK_EX);

    // Dispatch realtime SSE event
    dispatchRealtimeEvent('registration.created', [
        'registration' => $reg,
        'attendee' => $att,
        'counts' => [
            'total' => count($db['registrations']),
            'unpaid' => count(array_filter($db['registrations'], fn($r) => ($r['paymentStatus'] ?? '') !== 'paid')),
            'paid' => count(array_filter($db['registrations'], fn($r) => ($r['paymentStatus'] ?? '') === 'paid')),
        ]
    ]);

    return $reg;
}

function updateRegistrationPayment($regIdOrRef, $paymentId, $orderId = '') {
    $db = getDatabase();
    $updated = false;
    $paidReg = null;

    if (isset($db['registrations'])) {
        foreach ($db['registrations'] as &$r) {
            if ($r['id'] === $regIdOrRef || (isset($r['reference']) && $r['reference'] === $regIdOrRef)) {
                $r['paymentStatus'] = 'paid';
                $r['transactionId'] = $paymentId;
                $r['razorpayOrderId'] = $orderId;
                $r['paidAt'] = date('c');
                $updated = true;
                $paidReg = $r;
            }
        }
    }

    if (isset($db['attendees'])) {
        foreach ($db['attendees'] as &$a) {
            if ($a['registrationId'] === $regIdOrRef || (isset($a['reference']) && $a['reference'] === $regIdOrRef)) {
                $a['paymentStatus'] = 'paid';
                $updated = true;
            }
        }
    }

    if (isset($db['eventParticipations'])) {
        foreach ($db['eventParticipations'] as &$p) {
            if ($p['registrationId'] === $regIdOrRef || (isset($p['reference']) && $p['reference'] === $regIdOrRef)) {
                $p['paymentStatus'] = 'paid';
                $updated = true;
            }
        }
    }

    if ($paidReg && isset($db['crmContacts'])) {
        $email = strtolower($paidReg['email'] ?? '');
        foreach ($db['crmContacts'] as &$c) {
            if (strtolower($c['email'] ?? '') === $email) {
                if (!isset($c['tags']) || !is_array($c['tags'])) $c['tags'] = [];
                $c['tags'] = array_values(array_unique(array_filter($c['tags'], fn($t) => $t !== 'UNPAID' && $t !== 'PAYMENT_FAILED')));
                if (!in_array('PAID', $c['tags'])) $c['tags'][] = 'PAID';
                $c['updatedAt'] = date('c');
                $updated = true;
            }
        }
    }

    if ($updated) {
        saveDatabaseDirect($db);

        // Dispatch realtime SSE event
        dispatchRealtimeEvent('registration.updated', [
            'id' => $regIdOrRef,
            'paymentStatus' => 'paid',
            'transactionId' => $paymentId,
            'orderId' => $orderId,
            'registration' => $paidReg,
            'counts' => [
                'total' => count($db['registrations'] ?? []),
                'unpaid' => count(array_filter($db['registrations'] ?? [], fn($r) => ($r['paymentStatus'] ?? '') !== 'paid')),
                'paid' => count(array_filter($db['registrations'] ?? [], fn($r) => ($r['paymentStatus'] ?? '') === 'paid')),
            ]
        ]);

        // Dispatch confirmed ticket and delegate pass email
        if ($paidReg && !empty($paidReg['email'])) {
            require_once __DIR__ . '/mailer.php';
            @sendSuccessTicketEmail($paidReg, $paymentId);
        }
    }
}

function updateRegistrationPaymentFailed($regIdOrRef, $errorDesc = '') {
    $db = getDatabase();
    $updated = false;
    $targetEmail = '';

    if (isset($db['registrations'])) {
        foreach ($db['registrations'] as &$r) {
            if ($r['id'] === $regIdOrRef || (isset($r['reference']) && $r['reference'] === $regIdOrRef)) {
                $noteMsg = "Payment attempt failed: " . ($errorDesc ?: 'Cancelled/Failed') . " on " . date('d M Y H:i');
                $r['notes'] = !empty($r['notes']) ? ($r['notes'] . " | " . $noteMsg) : $noteMsg;
                $targetEmail = strtolower($r['email'] ?? '');
                $updated = true;
            }
        }
    }

    if ($targetEmail && isset($db['crmContacts'])) {
        foreach ($db['crmContacts'] as &$c) {
            if (strtolower($c['email'] ?? '') === $targetEmail) {
                if (!isset($c['tags']) || !is_array($c['tags'])) $c['tags'] = [];
                if (!in_array('PAYMENT_FAILED', $c['tags'])) $c['tags'][] = 'PAYMENT_FAILED';
                $c['updatedAt'] = date('c');
                $updated = true;
            }
        }
    }

    if ($updated) {
        saveDatabaseDirect($db);

        // Dispatch realtime SSE event
        dispatchRealtimeEvent('registration.updated', [
            'id' => $regIdOrRef,
            'paymentStatus' => 'unpaid',
            'failed' => true,
            'notes' => $noteMsg ?? '',
        ]);
    }
}

function deleteRegistrationById($idOrRef) {
    $db = getDatabase();
    $updated = false;
    $targetEmail = '';

    if (isset($db['registrations'])) {
        $origCount = count($db['registrations']);
        $db['registrations'] = array_values(array_filter($db['registrations'], function($r) use ($idOrRef, &$targetEmail) {
            if ($r['id'] === $idOrRef || ($r['reference'] ?? '') === $idOrRef) {
                if (!empty($r['email'])) $targetEmail = strtolower(trim($r['email']));
                return false;
            }
            return true;
        }));
        if (count($db['registrations']) !== $origCount) $updated = true;
    }

    if (isset($db['attendees'])) {
        $origCount = count($db['attendees']);
        $db['attendees'] = array_values(array_filter($db['attendees'], function($a) use ($idOrRef, &$targetEmail) {
            if ($a['id'] === $idOrRef || ($a['registrationId'] ?? '') === $idOrRef || ($a['reference'] ?? '') === $idOrRef) {
                if (!$targetEmail && !empty($a['email'])) $targetEmail = strtolower(trim($a['email']));
                return false;
            }
            return true;
        }));
        if (count($db['attendees']) !== $origCount) $updated = true;
    }

    if ($targetEmail) {
        if (isset($db['users'])) {
            $db['users'] = array_values(array_filter($db['users'], function($u) use ($targetEmail) {
                return (strtolower(trim($u['email'] ?? '')) !== $targetEmail || strtoupper($u['role'] ?? '') !== 'PARTICIPANT');
            }));
        }
        if (isset($db['crmContacts'])) {
            $db['crmContacts'] = array_values(array_filter($db['crmContacts'], function($c) use ($targetEmail) {
                return strtolower(trim($c['email'] ?? '')) !== $targetEmail;
            }));
        }
    }

    if (isset($db['eventParticipations'])) {
        $db['eventParticipations'] = array_values(array_filter($db['eventParticipations'], function($p) use ($idOrRef) {
            return (($p['registrationId'] ?? '') !== $idOrRef && ($p['reference'] ?? '') !== $idOrRef && ($p['id'] ?? '') !== $idOrRef);
        }));
    }

    if ($updated) {
        saveDatabaseDirect($db);

        // Also purge from submissions.log so disaster recovery does not resurrect it
        $logPath = __DIR__ . '/data/submissions.log';
        if (file_exists($logPath)) {
            $lines = @file($logPath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
            if ($lines && is_array($lines)) {
                $filtered = [];
                foreach ($lines as $line) {
                    $entry = json_decode($line, true);
                    if ($entry && isset($entry['reg'])) {
                        $r = $entry['reg'];
                        if (($r['id'] ?? '') === $idOrRef || ($r['reference'] ?? '') === $idOrRef) {
                            continue;
                        }
                        if ($targetEmail && strtolower(trim($r['email'] ?? '')) === $targetEmail) {
                            continue;
                        }
                    }
                    $filtered[] = $line;
                }
                @file_put_contents($logPath, implode(PHP_EOL, $filtered) . (count($filtered) ? PHP_EOL : ''), LOCK_EX);
            }
        }

        // Dispatch realtime SSE event
        dispatchRealtimeEvent('registration.deleted', [
            'id' => $idOrRef,
            'counts' => [
                'total' => count($db['registrations'] ?? []),
                'unpaid' => count(array_filter($db['registrations'] ?? [], fn($r) => ($r['paymentStatus'] ?? '') !== 'paid')),
                'paid' => count(array_filter($db['registrations'] ?? [], fn($r) => ($r['paymentStatus'] ?? '') === 'paid')),
            ]
        ]);
    }
    return $updated;
}
