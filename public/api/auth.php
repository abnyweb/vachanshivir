<?php
// auth.php — Enterprise Authentication & Participant Portal Service for Vachan Shivir 2026
// Handles: Participant Login, Password Reset, Google OAuth, and Isolated Registration Retrieval.

header('Content-Type: application/json; charset=UTF-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/db_helper.php';
require_once __DIR__ . '/mailer.php';

// -------------------------------------------------------------
// JWT / Token Security Helpers
// -------------------------------------------------------------
function getJwtSecret() {
    $secretFile = __DIR__ . '/data/.jwt_secret';
    if (file_exists($secretFile)) {
        $secret = trim(@file_get_contents($secretFile));
        if (!empty($secret)) return $secret;
    }
    // Generate persistent secure 256-bit random key
    $secret = bin2hex(random_bytes(32));
    @file_put_contents($secretFile, $secret, LOCK_EX);
    return $secret;
}

function base64UrlEncode($data) {
    return str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($data));
}

function base64UrlDecode($data) {
    $remainder = strlen($data) % 4;
    if ($remainder) {
        $padlen = 4 - $remainder;
        $data .= str_repeat('=', $padlen);
    }
    return base64_decode(str_replace(['-', '_'], ['+', '/'], $data));
}

function createAuthToken($payload) {
    $secret = getJwtSecret();
    $header = json_encode(['typ' => 'JWT', 'alg' => 'HS256']);
    
    // Ensure standard claims
    $payload['iat'] = time();
    if (!isset($payload['exp'])) {
        $payload['exp'] = time() + (7 * 24 * 3600); // 7-day token
    }
    
    $encodedHeader = base64UrlEncode($header);
    $encodedPayload = base64UrlEncode(json_encode($payload));
    
    $signature = hash_hmac('sha256', "{$encodedHeader}.{$encodedPayload}", $secret, true);
    $encodedSignature = base64UrlEncode($signature);
    
    return "{$encodedHeader}.{$encodedPayload}.{$encodedSignature}";
}

function verifyAuthToken($token) {
    if (!$token || !is_string($token)) return false;
    $parts = explode('.', $token);
    if (count($parts) !== 3) return false;
    
    list($encodedHeader, $encodedPayload, $encodedSignature) = $parts;
    $secret = getJwtSecret();
    
    $expectedSignature = hash_hmac('sha256', "{$encodedHeader}.{$encodedPayload}", $secret, true);
    if (!hash_equals($expectedSignature, base64UrlDecode($encodedSignature))) {
        return false;
    }
    
    $payload = json_decode(base64UrlDecode($encodedPayload), true);
    if (!$payload || !is_array($payload)) return false;
    
    // Check expiration
    if (isset($payload['exp']) && time() > $payload['exp']) {
        return false;
    }
    
    return $payload;
}

function getBearerToken() {
    $headers = [];
    if (function_exists('getallheaders')) {
        $headers = getallheaders();
    }
    
    $authHeader = '';
    if (isset($headers['Authorization'])) {
        $authHeader = $headers['Authorization'];
    } elseif (isset($headers['authorization'])) {
        $authHeader = $headers['authorization'];
    } elseif (isset($_SERVER['HTTP_AUTHORIZATION'])) {
        $authHeader = $_SERVER['HTTP_AUTHORIZATION'];
    } elseif (isset($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) {
        $authHeader = $_SERVER['REDIRECT_HTTP_AUTHORIZATION'];
    }
    
    if (preg_match('/Bearer\s(\S+)/i', $authHeader, $matches)) {
        return $matches[1];
    }
    return null;
}

// -------------------------------------------------------------
// Rate Limiting
// -------------------------------------------------------------
function checkRateLimit($actionKey, $maxAttempts = 10, $windowSeconds = 900) {
    $file = __DIR__ . '/data/rate_limits.json';
    $limits = [];
    if (file_exists($file)) {
        $content = @file_get_contents($file);
        if ($content) {
            $limits = json_decode($content, true) ?: [];
        }
    }
    
    $ip = $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1';
    $key = md5("{$ip}_{$actionKey}");
    $now = time();
    
    if (isset($limits[$key])) {
        $record = $limits[$key];
        if ($now - $record['firstAttempt'] < $windowSeconds) {
            if ($record['attempts'] >= $maxAttempts) {
                return false; // Rate limit exceeded
            }
        } else {
            // Window expired, reset
            $limits[$key] = ['attempts' => 0, 'firstAttempt' => $now];
        }
    }
    return true;
}

function recordRateLimitAttempt($actionKey) {
    $file = __DIR__ . '/data/rate_limits.json';
    $limits = [];
    if (file_exists($file)) {
        $content = @file_get_contents($file);
        if ($content) $limits = json_decode($content, true) ?: [];
    }
    
    $ip = $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1';
    $key = md5("{$ip}_{$actionKey}");
    $now = time();
    
    if (!isset($limits[$key]) || ($now - $limits[$key]['firstAttempt'] >= 900)) {
        $limits[$key] = ['attempts' => 1, 'firstAttempt' => $now];
    } else {
        $limits[$key]['attempts']++;
    }
    
    @file_put_contents($file, json_encode($limits, JSON_UNESCAPED_UNICODE), LOCK_EX);
}

// -------------------------------------------------------------
// Authorized Admin Emails
// -------------------------------------------------------------
function isSuperAdminEmail($email) {
    $email = strtolower(trim($email));
    $authorized = [
        'david.abnyweb@gmail.com',
        'support@abnyweb.in',
        'support@abny.in',
        'ashish@abny.in',
        'contactabny@gmail.com',
        'enquirymsj@gmail.com',
    ];
    return in_array($email, $authorized) || (substr($email, -16) === '@vachanshivir.in');
}

// -------------------------------------------------------------
// Request Routing
// -------------------------------------------------------------
$action = isset($_GET['action']) ? trim($_GET['action']) : '';

if (!$action) {
    $uri = $_SERVER['REQUEST_URI'] ?? '';
    $path = parse_url($uri, PHP_URL_PATH);
    if (preg_match('#/api/auth/([^/?]+)#', $path, $m)) {
        $action = $m[1];
    } elseif (preg_match('#/api/my-registration#', $path)) {
        $action = 'my-registration';
    }
}

// =============================================================
// ACTION: LOGIN (Email + Password)
// =============================================================
if ($action === 'login' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $raw = file_get_contents('php://input');
    $data = json_decode($raw, true) ?: [];
    
    $email = strtolower(trim($data['email'] ?? ''));
    $password = (string)($data['password'] ?? '');
    $captchaToken = trim($data['captchaToken'] ?? '');
    
    if (!$captchaToken) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Security verification (Captcha) is required.']);
        exit;
    }
    
    if (!$email || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Please enter a valid email address.']);
        exit;
    }
    
    if (empty($password)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Please enter your password.']);
        exit;
    }
    
    if (!checkRateLimit("login_{$email}", 10, 900)) {
        http_response_code(429);
        echo json_encode(['success' => false, 'error' => 'Too many login attempts. Please wait 15 minutes and try again.']);
        exit;
    }
    
    $db = getDatabase();
    $foundUser = null;
    $foundUserIndex = -1;
    
    if (isset($db['users']) && is_array($db['users'])) {
        foreach ($db['users'] as $idx => $u) {
            if (strtolower(trim($u['email'] ?? '')) === $email) {
                $foundUser = $u;
                $foundUserIndex = $idx;
                break;
            }
        }
    }
    
    // Check if user is registered in registrations list
    $userRegistration = null;
    if (isset($db['registrations']) && is_array($db['registrations'])) {
        foreach ($db['registrations'] as $r) {
            if (strtolower(trim($r['email'] ?? '')) === $email) {
                $userRegistration = $r;
                break;
            }
        }
    }
    
    // Case 1: Account exists in db.users
    if ($foundUser) {
        $hasPassword = !empty($foundUser['passwordHash']);
        
        if (!$hasPassword) {
            // Password not created yet
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'code' => 'NO_PASSWORD_SET',
                'error' => 'Your Vachan Shivir registration exists, but no password has been created yet. Click "Forgot Password?" to set your password, or use "Continue with Google".'
            ]);
            exit;
        }
        
        // Verify password
        if (password_verify($password, $foundUser['passwordHash'])) {
            // Success! Update lastLogin
            $db['users'][$foundUserIndex]['lastLogin'] = date('c');
            saveDatabaseDirect($db);
            
            $role = $foundUser['role'] ?? 'PARTICIPANT';
            if (isSuperAdminEmail($email)) {
                $role = 'SUPER_ADMIN';
            }
            
            $tokenPayload = [
                'userId' => $foundUser['id'],
                'email' => $email,
                'name' => $foundUser['name'] ?? explode('@', $email)[0],
                'role' => $role
            ];
            $authToken = createAuthToken($tokenPayload);
            
            $cleanUser = [
                'id' => $foundUser['id'],
                'name' => $foundUser['name'] ?? explode('@', $email)[0],
                'email' => $email,
                'phone' => $foundUser['phone'] ?? '',
                'role' => $role,
                'status' => 'ACTIVE'
            ];
            
            echo json_encode([
                'success' => true,
                'token' => $authToken,
                'user' => $cleanUser,
                'registration' => $userRegistration
            ]);
            exit;
        } else {
            recordRateLimitAttempt("login_{$email}");
            http_response_code(401);
            echo json_encode(['success' => false, 'error' => 'Incorrect password. Please verify and try again, or use "Forgot Password?".']);
            exit;
        }
    }
    
    // Case 2: Registration exists, but user record was not synced
    if ($userRegistration) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'code' => 'NO_PASSWORD_SET',
            'error' => 'Your registration is confirmed, but no password has been created yet. Please click "Forgot Password?" to create a password or use "Continue with Google".'
        ]);
        exit;
    }
    
    // Case 3: Neither user nor registration exists
    recordRateLimitAttempt("login_{$email}");
    http_response_code(401);
    echo json_encode([
        'success' => false,
        'code' => 'NOT_FOUND',
        'error' => 'No registration or account was found for this email. Please verify your email or register for Vachan Shivir 2026.'
    ]);
    exit;
}

// =============================================================
// ACTION: GOOGLE SIGN IN
// =============================================================
if ($action === 'google' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $raw = file_get_contents('php://input');
    $data = json_decode($raw, true) ?: [];
    
    $email = strtolower(trim($data['email'] ?? ''));
    $name = trim($data['name'] ?? '');
    $picture = trim($data['picture'] ?? '');
    
    if (!$email || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Valid Google account email is required.']);
        exit;
    }
    
    $db = getDatabase();
    
    // 1. Is this an authorized admin email?
    if (isSuperAdminEmail($email)) {
        $tokenPayload = [
            'userId' => 'usr_' . substr(md5($email), 0, 8),
            'email' => $email,
            'name' => $name ?: explode('@', $email)[0],
            'role' => 'SUPER_ADMIN'
        ];
        $authToken = createAuthToken($tokenPayload);
        
        echo json_encode([
            'success' => true,
            'token' => $authToken,
            'user' => [
                'id' => $tokenPayload['userId'],
                'name' => $tokenPayload['name'],
                'email' => $email,
                'picture' => $picture ?: null,
                'role' => 'SUPER_ADMIN',
                'status' => 'ACTIVE'
            ]
        ]);
        exit;
    }
    
    // 2. Participant check: look up in registrations or users
    $userRegistration = null;
    if (isset($db['registrations']) && is_array($db['registrations'])) {
        foreach ($db['registrations'] as $r) {
            if (strtolower(trim($r['email'] ?? '')) === $email) {
                $userRegistration = $r;
                break;
            }
        }
    }
    
    $existingUser = null;
    $existingUserIndex = -1;
    if (isset($db['users']) && is_array($db['users'])) {
        foreach ($db['users'] as $idx => $u) {
            if (strtolower(trim($u['email'] ?? '')) === $email) {
                $existingUser = $u;
                $existingUserIndex = $idx;
                break;
            }
        }
    }
    
    // If not found in registrations or users, reject with clear guidance
    if (!$userRegistration && !$existingUser) {
        http_response_code(404);
        echo json_encode([
            'success' => false,
            'notRegistered' => true,
            'error' => "No Vachan Shivir registration was found for {$email}. Please complete registration to access the participant portal."
        ]);
        exit;
    }
    
    // Auto-create or update participant account in db.users
    $now = date('c');
    $fullName = $name ?: ($userRegistration['fullName'] ?? ($userRegistration['firstName'] ?? explode('@', $email)[0]));
    
    if ($existingUserIndex >= 0) {
        $db['users'][$existingUserIndex]['lastLogin'] = $now;
        $db['users'][$existingUserIndex]['authProvider'] = 'google';
        if ($picture) $db['users'][$existingUserIndex]['picture'] = $picture;
        $userId = $db['users'][$existingUserIndex]['id'];
    } else {
        $userId = 'usr_' . time() . '_' . substr(md5($email), 0, 4);
        if (!isset($db['users'])) $db['users'] = [];
        $db['users'][] = [
            'id' => $userId,
            'name' => $fullName,
            'email' => $email,
            'phone' => $userRegistration['phone'] ?? '',
            'role' => 'PARTICIPANT',
            'status' => 'ACTIVE',
            'authProvider' => 'google',
            'picture' => $picture ?: null,
            'registeredAt' => $userRegistration['createdAt'] ?? $now,
            'lastLogin' => $now
        ];
    }
    saveDatabaseDirect($db);
    
    $tokenPayload = [
        'userId' => $userId,
        'email' => $email,
        'name' => $fullName,
        'role' => 'PARTICIPANT'
    ];
    $authToken = createAuthToken($tokenPayload);
    
    echo json_encode([
        'success' => true,
        'token' => $authToken,
        'user' => [
            'id' => $userId,
            'name' => $fullName,
            'email' => $email,
            'picture' => $picture ?: null,
            'role' => 'PARTICIPANT',
            'status' => 'ACTIVE'
        ],
        'registration' => $userRegistration
    ]);
    exit;
}

// =============================================================
// ACTION: FORGOT PASSWORD (Generate Token & Email Link)
// =============================================================
if ($action === 'forgot-password' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $raw = file_get_contents('php://input');
    $data = json_decode($raw, true) ?: [];
    
    $email = strtolower(trim($data['email'] ?? ''));
    $captchaToken = trim($data['captchaToken'] ?? '');
    
    if (!$captchaToken) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Security verification (Captcha) is required.']);
        exit;
    }
    
    if (!$email || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Please enter a valid email address.']);
        exit;
    }
    
    if (!checkRateLimit("forgot_{$email}", 5, 900)) {
        http_response_code(429);
        echo json_encode(['success' => false, 'error' => 'Too many reset requests. Please wait 15 minutes before trying again.']);
        exit;
    }
    
    $db = getDatabase();
    
    // Look up in users or registrations
    $foundUser = null;
    if (isset($db['users']) && is_array($db['users'])) {
        foreach ($db['users'] as $u) {
            if (strtolower(trim($u['email'] ?? '')) === $email) {
                $foundUser = $u;
                break;
            }
        }
    }
    
    if (!$foundUser && isset($db['registrations']) && is_array($db['registrations'])) {
        foreach ($db['registrations'] as $r) {
            if (strtolower(trim($r['email'] ?? '')) === $email) {
                // Auto-create user record
                $foundUser = [
                    'id' => 'usr_' . time() . '_' . substr(md5($email), 0, 4),
                    'name' => $r['fullName'] ?: trim(($r['firstName'] ?? '') . ' ' . ($r['lastName'] ?? '')),
                    'email' => $email,
                    'phone' => $r['phone'] ?? '',
                    'role' => 'PARTICIPANT',
                    'status' => 'ACTIVE'
                ];
                if (!isset($db['users'])) $db['users'] = [];
                $db['users'][] = $foundUser;
                break;
            }
        }
    }
    
    // Always return success to prevent email enumeration attacks
    $genericResponse = [
        'success' => true,
        'message' => 'If an account exists for this email address, password reset instructions have been sent to your inbox.'
    ];
    
    if ($foundUser) {
        // Generate cryptographic single-use token (valid for 1 hour)
        $resetToken = bin2hex(random_bytes(32));
        $now = time();
        $expiresAt = $now + 3600; // 1 hour
        
        if (!isset($db['passwordResets']) || !is_array($db['passwordResets'])) {
            $db['passwordResets'] = [];
        }
        
        // Invalidate previous tokens for this email
        foreach ($db['passwordResets'] as &$pr) {
            if (strtolower(trim($pr['email'] ?? '')) === $email) {
                $pr['used'] = true;
            }
        }
        
        $db['passwordResets'][] = [
            'email' => $email,
            'token' => $resetToken,
            'expiresAt' => $expiresAt,
            'used' => false,
            'createdAt' => date('c')
        ];
        
        // Clean up expired tokens older than 24 hours
        $db['passwordResets'] = array_values(array_filter($db['passwordResets'], function($pr) use ($now) {
            return ($pr['expiresAt'] ?? 0) > ($now - 86400);
        }));
        
        saveDatabaseDirect($db);
        
        // Send email
        @sendPasswordResetEmail($foundUser, $resetToken);
    }
    
    echo json_encode($genericResponse);
    exit;
}

// =============================================================
// ACTION: RESET PASSWORD (Set New Password with Token)
// =============================================================
if ($action === 'reset-password' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $raw = file_get_contents('php://input');
    $data = json_decode($raw, true) ?: [];
    
    $token = trim($data['token'] ?? '');
    $password = (string)($data['password'] ?? '');
    
    if (!$token) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Reset token is required.']);
        exit;
    }
    
    if (strlen($password) < 6) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Password must be at least 6 characters long.']);
        exit;
    }
    
    $db = getDatabase();
    $matchedResetIndex = -1;
    $targetEmail = '';
    
    if (isset($db['passwordResets']) && is_array($db['passwordResets'])) {
        foreach ($db['passwordResets'] as $idx => $pr) {
            if (($pr['token'] ?? '') === $token) {
                $matchedResetIndex = $idx;
                $targetEmail = strtolower(trim($pr['email'] ?? ''));
                break;
            }
        }
    }
    
    if ($matchedResetIndex === -1) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Invalid or expired password reset link. Please request a new link.']);
        exit;
    }
    
    $resetRecord = $db['passwordResets'][$matchedResetIndex];
    if (!empty($resetRecord['used']) || time() > intval($resetRecord['expiresAt'] ?? 0)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'This password reset link has expired or has already been used. Please request a new link.']);
        exit;
    }
    
    // Hash new password securely with BCRYPT
    $passwordHash = password_hash($password, PASSWORD_BCRYPT);
    
    // Update user record
    $userUpdated = false;
    if (isset($db['users']) && is_array($db['users'])) {
        foreach ($db['users'] as &$u) {
            if (strtolower(trim($u['email'] ?? '')) === $targetEmail) {
                $u['passwordHash'] = $passwordHash;
                $u['passwordUpdatedAt'] = date('c');
                $userUpdated = true;
                break;
            }
        }
    }
    
    if (!$userUpdated) {
        // Create user record if not present
        if (!isset($db['users'])) $db['users'] = [];
        $db['users'][] = [
            'id' => 'usr_' . time() . '_' . substr(md5($targetEmail), 0, 4),
            'name' => explode('@', $targetEmail)[0],
            'email' => $targetEmail,
            'role' => 'PARTICIPANT',
            'status' => 'ACTIVE',
            'passwordHash' => $passwordHash,
            'registeredAt' => date('c'),
            'passwordUpdatedAt' => date('c')
        ];
    }
    
    // Mark token as used
    $db['passwordResets'][$matchedResetIndex]['used'] = true;
    $db['passwordResets'][$matchedResetIndex]['usedAt'] = date('c');
    saveDatabaseDirect($db);
    
    echo json_encode([
        'success' => true,
        'message' => 'Your password has been successfully reset! You can now sign in with your new password.'
    ]);
    exit;
}

// =============================================================
// ACTION: ME / MY REGISTRATION (Isolated & Secure Participant Data)
// =============================================================
if ($action === 'me' || $action === 'my-registration') {
    $token = getBearerToken();
    if (!$token) {
        http_response_code(401);
        echo json_encode(['success' => false, 'error' => 'Authentication required. Please sign in to view your registration.']);
        exit;
    }
    
    $payload = verifyAuthToken($token);
    if (!$payload || empty($payload['email'])) {
        http_response_code(401);
        echo json_encode(['success' => false, 'error' => 'Your session is invalid or has expired. Please sign in again.']);
        exit;
    }
    
    $email = strtolower(trim($payload['email']));
    $role = $payload['role'] ?? 'PARTICIPANT';
    $db = getDatabase();
    
    // Find only this participant's registrations
    $userRegistrations = [];
    if (isset($db['registrations']) && is_array($db['registrations'])) {
        foreach ($db['registrations'] as $r) {
            if (strtolower(trim($r['email'] ?? '')) === $email) {
                $userRegistrations[] = $r;
            }
        }
    }
    
    // Find all attendees linked to this participant's registration(s)
    $regIds = array_column($userRegistrations, 'id');
    $userAttendees = [];
    if (isset($db['attendees']) && is_array($db['attendees'])) {
        foreach ($db['attendees'] as $a) {
            $aEmail = strtolower(trim($a['email'] ?? ''));
            $aRegId = $a['registrationId'] ?? '';
            if ($aEmail === $email || in_array($aRegId, $regIds)) {
                $userAttendees[] = $a;
            }
        }
    }
    
    $primaryRegistration = !empty($userRegistrations) ? $userRegistrations[0] : null;
    
    echo json_encode([
        'success' => true,
        'user' => [
            'id' => $payload['userId'] ?? '',
            'name' => $payload['name'] ?? '',
            'email' => $email,
            'role' => $role
        ],
        'registration' => $primaryRegistration,
        'registrations' => $userRegistrations,
        'attendees' => $userAttendees
    ]);
    exit;
}

// Fallback for unknown action
http_response_code(404);
echo json_encode(['success' => false, 'error' => "Action '{$action}' not found"]);
