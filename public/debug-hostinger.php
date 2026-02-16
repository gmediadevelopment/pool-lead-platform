<?php
header('Content-Type: text/plain');

echo "--- Hostinger Diagnostic Tool ---\n";
echo "Time: " . date('Y-m-d H:i:s') . "\n\n";

echo "--- Environment ---\n";
echo "PHP Version: " . phpversion() . "\n";
echo "User: " . get_current_user() . "\n";
echo "CWD: " . getcwd() . "\n\n";

echo "--- Next.js / Node.js Files ---\n";
$files = ['debug.log', '.env', 'server.js', 'package.json'];
foreach ($files as $file) {
    if (file_exists($file)) {
        echo "[v] FOUND: $file (" . filesize($file) . " bytes)\n";
    } else {
        echo "[x] MISSING: $file\n";
    }
}

echo "\n--- debug.log Content (Last 50 lines) ---\n";
if (file_exists('debug.log')) {
    $lines = file('debug.log');
    $last_lines = array_slice($lines, -50);
    echo implode("", $last_lines);
} else {
    echo "No debug.log found.\n";
}

echo "\n--- System Info ---\n";
echo shell_exec('uname -a') . "\n";
echo "OpenSSL version: " . shell_exec('openssl version') . "\n";

echo "\n--- Process Check ---\n";
echo shell_exec('ps aux | grep node') . "\n";

echo "\n--- Database URL Check (Keys only) ---\n";
echo "Keys in environment: " . implode(", ", array_keys($_ENV)) . "\n";
if (file_exists('.env')) {
    echo ".env file contains DATABASE_URL: " . (strpos(file_get_contents('.env'), 'DATABASE_URL') !== false ? 'YES' : 'NO') . "\n";
}
?>
