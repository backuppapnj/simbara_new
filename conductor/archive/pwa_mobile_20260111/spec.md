# Spec: PWA & Mobile Features

## Overview
Track ini mengimplementasikan fitur PWA (Progressive Web App) dan mobile-specific features untuk membuat aplikasi dapat di-install sebagai native-like app di mobile, dengan dukungan camera access untuk foto aset dan stock opname, serta barcode/QR scanning.

## Goals
1. PWA installable dengan manifest dan service worker
2. Offline support untuk critical pages
3. Camera access untuk foto aset dan stock opname
4. Barcode/QR code scanning untuk input cepat
5. Push notifications untuk update penting
6. Mobile-optimized UI (bottom nav, pull-to-refresh, touch gestures)

## Dependencies
- Existing: React 19, Inertia.js, Vite, TailwindCSS v4
- PWA: Vite PWA plugin (@vitejs/plugin-pwa)
- Camera: HTML5 Camera API
- Barcode: html5-qrcode library
- Push: Web Push API + VAPID keys

---

## Scope

### In Scope

#### 1. PWA Manifest & Service Worker

**Manifest (`public/manifest.json`):**
| Field | Value |
|-------|-------|
| `name` | "Sistem Manajemen Aset PA PPU" |
| `short_name` | "Aset PA PPU" |
| `description` | "Aplikasi Manajemen Aset dan Persediaan" |
| `start_url` | "/" |
| `display` | "standalone" |
| `background_color` | "#ffffff" |
| `theme_color` | "#1e3a5f" |
| `icons` | Array of icon sizes (72, 96, 128, 144, 152, 192, 384, 512) |

**Service Worker (`public/sw.js`):**
- Cache-first strategy untuk static assets
- Network-first strategy untuk API calls
- Cache critical pages: Dashboard, List Aset, List ATK
- Background sync untuk offline form submission
- Auto-cache update on new version

**Vite PWA Plugin Configuration:**
- Enable manifest generation
- Enable service worker registration
- Configure workbox for caching strategies

#### 2. Install UX

**Auto Install Prompt:**
- Browser native install prompt when criteria met
- Listen to `beforeinstallprompt` event
- Show custom install button if prompt dismissed

**Custom Install Button:**
- Floating button atau banner di dashboard
- "Install App" button di settings
- Show only if not yet installed
- Hide after installed

**Install Flow:**
1. User opens app
2. Browser detects PWA criteria met
3. Show install banner/button
4. User clicks install
5. App installed to home screen
6. Show "Installed successfully" message

#### 3. Camera Access Components

**Camera Component (`CameraCapture.tsx`):**
- Access camera using `navigator.mediaDevices.getUserMedia()`
- Show camera preview
- Capture button
- Flash toggle (front/back camera)
- Error handling (permission denied, no camera)
- Works on mobile and desktop

**Features:**
- Auto-select back camera on mobile
- Show preview before capture
- Multiple capture support (untuk banyak foto)
- Delete captured photo

#### 4. Barcode/QR Scanner Component

**Scanner Component (`BarcodeScanner.tsx`):**
- Use `html5-qrcode` library
- Access camera for scanning
- Detection for QR code and barcode
- Auto-focus on detection
- Sound/vibrate on success

**Features:**
- Continuous scanning mode
- Manual scan button
- Result parsing (extract value)
- Add to form input automatically

**Use Cases:**
- Scan kode barang untuk input cepat
- Scan QR code untuk quick access to asset detail
- Scan kode lokasi

#### 5. Image Processing

**Image Compression:**
- Compress image before upload
- Target quality: 80%
- Max dimension: 1920px (width/height)
- Format: JPEG (smaller size)

**Preview & Crop:**
- Show preview after capture
- Crop tool with aspect ratio options
- Rotate image
- Confirm before upload

**Upload Flow:**
1. Capture/Select image
2. Preview & crop (optional)
3. Compress
4. Upload to server
5. Show progress
6. Update form with image URL

#### 6. Offline Capability

**Critical Pages Cached:**
- Dashboard (with cached data)
- Assets Index
- OfficeSupplies Index
- Items Index

**Offline Features:**
- Show cached data when offline
- "Offline mode" indicator
- Disable forms when offline (show error)
- Queue form submissions for background sync

**Cache Strategy:**
- HTML/JS/CSS: Cache-first (1 year)
- API Data: Network-first with cache fallback
- Images: Cache-first (7 days)
- Dynamic pages: Network-first, cache on response

#### 7. Push Notifications

**Notification Types:**
- Reorder Alert (stok <= minimal)
- Approval Needed (pending requests)
- Request Status Update (approved/rejected)

**Implementation:**
- Web Push API
- VAPID keys for push server
- Service Worker for push message handling
- Notification click handling (navigate to relevant page)

**Permission Request:**
- Show prompt on first relevant event
- Custom permission button in settings
- Remember user choice

#### 8. Mobile UI Components

**Bottom Navigation:**
- 5 tabs: Dashboard, Aset, ATK, Bahan Kantor, Settings
- Show only on mobile (< 768px)
- Hide sidebar on mobile
- Active state indicator

**Pull-to-Refresh:**
- Implement on list pages (Assets, ATK, etc.)
- Show loading indicator
- Refresh data from server
- Update timestamp

**Touch Gestures:**
- Swipe left/right on list items (quick actions)
- Long-press for context menu
- Pinch-to-zoom for image preview
- Touch feedback (vibration on success)

#### 9. Photo Upload Integration

**Modul Aset:**
- Add photo upload component to asset detail
- Multiple photos per asset (jml_photo field)
- Capture from camera or upload from gallery
- Preview thumbnail grid
- Delete photo

**Stock Opname:**
- Photo documentation per item
- Capture kondisi fisik barang
- Attach to stock_opname_details
- Show in berita acara

### Out of Scope
- Native app (iOS/Android)
- In-app purchases
- Biometric authentication
- Offline editing (view-only offline)
- Video recording
- Multiple file upload at once

---

## Technical Implementation Details

### Directory Structure
```
public/
├── manifest.json
├── sw.js
├── sw.js.map
├── icons/
│   ├── icon-72x72.png
│   ├── icon-96x96.png
│   ├── icon-128x128.png
│   ├── icon-144x144.png
│   ├── icon-152x152.png
│   ├── icon-192x192.png
│   ├── icon-384x384.png
│   ├── icon-512x512.png
│   └── favicon.ico
resources/js/
├── Components/
│   ├── Mobile/
│   │   ├── BottomNav.tsx
│   │   ├── PullToRefresh.tsx
│   │   └── InstallPrompt.tsx
│   ├── Camera/
│   │   ├── CameraCapture.tsx
│   │   ├── ImagePreview.tsx
│   │   └── ImageCropper.tsx
│   └── Scanner/
│       └── BarcodeScanner.tsx
├── Composables/
│   ├── useInstallPWA.ts
│   ├── useCamera.ts
│   ├── useBarcodeScanner.ts
│   └── useOffline.ts
├── Hooks/
│   └── usePushNotification.ts
```

### Vite PWA Plugin
```javascript
// vite.config.ts
import { VitePWA } from '@vitejs/plugin-pwa'

export default defineConfig({
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Sistem Manajemen Aset PA PPU',
        short_name: 'Aset PA PPU',
        description: 'Aplikasi Manajemen Aset dan Persediaan',
        theme_color: '#1e3a5f',
        icons: {
          // icon definitions
        }
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\//,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: 86400, // 1 day
              networkTimeoutSeconds: 10
            }
          }
        ]
      }
    })
  ]
})
```

### Camera Hook
```typescript
// Composables/useCamera.ts
export function useCamera() {
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [error, setError] = useState<string | null>(null)

  const startCamera = async (facingMode: 'user' | 'environment' = 'environment') => {
    try {
      const constraints = {
        video: { facingMode },
        audio: false
      }
      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints)
      setStream(mediaStream)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Camera access denied')
    }
  }

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
      setStream(null)
    }
  }

  const capturePhoto = (videoRef: RefObject<HTMLVideoElement>): string => {
    const video = videoRef.current
    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    canvas.getContext('2d')?.drawImage(video, 0, 0)
    return canvas.toDataURL('image/jpeg', 0.8)
  }

  return { stream, error, startCamera, stopCamera, capturePhoto }
}
```

### Barcode Scanner Hook
```typescript
// Composables/useBarcodeScanner.ts
import { Html5Qrcode } from 'html5-qrcode'

export function useBarcodeScanner(onDetected: (code: string) => void) {
  const [isScanning, setIsScanning] = useState(false)
  const scannerRef = useRef<Html5Qrcode | null>(null)

  const startScanning = async (elementId: string) => {
    try {
      scannerRef.current = new Html5Qrcode(elementId)
      await scannerRef.current.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          onDetected(decodedText)
          // Vibrate on success
          if (navigator.vibrate) navigator.vibrate(200)
        }
      )
      setIsScanning(true)
    } catch (err) {
      console.error('Scanner error:', err)
    }
  }

  const stopScanning = async () => {
    if (scannerRef.current) {
      await scannerRef.current.stop()
      setIsScanning(false)
    }
  }

  return { isScanning, startScanning, stopScanning }
}
```

### Install Prompt Hook
```typescript
// Composables/useInstallPWA.ts
export function useInstallPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
    }

    window.addEventListener('beforeinstallprompt', handler)

    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true)
    }

    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const install = async () => {
    if (!deferredPrompt) return

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    setDeferredPrompt(null)

    if (outcome === 'accepted') {
      setIsInstalled(true)
    }
  }

  return { deferredPrompt, isInstalled, install }
}
```

### Image Compression
```typescript
// Utils/imageUtils.ts
export async function compressImage(dataUrl: string, quality: number = 0.8): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      const MAX_WIDTH = 1920
      const scale = Math.min(1, MAX_WIDTH / img.width)

      canvas.width = img.width * scale
      canvas.height = img.height * scale

      canvas.getContext('2d')?.drawImage(img, 0, 0, canvas.width, canvas.height)
      resolve(canvas.toDataURL('image/jpeg', quality))
    }
    img.src = dataUrl
  })
}
```

### Offline Detection Hook
```typescript
// Composables/useOffline.ts
export function useOffline() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine)

  useEffect(() => {
    const handleOnline = () => setIsOffline(false)
    const handleOffline = () => setIsOffline(true)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return isOffline
}
```
