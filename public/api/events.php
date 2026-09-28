<?php
// Prevent output buffering
if (function_exists('apache_setenv')) {
    @apache_setenv('no-gzip', '1');
}
@ini_set('zlib.output_compression', 'Off');
@ini_set('output_buffering', 'Off');
while (ob_get_level() > 0) {
    @ob_end_flush();
}
@ob_implicit_flush(true);

header('Content-Type: text/event-stream; charset=utf-8');
header('Cache-Control: no-cache, no-transform');
header('Connection: keep-alive');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Last-Event-ID, Authorization, Content-Type');
header('X-Accel-Buffering: no');

// If browser sends preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/db_helper.php';

// Support Last-Event-ID header or query param
$lastEventId = isset($_SERVER['HTTP_LAST_EVENT_ID']) 
    ? trim($_SERVER['HTTP_LAST_EVENT_ID']) 
    : (isset($_GET['lastEventId']) ? trim($_GET['lastEventId']) : null);

$since = isset($_GET['since']) ? floatval($_GET['since']) : 0;

// Initial connection event
echo "event: connected\n";
echo "data: " . json_encode(['status' => 'connected', 'serverTime' => date('c'), 'time' => microtime(true)]) . "\n\n";
flush();

// Flush missed events if client is reconnecting
if ($lastEventId || $since > 0) {
    $missedEvents = getRealtimeEventsAfter($lastEventId, $since);
    foreach ($missedEvents as $mEv) {
        echo "id: {$mEv['id']}\n";
        echo "event: {$mEv['event']}\n";
        echo "data: " . json_encode($mEv['data'], JSON_UNESCAPED_UNICODE) . "\n\n";
        flush();
        $lastEventId = $mEv['id'];
    }
}

// 25-second poll loop
$startTime = time();
$maxDuration = 25;
$lastCheckTimestamp = microtime(true);

while (time() - $startTime < $maxDuration) {
    if (connection_aborted()) {
        break;
    }

    $newEvents = getRealtimeEventsAfter($lastEventId, $lastCheckTimestamp);
    if (!empty($newEvents)) {
        foreach ($newEvents as $ev) {
            echo "id: {$ev['id']}\n";
            echo "event: {$ev['event']}\n";
            echo "data: " . json_encode($ev['data'], JSON_UNESCAPED_UNICODE) . "\n\n";
            flush();
            $lastEventId = $ev['id'];
            $lastCheckTimestamp = max($lastCheckTimestamp, $ev['timestamp'] ?? microtime(true));
        }
    } else {
        // Send keep-alive comment every 5 seconds
        if ((time() - $startTime) % 5 === 0) {
            echo ": keep-alive " . time() . "\n\n";
            flush();
        }
    }

    usleep(500000); // 0.5s check interval
}

exit;
