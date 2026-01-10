# Plan: Integrasi WhatsApp - Notifikasi via Fonnte API

## Phase 1: Database & Model Setup

### Task 1.1: Create Settings & Logs Migrations [8512abd]
- [x] Create migration for settings table (key-value config)
- [x] Create migration for notification_settings table
- [x] Create migration for notification_logs table
- [x] Add ULID primary keys where needed
- [x] Write unit tests for Setting model
- [x] Write unit tests for NotificationSetting model
- [x] Write unit tests for NotificationLog model
- [x] Run migrations and verify

### Task 1.2: Update User Model for Phone [6824aa0]
- [x] Add phone field to users table (migration)
- [x] Update User model with phone accessor/mutator
- [x] Add phone validation rule
- [x] Write tests for phone formatting
- [x] Run migration and verify

### Task 1.3: Create Model Relationships [fe7932e]
- [x] Define User relationships (hasOne notificationSetting, hasMany notificationLogs)
- [x] Define NotificationSetting relationships (belongsTo user)
- [x] Define NotificationLog relationships (belongsTo user)
- [x] Write tests for relationships
- [x] Run `vendor/bin/pint --dirty`

### Task 1.4: Task: Conductor - User Manual Verification 'Phase 1: Database & Model Setup' (Protocol in workflow.md)

---

## Phase 2: Fonnte API Integration

### Task 2.1: Create FonnteService
- [~] Create FonnteService class
- [ ] Implement send() method
- [ ] Implement formatPhone() method
- [ ] Add error handling
- [ ] Write tests for service
- [ ] Test API connection with real token

### Task 2.2: Create Settings Management
- [ ] Create migration to seed fonnte_api_token in settings
- [ ] Create method to get/save API token from database
- [ ] Write tests for settings operations
- [ ] Test token retrieval

### Task 2.3: Task: Conductor - User Manual Verification 'Phase 2: Fonnte API Integration' (Protocol in workflow.md)

---

## Phase 3: Queue & Job System

### Task 3.1: Create SendWhatsAppNotification Job
- [ ] Create SendWhatsAppNotification job class
- [ ] Implement handle() method with FonnteService
- [ ] Add retry configuration ($tries, $backoff)
- [ ] Implement failed() method for error logging
- [ ] Write tests for job execution
- [ ] Test retry logic

### Task 3.2: Configure Queue System
- [ ] Configure whatsapp queue connection
- [ ] Setup queue worker configuration
- [ ] Test queue dispatch and processing
- [ ] Write tests for queue operations

### Task 3.3: Create NotificationLogging
- [ ] Create NotificationLog model
- [ ] Implement log creation in job
- [ ] Log success, failure, retry states
- [ ] Write tests for logging
- [ ] Test log persistence

### Task 3.4: Task: Conductor - User Manual Verification 'Phase 3: Queue & Job System' (Protocol in workflow.md)

---

## Phase 4: Events & Listeners

### Task 4.1: Define Notification Events
- [ ] Create RequestCreated event
- [ ] Create ApprovalNeeded event
- [ ] Create ReorderPointAlert event
- [ ] Define event properties
- [ ] Write tests for events

### Task 4.2: Create Event Listeners
- [ ] Create SendWhatsAppNotificationListener
- [ ] Implement logic to dispatch job
- [ ] Check user notification settings
- [ ] Check quiet hours
- [ ] Write tests for listeners
- [ ] Test event → job dispatch flow

### Task 4.3: Register Events in EventServiceProvider
- [ ] Register events and listeners
- [ ] Test event firing
- [ ] Verify listeners are called
- [ ] Write integration tests

### Task 4.4: Task: Conductor - User Manual Verification 'Phase 4: Events & Listeners' (Protocol in workflow.md)

---

## Phase 5: Message Templates

### Task 5.1: Create Message Generator Service
- [ ] Create MessageGenerator service
- [ ] Implement generate() method with event type switch
- [ ] Create template for RequestCreated (to Operator)
- [ ] Create template for ApprovalNeeded (to Kasubag/KPA)
- [ ] Create template for ReorderPointAlert (to Operator)
- [ ] Add emoji and formatting
- [ ] Write tests for each template
- [ ] Test message generation

### Task 5.2: Task: Conductor - User Manual Verification 'Phase 5: Message Templates' (Protocol in workflow.md)

---

## Phase 6: Notification Settings & Quiet Hours

### Task 6.1: Create NotificationSettings CRUD
- [ ] Create NotificationSettingController
- [ ] Add routes for user settings
- [ ] Create validation rules
- [ ] Write tests for CRUD operations
- [ ] Test settings persistence

### Task 6.2: Implement Quiet Hours Logic
- [ ] Add quiet_hours_start and quiet_hours_end fields
- [ ] Implement isQuietHours() check
- [ ] Handle overnight range (22:00 - 06:00)
- [ ] Write tests for quiet hours logic
- [ ] Test time boundary conditions

### Task 6.3: Create User Settings UI
- [ ] Create Settings/Notifications.tsx page
- [ ] Add global toggle
- [ ] Add toggle per event
- [ ] Add quiet hours time inputs
- [ ] Implement form submission
- [ ] Write tests for components
- [ ] Test settings update

### Task 6.4: Task: Conductor - User Manual Verification 'Phase 6: Notification Settings & Quiet Hours' (Protocol in workflow.md)

---

## Phase 7: Admin Panel

### Task 7.1: Create WhatsApp Settings Page
- [ ] Create Admin/WhatsAppSettings.tsx
- [ ] Add form to update Fonnte API token
- [ ] Mask token display (show partial only)
- [ ] Add test send form
- [ ] Create TestSendNotification request
- [ ] Write tests for settings page
- [ ] Test token update

### Task 7.2: Create Notification Logs Page
- [ ] Create Admin/NotificationLogs.tsx
- [ ] Add table with logs
- [ ] Implement filters (status, event, date, user)
- [ ] Add pagination
- [ ] Show log details in modal
- [ ] Write tests for logs page
- [ ] Test filtering and display

### Task 7.3: Create NotificationLogController
- [ ] Create controller methods for logs
- [ ] Implement index with filters
- [ ] Implement show method
- [ ] Add authorization (admin only)
- [ ] Write tests for controller
- [ ] Test access control

### Task 7.4: Task: Conductor - User Manual Verification 'Phase 7: Admin Panel' (Protocol in workflow.md)

---

## Phase 8: Integration dengan Modul ATK & Bahan Kantor

### Task 8.1: Trigger Events from ATK Module
- [ ] Dispatch RequestCreated event saat request dibuat
- [ ] Dispatch ApprovalNeeded event saat butuh approval L2/L3
- [ ] Dispatch ReorderPointAlert saat stok <= minimal
- [ ] Write tests for event dispatch
- [ ] Test events are triggered correctly

### Task 8.2: Trigger Events from Bahan Kantor Module
- [ ] Dispatch events untuk office requests
- [ ] Dispatch reorder alert untuk office supplies
- [ ] Write tests for events
- [ ] Test event triggering

### Task 8.3: Task: Conductor - User Manual Verification 'Phase 8: Integration dengan Modul ATK & Bahan Kantor' (Protocol in workflow.md)

---

## Phase 9: Final Testing & Monitoring

### Task 9.1: End-to-End Notification Flow Testing
- [ ] Test RequestCreated → WhatsApp sent to Operator
- [ ] Test ApprovalNeeded → WhatsApp sent to Kasubag/KPA
- [ ] Test ReorderPointAlert → WhatsApp sent to Operator
- [ ] Test quiet hours skip
- [ ] Test disabled user settings skip
- [ ] Verify all notifications received

### Task 9.2: Error Handling & Retry Testing
- [ ] Test failed API call triggers retry
- [ ] Test retry backoff timing
- [ ] Test final failure logging
- [ ] Test Fonnte API error handling
- [ ] Verify logs are accurate

### Task 9.3: Load Testing
- [ ] Test multiple notifications queued
- [ ] Test queue worker performance
- [ ] Test concurrent jobs
- [ ] Verify no race conditions
- [ ] Test database connections

### Task 9.4: Run Complete Test Suite
- [ ] Execute `php artisan test --compact`
- [ ] Execute `npm run test` for frontend tests
- [ ] Verify coverage >80%
- [ ] Fix any failing tests
- [ ] Run `vendor/bin/pint --dirty`

### Task 9.5: Task: Conductor - User Manual Verification 'Phase 9: Final Testing & Monitoring' (Protocol in workflow.md)
