<?php
// Contact Form Handler for CyberSentinel
// Sends emails to support@exposingwithjay.store

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

// Get form data
$input = json_decode(file_get_contents('php://input'), true);

// Validate required fields
$required_fields = ['name', 'email', 'subject', 'message'];
foreach ($required_fields as $field) {
    if (empty($input[$field])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => "Field '$field' is required"]);
        exit;
    }
}

// Sanitize input
$name = filter_var($input['name'], FILTER_SANITIZE_STRING);
$email = filter_var($input['email'], FILTER_SANITIZE_EMAIL);
$subject = filter_var($input['subject'], FILTER_SANITIZE_STRING);
$message = filter_var($input['message'], FILTER_SANITIZE_STRING);
$urgent = isset($input['urgent']) ? (bool)$input['urgent'] : false;
$anonymous = isset($input['anonymous']) ? (bool)$input['anonymous'] : false;

// Validate email
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid email address']);
    exit;
}

// Rate limiting (simple file-based)
$rate_limit_file = 'rate_limit.json';
$current_time = time();
$rate_limits = [];

if (file_exists($rate_limit_file)) {
    $rate_limits = json_decode(file_get_contents($rate_limit_file), true);
}

$client_ip = $_SERVER['REMOTE_ADDR'];
if (isset($rate_limits[$client_ip])) {
    $last_submission = $rate_limits[$client_ip];
    if ($current_time - $last_submission < 60) { // 1 minute cooldown
        http_response_code(429);
        echo json_encode(['success' => false, 'message' => 'Please wait before submitting another message']);
        exit;
    }
}

// Update rate limit
$rate_limits[$client_ip] = $current_time;
file_put_contents($rate_limit_file, json_encode($rate_limits));

// Prepare email
$to = 'support@exposingwithjay.store';
$email_subject = '[CyberSentinel] ' . ($urgent ? '[URGENT] ' : '') . $subject;

$email_body = "
New contact form submission from CyberSentinel website:

Name: " . ($anonymous ? '[Anonymous]' : $name) . "
Email: " . ($anonymous ? '[Hidden]' : $email) . "
Subject: $subject
Urgent: " . ($urgent ? 'Yes' : 'No') . "
Anonymous: " . ($anonymous ? 'Yes' : 'No') . "
Submitted: " . date('Y-m-d H:i:s T') . "
IP Address: $client_ip

Message:
$message

---
This message was sent via the CyberSentinel contact form.
Reply directly to this email to respond to the sender.
";

$headers = [
    'From: CyberSentinel Contact Form <noreply@exposingwithjay.store>',
    'Reply-To: ' . ($anonymous ? 'noreply@exposingwithjay.store' : $email),
    'X-Mailer: CyberSentinel Contact System',
    'Content-Type: text/plain; charset=UTF-8',
    'X-Priority: ' . ($urgent ? '1' : '3')
];

// Send email to support
$mail_sent = mail($to, $email_subject, $email_body, implode("\r\n", $headers));

// Send auto-reply to user (if not anonymous)
$auto_reply_sent = false;
if (!$anonymous && filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $auto_reply_subject = '[CyberSentinel] Thank you for contacting us - Message Received';
    
    $auto_reply_body = "
Dear $name,

Thank you for contacting CyberSentinel. We have received your message and wanted to confirm that it has been successfully submitted to our team.

MESSAGE DETAILS:
Subject: $subject
Submitted: " . date('Y-m-d H:i:s T') . "
Priority: " . ($urgent ? 'URGENT - High Priority' : 'Standard Priority') . "

WHAT HAPPENS NEXT:
• Your message has been forwarded to our support team at support@exposingwithjay.store
• We typically respond within 24-48 hours during business days
• " . ($urgent ? 'Due to the urgent nature of your message, we will prioritize your request' : 'We will review your message and respond as soon as possible') . "
• If you need immediate assistance for emergency situations, please contact local authorities first (911)

IMPORTANT REMINDERS:
• Please do not reply to this automated message
• If you need to add additional information, please submit a new contact form
• For urgent matters involving immediate danger, contact emergency services immediately

Thank you for helping us protect children online. Your report and support make a difference.

Best regards,
The CyberSentinel Team
ExposingWithJay

---
This is an automated response from the CyberSentinel contact system.
For support, visit: https://exposingwithjay.store/contact.html
";

    $auto_reply_headers = [
        'From: CyberSentinel Support <noreply@exposingwithjay.store>',
        'Reply-To: support@exposingwithjay.store',
        'X-Mailer: CyberSentinel Auto-Reply System',
        'Content-Type: text/plain; charset=UTF-8',
        'X-Auto-Response-Suppress: All',
        'Auto-Submitted: auto-replied'
    ];

    $auto_reply_sent = mail($email, $auto_reply_subject, $auto_reply_body, implode("\r\n", $auto_reply_headers));
}

if ($mail_sent) {
    // Log successful submission
    $log_entry = [
        'id' => uniqid('msg_'),
        'timestamp' => date('Y-m-d H:i:s T'),
        'name' => $anonymous ? '[Anonymous]' : $name,
        'email' => $anonymous ? '[Hidden]' : $email,
        'subject' => $subject,
        'message' => substr($message, 0, 200) . (strlen($message) > 200 ? '...' : ''),
        'urgent' => $urgent,
        'anonymous' => $anonymous,
        'ip' => $client_ip,
        'status' => 'sent',
        'auto_reply_sent' => $auto_reply_sent,
        'read' => false
    ];
    
    $log_file = 'contact_log.json';
    $logs = [];
    if (file_exists($log_file)) {
        $logs = json_decode(file_get_contents($log_file), true);
        if (!is_array($logs)) {
            $logs = [];
        }
    }
    $logs[] = $log_entry;
    
    // Keep only last 1000 entries
    if (count($logs) > 1000) {
        $logs = array_slice($logs, -1000);
    }
    
    file_put_contents($log_file, json_encode($logs, JSON_PRETTY_PRINT));
    
    // Also store in localStorage format for admin dashboard
    $localStorage_entry = [
        'id' => $log_entry['id'],
        'name' => $log_entry['name'],
        'email' => $log_entry['email'],
        'subject' => $subject,
        'message' => $message,
        'timestamp' => date('c'),
        'read' => false,
        'urgent' => $urgent,
        'anonymous' => $anonymous,
        'status' => 'received'
    ];
    
    $localStorage_file = 'contact_messages.json';
    $localStorage_messages = [];
    if (file_exists($localStorage_file)) {
        $localStorage_messages = json_decode(file_get_contents($localStorage_file), true);
        if (!is_array($localStorage_messages)) {
            $localStorage_messages = [];
        }
    }
    array_unshift($localStorage_messages, $localStorage_entry);
    
    // Keep only last 500 entries for localStorage
    if (count($localStorage_messages) > 500) {
        $localStorage_messages = array_slice($localStorage_messages, 0, 500);
    }
    
    file_put_contents($localStorage_file, json_encode($localStorage_messages, JSON_PRETTY_PRINT));
    
    $response_message = 'Message sent successfully! We will respond within 24-48 hours.';
    if ($auto_reply_sent && !$anonymous) {
        $response_message .= ' A confirmation email has been sent to your email address.';
    }
    
    echo json_encode([
        'success' => true, 
        'message' => $response_message,
        'id' => $log_entry['id'],
        'auto_reply_sent' => $auto_reply_sent
    ]);
} else {
    http_response_code(500);
    echo json_encode([
        'success' => false, 
        'message' => 'Failed to send message. Please check your server email configuration or try again later.',
        'debug' => 'PHP mail() function failed - check server SMTP settings'
    ]);
}
?>