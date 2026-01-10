<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Web Push Configuration
    |--------------------------------------------------------------------------
    |
    | Configuration for Web Push notifications using VAPID keys.
    |
    */

    'vapid' => [
        'public_key' => env('VAPID_PUBLIC_KEY'),
        'private_key' => env('VAPID_PRIVATE_KEY'),
        'subject' => env('VAPID_SUBJECT', 'mailto:admin@example.com'),
    ],

    'ttl' => env('WEBPUSH_TTL', 3600), // Time to live in seconds

    'urgency' => env('WEBPUSH_URGENCY', 'normal'), // low, normal, high

    'topic' => env('WEBPUSH_TOPIC'), // Optional: group notifications with same topic

];
