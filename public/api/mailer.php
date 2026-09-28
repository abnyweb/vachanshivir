<?php
// mailer.php — Enterprise Transactional Email & SMTP Service for Vachan Shivir 2026

require_once __DIR__ . '/db_helper.php';

function getEmailConfig() {
    $db = getDatabase();
    $emailConfig = isset($db['integrations']['email']) ? $db['integrations']['email'] : [];
    return [
        'smtpHost' => !empty($emailConfig['smtpHost']) ? $emailConfig['smtpHost'] : 'smtp.gmail.com',
        'smtpPort' => !empty($emailConfig['smtpPort']) ? intval($emailConfig['smtpPort']) : 587,
        'smtpUser' => !empty($emailConfig['smtpUser']) ? $emailConfig['smtpUser'] : 'enquirymsj@gmail.com',
        'smtpPassword' => !empty($emailConfig['smtpPassword']) ? $emailConfig['smtpPassword'] : '',
        'fromEmail' => !empty($emailConfig['fromEmail']) ? $emailConfig['fromEmail'] : 'support@vachanshivir.in',
        'fromName' => 'वचन अध्ययन शिविर 2026 (Vachan Shivir)'
    ];
}

function sendTransactionEmail($toEmail, $subject, $htmlBody, $replyTo = '') {
    if (empty($toEmail) || !filter_var($toEmail, FILTER_VALIDATE_EMAIL)) {
        return false;
    }

    $config = getEmailConfig();
    $sent = false;
    $method = 'php_mail';
    $error = '';

    // If SMTP credentials configured, attempt socket SMTP
    if (!empty($config['smtpHost']) && !empty($config['smtpUser']) && !empty($config['smtpPassword'])) {
        $sent = sendSmtpSocket(
            $config['smtpHost'],
            $config['smtpPort'],
            $config['smtpUser'],
            $config['smtpPassword'],
            $config['fromEmail'],
            $config['fromName'],
            $toEmail,
            $subject,
            $htmlBody,
            $error
        );
        $method = 'smtp';
    }

    // Fallback to PHP native mail()
    if (!$sent) {
        $sent = sendNativeMail(
            $config['fromEmail'],
            $config['fromName'],
            $toEmail,
            $subject,
            $htmlBody,
            $replyTo ?: $config['fromEmail'],
            $error
        );
        $method = 'native_mail';
    }

    // Log the transaction
    $log = [
        'timestamp' => date('c'),
        'to' => $toEmail,
        'subject' => $subject,
        'sent' => $sent,
        'method' => $method,
        'error' => $error
    ];
    @file_put_contents(__DIR__ . '/data/email.log', json_encode($log, JSON_UNESCAPED_UNICODE) . PHP_EOL, FILE_APPEND | LOCK_EX);

    return $sent;
}

function sendNativeMail($fromEmail, $fromName, $to, $subject, $htmlBody, $replyTo, &$error) {
    $encodedSubject = '=?UTF-8?B?' . base64_encode($subject) . '?=';
    $encodedFromName = '=?UTF-8?B?' . base64_encode($fromName) . '?=';

    $headers = [
        "MIME-Version: 1.0",
        "Content-type: text/html; charset=UTF-8",
        "From: {$encodedFromName} <{$fromEmail}>",
        "Reply-To: {$replyTo}",
        "X-Mailer: VachanShivirMailer/2.0"
    ];

    $headerStr = implode("\r\n", $headers);
    $res = @mail($to, $encodedSubject, $htmlBody, $headerStr);
    if (!$res) {
        $error = 'PHP mail() dispatch error';
    }
    return $res;
}

function sendSmtpSocket($host, $port, $user, $pass, $fromEmail, $fromName, $to, $subject, $htmlBody, &$error) {
    $timeout = 15;
    $isSsl = ($port == 465);
    $target = ($isSsl ? 'ssl://' : '') . $host;

    $socket = @fsockopen($target, $port, $errno, $errstr, $timeout);
    if (!$socket) {
        $error = "Socket connection failed: $errstr ($errno)";
        return false;
    }

    $response = fgets($socket, 515);

    fputs($socket, "EHLO vachanshivir.in\r\n");
    $response = '';
    while ($line = fgets($socket, 515)) {
        $response .= $line;
        if (substr($line, 3, 1) == " ") break;
    }

    if ($port == 587) {
        fputs($socket, "STARTTLS\r\n");
        $response = fgets($socket, 515);
        if (!stream_socket_enable_crypto($socket, true, STREAM_CRYPTO_METHOD_TLS_CLIENT)) {
            $error = "TLS handshake failed";
            fclose($socket);
            return false;
        }
        fputs($socket, "EHLO vachanshivir.in\r\n");
        while ($line = fgets($socket, 515)) {
            if (substr($line, 3, 1) == " ") break;
        }
    }

    fputs($socket, "AUTH LOGIN\r\n");
    $response = fgets($socket, 515);
    fputs($socket, base64_encode($user) . "\r\n");
    $response = fgets($socket, 515);
    fputs($socket, base64_encode($pass) . "\r\n");
    $response = fgets($socket, 515);

    if (substr($response, 0, 3) != '235') {
        $error = "SMTP AUTH error: " . trim($response);
        fclose($socket);
        return false;
    }

    fputs($socket, "MAIL FROM: <$fromEmail>\r\n");
    $response = fgets($socket, 515);
    fputs($socket, "RCPT TO: <$to>\r\n");
    $response = fgets($socket, 515);
    fputs($socket, "DATA\r\n");
    $response = fgets($socket, 515);

    $encodedSubject = '=?UTF-8?B?' . base64_encode($subject) . '?=';
    $encodedFromName = '=?UTF-8?B?' . base64_encode($fromName) . '?=';

    $headers = [
        "MIME-Version: 1.0",
        "Content-Type: text/html; charset=UTF-8",
        "From: {$encodedFromName} <{$fromEmail}>",
        "To: <{$to}>",
        "Subject: {$encodedSubject}",
        "Date: " . date('r'),
        "X-Mailer: VachanShivirSMTP/2.0"
    ];

    $emailData = implode("\r\n", $headers) . "\r\n\r\n" . $htmlBody . "\r\n.\r\n";
    fputs($socket, $emailData);
    $response = fgets($socket, 515);

    fputs($socket, "QUIT\r\n");
    fclose($socket);

    return substr($response, 0, 3) == '250';
}

/**
 * 1. Default Email: Payment Pending / Failed
 * Informs the participant that their registration is recorded and invites them to complete payment online.
 */
function sendPendingPaymentEmail($reg) {
    $name = htmlspecialchars($reg['fullName'] ?: ($reg['firstName'] . ' ' . $reg['lastName']));
    $ref = htmlspecialchars($reg['reference']);
    $phone = htmlspecialchars($reg['phone']);
    $church = htmlspecialchars($reg['churchName'] ?: 'Delegate');
    $to = $reg['email'];

    $paymentLink = "https://vachanshivir.in/my-vachan-shivir?ref=" . urlencode($reg['reference']);

    $subject = "पंजीकरण विवरण एवं शुल्क भुगतान लिंक — वचन अध्ययन शिविर 2026 (Ref: {$reg['reference']})";

    $html = <<<HTML
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>वचन अध्ययन शिविर 2026</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0b0f19; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #1e293b;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #0b0f19; padding: 30px 15px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 620px; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
          <!-- Header Banner -->
          <tr>
            <td style="background: linear-gradient(135deg, #091E3A 0%, #102a51 100%); padding: 32px 30px; text-align: center; border-bottom: 4px solid #D97706;">
              <div style="color: #F59E0B; font-size: 13px; font-weight: bold; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 6px;">26 से 29 अक्टूबर 2026 • पूरी, ओडिशा</div>
              <h1 style="color: #ffffff; font-size: 26px; margin: 0; font-family: Georgia, serif; font-weight: bold;">वचन अध्ययन शिविर 2026</h1>
              <p style="color: #94a3b8; font-size: 14px; margin: 6px 0 0 0;">ईशोपंथी आश्रम, बलियापांडा रोड, पूरी, ओडिशा</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 35px 30px;">
              <div style="background-color: #FEF3C7; border-left: 5px solid #D97706; padding: 14px 18px; border-radius: 8px; margin-bottom: 25px;">
                <p style="margin: 0; color: #92400E; font-size: 14px; font-weight: bold;">
                  ⚠️ पंजीकरण दर्ज (पंजीकरण शुल्क ₹3,000 भुगतान प्रतीक्षित है)
                </p>
              </div>

              <p style="font-size: 16px; line-height: 1.6; color: #1e293b; margin-top: 0;">
                प्रिय <strong>{$name}</strong> जी,<br><br>
                जय मसीह की। वचन अध्ययन शिविर 2026 के लिए आपका पंजीकरण फॉर्म सफलता पूर्वक दर्ज कर लिया गया है।
              </p>

              <div style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; padding: 20px; margin: 25px 0;">
                <table width="100%" cellspacing="0" cellpadding="6" style="font-size: 14px;">
                  <tr>
                    <td style="color: #64748B; width: 40%;">पंजीकरण संदर्भ क्रमांक:</td>
                    <td style="color: #0F172A; font-weight: bold; font-family: monospace; font-size: 15px;">{$ref}</td>
                  </tr>
                  <tr>
                    <td style="color: #64748B;">प्रतिभागी का नाम:</td>
                    <td style="color: #0F172A; font-weight: bold;">{$name}</td>
                  </tr>
                  <tr>
                    <td style="color: #64748B;">मोबाइल नंबर:</td>
                    <td style="color: #0F172A;">{$phone}</td>
                  </tr>
                  <tr>
                    <td style="color: #64748B;">कलीसिया का नाम:</td>
                    <td style="color: #0F172A;">{$church}</td>
                  </tr>
                  <tr>
                    <td style="color: #64748B;">पंजीकरण शुल्क:</td>
                    <td style="color: #D97706; font-weight: bold; font-size: 16px;">₹3,000 (आवास एवं भोजन सहित)</td>
                  </tr>
                </table>
              </div>

              <p style="font-size: 15px; line-height: 1.6; color: #334155;">
                शिविर में अपना स्थान पक्का करने के लिए कृपया नीचे दिए गए सुरक्षित लिंक पर क्लिक करके अपना पंजीकरण शुल्क का भुगतान पूर्ण करें। यदि आपने पहले प्रयास किया था और भुगतान किसी कारणवश असफल रहा था, तो आप इस लिंक से पुनः आसानी से UPI (GPay/PhonePe/Paytm), कार्ड या नेट बैंकिंग से भुगतान कर सकते हैं:
              </p>

              <!-- Payment Button -->
              <div style="text-align: center; margin: 32px 0;">
                <a href="{$paymentLink}" target="_blank" style="background: linear-gradient(135deg, #D97706 0%, #B45309 100%); color: #ffffff; text-decoration: none; padding: 16px 36px; font-size: 16px; font-weight: bold; border-radius: 12px; display: inline-block; box-shadow: 0 4px 14px rgba(217, 119, 6, 0.35);">
                  👉 यहाँ क्लिक करके शुल्क का भुगतान करें (Pay ₹3,000 Online)
                </a>
              </div>

              <p style="font-size: 13px; color: #64748b; line-height: 1.5; text-align: center;">
                यदि ऊपर दिया गया बटन कार्य न करे, तो यह लिंक अपने ब्राउज़र में खोलें:<br>
                <a href="{$paymentLink}" style="color: #2563EB; word-break: break-all;">{$paymentLink}</a>
              </p>

              <hr style="border: none; border-top: 1px solid #E2E8F0; margin: 30px 0;">

              <p style="font-size: 13px; color: #64748b; line-height: 1.6; margin-bottom: 0;">
                किसी भी सहायता या प्रश्न के लिए हमसे संपर्क करें:<br>
                ईमेल: <a href="mailto:support@vachanshivir.in" style="color: #091E3A; font-weight: bold;">support@vachanshivir.in</a> | फोन: +91 96961 10134
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #0F172A; color: #94A3B8; padding: 20px; text-align: center; font-size: 12px;">
              वचन अध्ययन शिविर 2026 • ईशोपंथी आश्रम, पूरी, ओडिशा<br>
              © 2026 Vachan Shivir. All rights reserved.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
HTML;

    return sendTransactionEmail($to, $subject, $html);
}

/**
 * 2. Confirmed Email: Payment Successful & Delegate Pass / Ticket
 * Sends official ticket, pass confirmation, and check-in instructions.
 */
function sendSuccessTicketEmail($reg, $paymentId = '') {
    $name = htmlspecialchars($reg['fullName'] ?: ($reg['firstName'] . ' ' . $reg['lastName']));
    $ref = htmlspecialchars($reg['reference']);
    $phone = htmlspecialchars($reg['phone']);
    $church = htmlspecialchars($reg['churchName'] ?: 'Delegate');
    $to = $reg['email'];
    $txId = htmlspecialchars($paymentId ?: ($reg['transactionId'] ?? 'CONFIRMED'));

    $passLink = "https://vachanshivir.in/my-vachan-shivir?ref=" . urlencode($reg['reference']);

    $subject = "प्रवेश पत्र एवं पुष्टिकरण टिकट — वचन अध्ययन शिविर 2026 (Ref: {$reg['reference']})";

    $html = <<<HTML
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>प्रवेश पत्र — वचन अध्ययन शिविर 2026</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0b0f19; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #1e293b;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #0b0f19; padding: 30px 15px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 620px; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
          <!-- Header Banner -->
          <tr>
            <td style="background: linear-gradient(135deg, #064E3B 0%, #065F46 100%); padding: 32px 30px; text-align: center; border-bottom: 4px solid #10B981;">
              <div style="display: inline-block; background-color: #047857; color: #A7F3D0; font-size: 12px; font-weight: bold; letter-spacing: 2px; text-transform: uppercase; padding: 4px 12px; border-radius: 20px; margin-bottom: 10px;">
                ✓ भुगतान सत्यापित एवं पुष्ट (CONFIRMED)
              </div>
              <h1 style="color: #ffffff; font-size: 26px; margin: 0; font-family: Georgia, serif; font-weight: bold;">आधिकारिक प्रवेश पत्र (DELEGATE PASS)</h1>
              <p style="color: #D1FAE5; font-size: 14px; margin: 6px 0 0 0;">वचन अध्ययन शिविर 2026 • 26 से 29 अक्टूबर 2026 • पूरी, ओडिशा</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 35px 30px;">
              <p style="font-size: 16px; line-height: 1.6; color: #1e293b; margin-top: 0;">
                प्रिय <strong>{$name}</strong> जी,<br><br>
                शुभकामनाएं! आपका पंजीकरण शुल्क का भुगतान सफलता पूर्वक प्राप्त हो चुका है। वचन अध्ययन शिविर 2026 में आपकी सहभागिता आधिकारिक रूप से स्वीकृत हो गई है।
              </p>

              <!-- Ticket Box -->
              <div style="background: #F0FDF4; border: 2px dashed #10B981; border-radius: 16px; padding: 24px; margin: 25px 0;">
                <div style="text-align: center; border-bottom: 1px solid #BBF7D0; padding-bottom: 14px; margin-bottom: 16px;">
                  <span style="font-size: 12px; text-transform: uppercase; letter-spacing: 1.5px; color: #047857; font-weight: bold;">ईशोपंथी आश्रम, पूरी, ओडिशा</span>
                  <div style="font-size: 22px; font-weight: bold; color: #064E3B; font-family: monospace; margin-top: 4px;">{$ref}</div>
                </div>

                <table width="100%" cellspacing="0" cellpadding="6" style="font-size: 14px;">
                  <tr>
                    <td style="color: #64748B; width: 42%;">प्रतिभागी का नाम:</td>
                    <td style="color: #0F172A; font-weight: bold;">{$name}</td>
                  </tr>
                  <tr>
                    <td style="color: #64748B;">मोबाइल नंबर:</td>
                    <td style="color: #0F172A;">{$phone}</td>
                  </tr>
                  <tr>
                    <td style="color: #64748B;">कलीसिया / संगठन:</td>
                    <td style="color: #0F172A;">{$church}</td>
                  </tr>
                  <tr>
                    <td style="color: #64748B;">लेनदेन संख्या (Txn ID):</td>
                    <td style="color: #065F46; font-family: monospace; font-size: 12px; font-weight: bold;">{$txId}</td>
                  </tr>
                  <tr>
                    <td style="color: #64748B;">पैकेज एवं स्थिति:</td>
                    <td style="color: #059669; font-weight: bold;">पूर्ण शिविर (आवास + भोजन) — PAID</td>
                  </tr>
                </table>
              </div>

              <!-- Button to view pass -->
              <div style="text-align: center; margin: 30px 0;">
                <a href="{$passLink}" target="_blank" style="background: linear-gradient(135deg, #059669 0%, #047857 100%); color: #ffffff; text-decoration: none; padding: 16px 36px; font-size: 16px; font-weight: bold; border-radius: 12px; display: inline-block; box-shadow: 0 4px 14px rgba(5, 150, 105, 0.35);">
                  🎫 डिजिटल बैज एवं प्रवेश पास डाउनलोड करें
                </a>
              </div>

              <!-- Check-In Guidelines -->
              <div style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; padding: 18px; font-size: 13px; line-height: 1.6; color: #334155;">
                <strong style="color: #0F172A; display: block; margin-bottom: 6px;">📋 शिविर आगमन निर्देश (Arrival Guidelines):</strong>
                • <strong>आगमन एवं चेक-इन:</strong> 26 अक्टूबर 2026 को दोपहर 2:00 बजे से चेक-इन प्रारंभ होगा।<br>
                • <strong>स्थान:</strong> ईशोपंथी आश्रम, बलियापांडा रोड, पूरी, ओडिशा (पूरी रेलवे स्टेशन से लगभग 5 किमी)।<br>
                • <strong>बैज प्राप्ति:</strong> रिसेप्शन पर अपना संदर्भ क्रमांक <strong>{$ref}</strong> दिखाकर अपना पहचान पत्र (ID Badge) एवं स्टडी किट प्राप्त करें।
              </div>

              <hr style="border: none; border-top: 1px solid #E2E8F0; margin: 25px 0;">

              <p style="font-size: 13px; color: #64748b; line-height: 1.6; margin-bottom: 0;">
                हेल्पलाइन एवं आवास सहायता:<br>
                ईमेल: <a href="mailto:support@vachanshivir.in" style="color: #091E3A; font-weight: bold;">support@vachanshivir.in</a> | फोन: +91 96961 10134
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #0F172A; color: #94A3B8; padding: 20px; text-align: center; font-size: 12px;">
              वचन अध्ययन शिविर 2026 • ईशोपंथी आश्रम, पूरी, ओडिशा<br>
              © 2026 Vachan Shivir. All rights reserved.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
HTML;

    return sendTransactionEmail($to, $subject, $html);
}

/**
 * 3. Password Reset Email
 * Sends single-use time-limited link to reset or set up account password.
 */
function sendPasswordResetEmail($user, $resetToken) {
    $name = htmlspecialchars(!empty($user['name']) ? $user['name'] : explode('@', $user['email'])[0]);
    $to = $user['email'];
    $resetLink = "https://vachanshivir.in/reset-password?token=" . urlencode($resetToken);
    
    $subject = "पासवर्ड रीसेट लिंक — वचन अध्ययन शिविर 2026 (Reset Your Password)";
    
    $html = <<<HTML
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>पासवर्ड रीसेट — वचन अध्ययन शिविर 2026</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0b0f19; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #1e293b;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #0b0f19; padding: 30px 15px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 620px; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
          <!-- Header Banner -->
          <tr>
            <td style="background: linear-gradient(135deg, #091E3A 0%, #102a51 100%); padding: 32px 30px; text-align: center; border-bottom: 4px solid #D97706;">
              <div style="color: #F59E0B; font-size: 13px; font-weight: bold; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 6px;">प्रतिभागी सुरक्षा पोर्टल • PARTICIPANT PORTAL</div>
              <h1 style="color: #ffffff; font-size: 24px; margin: 0; font-family: Georgia, serif; font-weight: bold;">वचन अध्ययन शिविर 2026</h1>
              <p style="color: #94a3b8; font-size: 13px; margin: 6px 0 0 0;">पासवर्ड सेट एवं खाता सुरक्षा (Password Setup / Reset)</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 35px 30px;">
              <p style="font-size: 16px; line-height: 1.6; color: #1e293b; margin-top: 0;">
                प्रिय <strong>{$name}</strong> जी,<br><br>
                जय मसीह की। आपके वचन अध्ययन शिविर 2026 प्रतिभागी खाते के लिए पासवर्ड सेट अथवा रीसेट करने का अनुरोध प्राप्त हुआ है।
              </p>

              <p style="font-size: 15px; line-height: 1.6; color: #334155;">
                अपने खाते में सुरक्षित लॉगिन करने और अपना पंजीकरण विवरण, प्रवेश पत्र (Delegate Pass) एवं भुगतान स्थिति देखने के लिए नीचे दिए गए बटन पर क्लिक करें:
              </p>

              <!-- Reset Button -->
              <div style="text-align: center; margin: 30px 0;">
                <a href="{$resetLink}" target="_blank" style="background: linear-gradient(135deg, #D97706 0%, #B45309 100%); color: #ffffff; text-decoration: none; padding: 15px 34px; font-size: 15px; font-weight: bold; border-radius: 12px; display: inline-block; box-shadow: 0 4px 14px rgba(217, 119, 6, 0.35);">
                  🔒 पासवर्ड सेट / रीसेट करें (Reset Password)
                </a>
              </div>

              <div style="background-color: #FEF3C7; border-left: 4px solid #D97706; padding: 12px 16px; border-radius: 6px; margin: 20px 0; font-size: 13px; color: #92400E;">
                ⏱️ <strong>सुरक्षा सूचना:</strong> यह पासवर्ड रीसेट लिंक केवल <strong>1 घंटे</strong> के लिए वैध है। यदि आपने यह अनुरोध नहीं किया था, तो आप इस ईमेल को अनदेखा कर सकते हैं; आपका खाता पूरी तरह सुरक्षित रहेगा।
              </div>

              <p style="font-size: 12px; color: #64748b; line-height: 1.5; text-align: center;">
                यदि ऊपर दिया गया बटन कार्य न करे, तो यह लिंक अपने ब्राउज़र में पेस्ट करें:<br>
                <a href="{$resetLink}" style="color: #2563EB; word-break: break-all;">{$resetLink}</a>
              </p>

              <hr style="border: none; border-top: 1px solid #E2E8F0; margin: 25px 0;">

              <p style="font-size: 12px; color: #64748b; line-height: 1.6; margin-bottom: 0;">
                सहायता के लिए संपर्क करें:<br>
                ईमेल: <a href="mailto:support@vachanshivir.in" style="color: #091E3A; font-weight: bold;">support@vachanshivir.in</a> | फोन: +91 96961 10134
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #0F172A; color: #94A3B8; padding: 18px; text-align: center; font-size: 12px;">
              वचन अध्ययन शिविर 2026 • ईशोपंथी आश्रम, पूरी, ओडिशा<br>
              © 2026 Vachan Shivir. All rights reserved.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
HTML;

    return sendTransactionEmail($to, $subject, $html);
}
