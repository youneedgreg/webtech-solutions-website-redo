<?php
// Copy this file to config.php (gitignored — never commit real keys) and
// fill in your real Mistral API key from https://console.mistral.ai/

return [
  'mistral_api_key' => 'YOUR_MISTRAL_API_KEY',
  'mistral_model'   => 'mistral-small-latest',

  // Only requests whose Origin/Referer match one of these are answered.
  // Add your local testing origin here too if needed.
  'allowed_origins' => [
    'https://webtechsolutionske.com',
  ],
];
