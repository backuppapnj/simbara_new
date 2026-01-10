# Spec: Integrasi WhatsApp - Notifikasi via Fonnte API

## Overview
Track ini mengimplementasikan sistem notifikasi WhatsApp menggunakan Fonnte API untuk memberikan update real-time kepada user terkait aktivitas di sistem (permintaan ATK, approval, reorder alert).

## Goals
1. Integrasi Fonnte API untuk kirim notifikasi WhatsApp
2. Notifikasi untuk event: permintaan ATK, reorder alert, approval needed
3. Settings notifikasi per user (enable/disable per event, quiet hours)
4. Queue system untuk async delivery dengan retry logic
5. Logging dan monitoring pengiriman
6. Admin panel untuk test send dan view delivery logs

## Dependencies
- Fonnte API (https://fonnte.com)
- Laravel Queue System
- User model dengan field `phone`
- Events dari modul ATK dan Bahan Kantor

---

## Scope

### In Scope

#### 1. Fonnte API Integration

**API Configuration:**
| Field | Type | Description |
|-------|------|-------------|
| `key` | VARCHAR(50) | 'fonnte_api_token' |
| `value` | TEXT | API Token dari Fonnte |
| `type` | VARCHAR(20) | 'whatsapp_config' |

**API Endpoints Used:**
- `POST https://api.fonnte.com/send` - Kirim pesan

#### 2. Notification Events

**Event 1: Permintaan ATK Baru**
- **Trigger:** Pegawai buat permintaan ATK
- **Penerima:** Operator Persediaan
- **Pesan:** Info permintaan baru (no, pemohon, items, link ke detail)

**Event 2: Permintaan Disetujui/Ditolak**
- **Trigger:** Operator approve/reject permintaan
- **Penerima:** Pemohon (via in-app, bukan WA - user sudah pilih ini tidak via WA)

**Event 3: Permintaan Need Approval (Kasubag/KPA)**
- **Trigger:** Permintaan menunggu approval level 2/3
- **Penerima:** Kasubag Umum / KPA
- **Pesan:** Info ada permintaan yang perlu approval (no, pemohon, items, link)

**Event 4: Reorder Point Alert**
- **Trigger:** Stok <= stok minimal (ATK atau Bahan Kantor)
- **Penerima:** Operator Persediaan
- **Pesan:** Alert barang di bawah stok minimal (nama barang, stok saat ini, stok minimal)

#### 3. Notification Settings per User

**NotificationSettings Table:**
| Field | Type | Description |
|-------|------|-------------|
| `id` | ULID | Primary key |
| `user_id` | ULID | Foreign key |
| `whatsapp_enabled` | BOOLEAN | Global toggle on/off |
| `notify_reorder_alert` | BOOLEAN | Notifikasi reorder point |
| `notify_approval_needed` | BOOLEAN | Notifikasi ada permintaan need approval |
| `notify_request_update` | BOOLEAN | Notifikasi update permintaan |
| `quiet_hours_start` | TIME | Jam mulai quiet hours (opsional) |
| `quiet_hours_end` | TIME | Jam selesai quiet hours (opsional) |
| `created_at` | TIMESTAMP |
| `updated_at` | TIMESTAMP |

**Default Settings:**
- whatsapp_enabled: true (jika user ada phone)
- notify_reorder_alert: true (untuk Operator)
- notify_approval_needed: true (untuk Kasubag/KPA)
- notify_request_update: false (default, karena user tidak pakai WA untuk ini)
- quiet_hours: null (24/7)

#### 4. Message Templates

**Template Format: Rich (dengan emoji, bullet points, sections)**

**Template 1: Permintaan Baru (ke Operator)**
```
🔔 PERMINTAAN ATK BARU

No: PRQ-2024001
Pemohon: Budi Santoso
Departemen: Keuangan
Tanggal: 11 Januari 2026

Items:
• Kertas A4 - 5 rim
• Pulpen Hitam - 10 pcs
• Map Kuning - 20 pcs

Silakan cek dan proses permintaan.

Link: https://app.domain.com/requests/PRQ-2024001

---
Sistem Manajemen Aset & Persediaan
Pengadilan Agama Penajam Paser Utara
```

**Template 2: Approval Needed (ke Kasubag/KPA)**
```
✋ PERMINTAAN BUTUH APPROVAL

No: PRQ-2024001
Pemohon: Budi Santoso
Departemen: Keuangan
Level: Level 2 (Kasubag Umum)

Items:
• Kertas A4 - 5 rim
• Pulpen Hitam - 10 pcs
• Map Kuning - 20 pcs

Mohon review dan approval.

Link: https://app.domain.com/requests/PRQ-2024001

---
Sistem Manajemen Aset & Persediaan
Pengadilan Agama Penajam Paser Utara
```

**Template 3: Reorder Alert (ke Operator)**
```
⚠️ REORDER POINT ALERT

Barang berikut di bawah stok minimal:

Kertas A4 (Sinar Dunia)
• Stok saat ini: 15 rim
• Stok minimal: 20 rim
• Kurang: 5 rim

Silakan lakukan pembelian.

Link: https://app.domain.com/items

---
Sistem Manajemen Aset & Persediaan
Pengadilan Agama Penajam Paser Utara
```

#### 5. Queue & Delivery System

**Queue Job:**
- Job class: `SendWhatsAppNotification`
- Queue: `whatsapp`
- Connection: database/redis
- Retry: 3 times with exponential backoff (1min, 5min, 30min)
- Timeout: 30 seconds

**Delivery Flow:**
1. Event triggered → Dispatch job to queue
2. Job pick from queue → Call Fonnte API
3. Success → Mark as sent, log to notification_logs
4. Failed → Retry (max 3x)
5. Failed after retries → Mark as failed, log error

#### 6. Logging & Monitoring

**NotificationLogs Table:**
| Field | Type | Description |
|-------|------|-------------|
| `id` | ULID | Primary key |
| `user_id` | ULID | Recipient |
| `event_type` | VARCHAR(50) | request_created, approval_needed, reorder_alert |
| `phone` | VARCHAR(20) | Nomor tujuan |
| `message` | TEXT | Isi pesan |
| `status` | ENUM | pending, sent, failed, retrying |
| ` Fonnte_response` | JSON | Response dari API |
| `error_message` | TEXT | Error jika gagal |
| `retry_count` | INTEGER | Jumlah retry (0-3) |
| `sent_at` | TIMESTAMP | Waktu sent |
| `created_at` | TIMESTAMP | Waktu dibuat |

#### 7. Phone Number Validation

**User Model - `phone` field:**
- Format: Indonesia (+62 atau 08)
- Validation regex: `/^(\+62|62|0)8[1-9][0-9]{6,9}$/`
- Auto-format: Simpan dengan format +62 (jika user input 08, auto-convert ke +628)

#### 8. Admin Panel Features

**Settings Management:**
- Update Fonnte API Token
- Test Send: Form untuk kirim test pesan ke nomor tertentu
- View/Delete API Token

**Delivery Logs:**
- List all notification logs
- Filter by: status, event type, date range, user
- Show details: phone, message, status, Fonnte response, error
- Pagination (50 per page)
- Export log to CSV (optional)

#### 9. Settings Page per User

**User Notification Settings Page:**
- Global toggle: Enable/disable WhatsApp notifications
- Toggle per event: Reorder alert, Approval needed, Request update
- Quiet hours: Set start/end time
- Test send to own number

#### 10. Quiet Hours Logic

**Rule:**
- Jika current time dalam quiet hours range → Tidak kirim notifikasi
- Queue job akan skip jika dalam quiet hours
- Notifikasi yang terlewat tidak di-send lagi (bukan delay)

**Example:**
- Quiet hours: 22:00 - 06:00
- Event trigger jam 23:00 → Tidak kirim
- Event trigger jam 08:00 → Kirim

### Out of Scope
- WhatsApp dua arah (incoming messages)
- Media attachments (gambar, document)
- Interactive buttons (quick reply)
- Multiple WhatsApp providers
- SMS fallback jika WA gagal

---

## Technical Implementation Details

### Directory Structure
```
app/
├── Services/
│   └── FonnteService.php
├── Jobs/
│   └── SendWhatsAppNotification.php
├── Models/
│   ├── NotificationSetting.php
│   └── NotificationLog.php
├── Http/
│   ├── Controllers/
│   │   ├── NotificationSettingController.php
│   │   └── NotificationLogController.php
│   └── Requests/
│       ├── SendTestNotificationRequest.php
│       └── UpdateNotificationSettingsRequest.php
├── Listeners/
│   └── SendWhatsAppNotificationListener.php
├── Events/
│   ├── RequestCreated.php
│   ├── RequestApproved.php
│   ├── RequestRejected.php
│   ├── ApprovalNeeded.php
│   └── ReorderPointAlert.php
resources/js/
├── Pages/
│   ├── Settings/
│   │   └── Notifications.tsx
│   └── Admin/
│       ├── WhatsAppSettings.tsx
│       └── NotificationLogs.tsx
├── Components/
│   └── Notifications/
│       ├── TestSendForm.tsx
│       └── NotificationLogsTable.tsx
```

### Fonnte Service
```php
class FonnteService
{
    protected $apiToken;
    protected $endpoint = 'https://api.fonnte.com/send';

    public function __construct()
    {
        $this->apiToken = Setting::where('key', 'fonnte_api_token')->first()->value;
    }

    public function send($target, $message)
    {
        $response = Http::withToken($this->apiToken)
            ->post($this->endpoint, [
                'target' => $this->formatPhone($target),
                'message' => $message,
            ]);

        return $response->json();
    }

    protected function formatPhone($phone)
    {
        // Convert to +62 format
        return preg_replace('/^(0|62)/', '+62', $phone);
    }
}
```

### Queue Job
```php
class SendWhatsAppNotification implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $tries = 3;
    public $backoff = [60, 300, 1800]; // 1min, 5min, 30min

    public function __construct(
        public User $user,
        public string $eventType,
        public array $data
    ) {}

    public function handle(FonnteService $fonnte)
    {
        // Check quiet hours
        if ($this->isQuietHours()) {
            return; // Skip if in quiet hours
        }

        // Check user settings
        if (!$this->user->notificationSetting->whatsapp_enabled) {
            return;
        }

        // Generate message based on event type
        $message = $this->generateMessage();

        // Send via Fonnte
        $response = $fonnte->send($this->user->phone, $message);

        // Log result
        $this->logResult($response);
    }

    public function failed(Throwable $exception)
    {
        // Log failure
        NotificationLog::create([
            'user_id' => $this->user->id,
            'event_type' => $this->eventType,
            'status' => 'failed',
            'error_message' => $exception->getMessage(),
            'retry_count' => $this->attempts(),
        ]);
    }
}
```

### Event Listeners
```php
// EventServiceProvider.php
protected $listen = [
    RequestCreated::class => [
        SendWhatsAppNotificationListener::class,
    ],
    ApprovalNeeded::class => [
        SendWhatsAppNotificationListener::class,
    ],
    ReorderPointAlert::class => [
        SendWhatsAppNotificationListener::class,
    ],
];
```

### Phone Validation
```php
// User model
protected $casts = [
    'phone' => 'string',
];

public function setPhoneAttribute($value)
{
    // Auto-format to +62
    $this->attributes['phone'] = preg_replace('/^(0|62)/', '+62', $value);
}

public static $rules = [
    'phone' => ['required', 'regex:/^(\+62|62|0)8[1-9][0-9]{6,9}$/'],
];
```

### Quiet Hours Check
```php
protected function isQuietHours(): bool
{
    $setting = $this->user->notificationSetting;

    if (!$setting->quiet_hours_start || !$setting->quiet_hours_end) {
        return false;
    }

    $now = now()->format('H:i');
    $start = $setting->quiet_hours_start;
    $end = $setting->quiet_hours_end;

    // Check if now is within quiet hours range
    if ($start <= $end) {
        // Normal range (e.g., 22:00 - 06:00 same day)
        return $now >= $start && $now <= $end;
    } else {
        // Overnight range (e.g., 22:00 - 06:00 next day)
        return $now >= $start || $now <= $end;
    }
}
```
