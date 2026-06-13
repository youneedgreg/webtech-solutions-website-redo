<?php
// AI-aside proxy for the lead-capture chat (assets/lead-agent.js + assets/lead-ai.js).
// Same-origin only — no CORS headers are sent on purpose.
// Keeps the Mistral API key server-side; the chat falls back to a WhatsApp
// nudge on any non-2xx response, so every error path below just returns
// a small JSON {"error": "..."} body with an appropriate HTTP status.

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

$configFile = __DIR__ . '/config.php';
if (!file_exists($configFile)) {
    http_response_code(500);
    echo json_encode(['error' => 'AI assistant is not configured yet.']);
    exit;
}

$config = require $configFile;
if (empty($config['mistral_api_key']) || $config['mistral_api_key'] === 'YOUR_MISTRAL_API_KEY') {
    http_response_code(500);
    echo json_encode(['error' => 'AI assistant is not configured yet.']);
    exit;
}

// ---------- Origin check (speed bump, not a hard boundary) ----------
$allowedOrigins = isset($config['allowed_origins']) ? $config['allowed_origins'] : [];
$origin = '';
if (!empty($_SERVER['HTTP_ORIGIN'])) {
    $origin = $_SERVER['HTTP_ORIGIN'];
} elseif (!empty($_SERVER['HTTP_REFERER'])) {
    $parts = parse_url($_SERVER['HTTP_REFERER']);
    if (!empty($parts['scheme']) && !empty($parts['host'])) {
        $origin = $parts['scheme'] . '://' . $parts['host'];
        if (!empty($parts['port'])) {
            $origin .= ':' . $parts['port'];
        }
    }
}
if ($origin === '' || !in_array($origin, $allowedOrigins, true)) {
    http_response_code(403);
    echo json_encode(['error' => 'Forbidden']);
    exit;
}

// ---------- Validate request body ----------
$raw = file_get_contents('php://input');
$input = json_decode($raw, true);
if (!is_array($input)) {
    $input = [];
}

$message = isset($input['message']) ? trim((string) $input['message']) : '';
if ($message === '') {
    http_response_code(400);
    echo json_encode(['error' => 'Empty message']);
    exit;
}
if (mb_strlen($message) > 300) {
    http_response_code(400);
    echo json_encode(['error' => 'Message too long']);
    exit;
}

$validSteps = ['service', 'name', 'business', 'budget', 'timeline', 'contact'];
$step = isset($input['step']) ? (string) $input['step'] : '';
if (!in_array($step, $validSteps, true)) {
    $step = '';
}

// ---------- Per-IP daily rate limit (file-based, no DB on this host) ----------
$ip = isset($_SERVER['REMOTE_ADDR']) ? $_SERVER['REMOTE_ADDR'] : 'unknown';
$rateDir = __DIR__ . '/.rate-limit';

if (!is_dir($rateDir)) {
    if (@mkdir($rateDir, 0775, true)) {
        @file_put_contents(
            $rateDir . '/.htaccess',
            "<IfModule mod_authz_core.c>\n  Require all denied\n</IfModule>\n<IfModule !mod_authz_core.c>\n  Deny from all\n</IfModule>\n"
        );
    }
}

if (is_dir($rateDir) && is_writable($rateDir)) {
    $counterFile = $rateDir . '/' . md5($ip) . '-' . date('Y-m-d') . '.txt';
    $count = file_exists($counterFile) ? (int) file_get_contents($counterFile) : 0;

    if ($count >= 30) {
        http_response_code(429);
        echo json_encode(['error' => 'Rate limit reached. Please try WhatsApp instead.']);
        exit;
    }

    file_put_contents($counterFile, (string) ($count + 1), LOCK_EX);

    // Lottery cleanup of old counter files — no cron available on this host.
    if (mt_rand(1, 50) === 1) {
        $cutoff = time() - (2 * 86400);
        foreach (glob($rateDir . '/*.txt') as $oldFile) {
            if (filemtime($oldFile) < $cutoff) {
                @unlink($oldFile);
            }
        }
    }
}

// ---------- Build the system prompt ----------
function lead_ai_system_prompt($step)
{
    $base = <<<PROMPT
You are the AI assistant for Webtech Solutions, a digital agency based in Nairobi, Kenya. Your tone is professional yet fun and welcoming, with light natural Swahili touches (e.g. "Karibu", "Asante", "Habari") used occasionally and naturally - never forced into every sentence.

Webtech Solutions offers: web design & development, SEO & search marketing, e-commerce & online stores (including M-Pesa integration), software & business systems, mobile app development, branding & logo design, digital marketing & content, UI/UX design, and hosting & maintenance.

Known facts you can use:
- Website pricing varies by project - we don't quote exact numbers without a consultation, but most projects start with a free consultation and a clear itemised quote.
- A standard business website takes about 2-4 weeks; online stores, custom systems and AI agents vary and get an upfront timeline.
- We work with clients across Kenya and beyond - most of the process runs over WhatsApp, email and video calls.
- We integrate M-Pesa and card payments into online stores, booking systems and WhatsApp AI agents.
- A WhatsApp AI agent answers customers in English and Swahili, qualifies leads, books appointments and can take M-Pesa payments, 24/7.
- We offer post-launch support retainers: hosting, maintenance, security updates, content changes and ongoing SEO.

Answer the visitor's question in 1-2 short, friendly sentences using only the facts above and general knowledge about Webtech Solutions' services. Do NOT invent specific prices, exact dates, staff names, or guarantees. If asked for an exact price or something you don't know, say it depends on their project and a free consultation will give them a clear quote. Do NOT ask the visitor any new questions - the website's chat flow will continue asking its own questions after your reply. Do NOT use markdown, lists, or links. An occasional simple emoji is fine. Keep your reply under 240 characters.
PROMPT;

    $stepNotes = [
        'service'  => "The visitor hasn't yet told us what service they need.",
        'budget'   => 'The visitor is currently being asked about their budget range.',
        'timeline' => 'The visitor is currently being asked when they want to start.',
    ];

    if (isset($stepNotes[$step])) {
        $base .= "\n\n" . $stepNotes[$step];
    }

    return $base;
}

// ---------- HTTP POST helper (curl, with stream fallback) ----------
function lead_ai_http_post_json($url, $headers, $bodyArray, $timeout)
{
    $body = json_encode($bodyArray);

    if (function_exists('curl_init')) {
        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $body);
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
        curl_setopt($ch, CURLOPT_TIMEOUT, $timeout);
        curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 5);
        $response = curl_exec($ch);
        $errno = curl_errno($ch);
        $status = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($errno !== 0) {
            return ['ok' => false, 'status' => 0, 'body' => null];
        }
        return ['ok' => true, 'status' => $status, 'body' => $response];
    }

    $context = stream_context_create([
        'http' => [
            'method'  => 'POST',
            'header'  => implode("\r\n", $headers),
            'content' => $body,
            'timeout' => $timeout,
            'ignore_errors' => true,
        ],
    ]);

    $response = @file_get_contents($url, false, $context);
    if ($response === false) {
        return ['ok' => false, 'status' => 0, 'body' => null];
    }

    $status = 200;
    if (isset($http_response_header) && is_array($http_response_header)) {
        foreach ($http_response_header as $headerLine) {
            if (preg_match('#^HTTP/\S+\s+(\d+)#', $headerLine, $m)) {
                $status = (int) $m[1];
            }
        }
    }

    return ['ok' => true, 'status' => $status, 'body' => $response];
}

// ---------- Call Mistral ----------
$payload = [
    'model' => $config['mistral_model'],
    'messages' => [
        ['role' => 'system', 'content' => lead_ai_system_prompt($step)],
        ['role' => 'user', 'content' => $message],
    ],
    'temperature' => 0.4,
    'max_tokens' => 180,
];

$headers = [
    'Content-Type: application/json',
    'Authorization: Bearer ' . $config['mistral_api_key'],
];

$result = lead_ai_http_post_json('https://api.mistral.ai/v1/chat/completions', $headers, $payload, 12);

if (!$result['ok']) {
    http_response_code(504);
    echo json_encode(['error' => 'AI assistant is temporarily unavailable.']);
    exit;
}

if ($result['status'] < 200 || $result['status'] >= 300) {
    http_response_code(502);
    echo json_encode(['error' => 'AI assistant returned an error.']);
    exit;
}

$data = json_decode($result['body'], true);
$reply = '';
if (is_array($data) && isset($data['choices'][0]['message']['content'])) {
    $reply = trim((string) $data['choices'][0]['message']['content']);
}

if ($reply === '') {
    http_response_code(502);
    echo json_encode(['error' => 'AI assistant returned an empty reply.']);
    exit;
}

if (mb_strlen($reply) > 400) {
    $reply = trim(mb_substr($reply, 0, 400));
}

echo json_encode(['reply' => $reply]);
