import { Head } from '@inertiajs/react';
import { AppLayout } from '@/layouts/app-layout';
import { AppHeaderLayout } from '@/layouts/app/app-header-layout';
import { usePushNotification } from '@/Hooks/use-push-notification';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/alert';
import { Card } from '@/components/ui/card';

export default function PushNotificationsSettings() {
    const {
        permission,
        isSupported,
        isSubscribed,
        requestPermission,
        unsubscribe,
        isLoading,
        error,
    } = usePushNotification();

    const handleEnableNotifications = async () => {
        if (permission === 'default') {
            await requestPermission();
        } else if (permission === 'granted' && !isSubscribed) {
            await requestPermission();
        }
    };

    const handleDisableNotifications = async () => {
        await unsubscribe();
    };

    return (
        <>
            <Head title="Push Notifications" />

            <AppHeaderLayout>
                <div className="space-y-6">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Push Notifications</h1>
                        <p className="mt-2 text-muted-foreground">
                            Manage your push notification preferences
                        </p>
                    </div>

                    {!isSupported && (
                        <Alert variant="destructive">
                            Push notifications are not supported in your browser. Please use a modern
                            browser like Chrome, Firefox, or Safari.
                        </Alert>
                    )}

                    {error && (
                        <Alert variant="destructive">
                            {error}
                        </Alert>
                    )}

                    <Card className="p-6">
                        <div className="space-y-4">
                            <div>
                                <h2 className="text-lg font-semibold">Notification Status</h2>
                                <p className="text-sm text-muted-foreground">
                                    {permission === 'granted' && isSubscribed
                                        ? 'You will receive push notifications for important updates.'
                                        : permission === 'denied'
                                        ? 'Push notifications are blocked. Please enable them in your browser settings.'
                                        : 'Enable push notifications to receive important updates.'}
                                </p>
                            </div>

                            <div className="flex items-center gap-4">
                                {permission === 'granted' && isSubscribed ? (
                                    <Button
                                        onClick={handleDisableNotifications}
                                        disabled={isLoading}
                                        variant="outline"
                                    >
                                        {isLoading ? 'Disabling...' : 'Disable Push Notifications'}
                                    </Button>
                                ) : permission === 'denied' ? (
                                    <Button disabled variant="outline">
                                        Notifications Blocked
                                    </Button>
                                ) : (
                                    <Button
                                        onClick={handleEnableNotifications}
                                        disabled={isLoading}
                                    >
                                        {isLoading
                                            ? 'Enabling...'
                                            : permission === 'default'
                                            ? 'Enable Push Notifications'
                                            : 'Subscribe to Push Notifications'}
                                    </Button>
                                )}
                            </div>

                            <div className="space-y-2 text-sm text-muted-foreground">
                                <p>You will receive notifications for:</p>
                                <ul className="list-disc list-inside space-y-1 ml-2">
                                    <li>Reorder alerts (when stock is low)</li>
                                    <li>Approval needed notifications</li>
                                    <li>Request status updates</li>
                                </ul>
                            </div>
                        </div>
                    </Card>
                </div>
            </AppHeaderLayout>
        </>
    );
}

PushNotificationsSettings.layout = (page: React.ReactNode) => (
    <AppLayout children={page} />
);
