import '../css/app.css';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { initializeTheme } from './hooks/use-appearance';
import { Toaster } from './components/ui/sonner';
import { FlashHandler } from './components/flash-handler';

// Import PWA service worker registration
import { registerSW } from 'virtual:pwa-register';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    resolve: (name) =>
        resolvePageComponent(
            `./pages/${name}.tsx`,
            import.meta.glob('./pages/**/*.tsx'),
        ),
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(
            <StrictMode>
                <FlashHandler />
                <App {...props} />
                <Toaster />
            </StrictMode>,
        );
    },
    progress: {
        color: '#4B5563',
    },
});

// This will set light / dark mode on load...
initializeTheme();

// Register PWA service worker
const updateSW = registerSW({
    onNeedRefresh() {
        if (confirm('New content available. Reload to update?')) {
            updateSW(true);
        }
    },
    onOfflineReady() {
        console.log('App is ready to work offline');
    },
    onRegistered(registration) {
        console.log('Service Worker registered:', registration);

        // Check for updates every hour
        if (registration) {
            setInterval(
                () => {
                    registration.update();
                },
                60 * 60 * 1000,
            );
        }
    },
    onRegisterError(error) {
        console.error('Service Worker registration error:', error);
    },
});
