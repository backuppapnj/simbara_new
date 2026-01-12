import NotificationSettingController from '@/actions/App/Http/Controllers/NotificationSettingController';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm, usePage } from '@inertiajs/react';
import { FormEvent } from 'react';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Notification settings',
        href: '/settings/notifications',
    },
];

interface NotificationSettings {
    id: number;
    user_id: string;
    whatsapp_enabled: boolean;
    push_enabled: boolean;
    notify_reorder_alert: boolean;
    notify_approval_needed: boolean;
    notify_request_update: boolean;
    quiet_hours_start: string | null;
    quiet_hours_end: string | null;
}

interface PageProps {
    settings: NotificationSettings;
    [key: string]: unknown;
}

export default function NotificationSettings() {
    const { settings } = usePage<PageProps>().props;

    const { data, setData, put, processing, errors, recentlySuccessful } =
        useForm({
            whatsapp_enabled: settings.whatsapp_enabled,
            push_enabled: settings.push_enabled,
            notify_reorder_alert: settings.notify_reorder_alert,
            notify_approval_needed: settings.notify_approval_needed,
            notify_request_update: settings.notify_request_update,
            quiet_hours_start: settings.quiet_hours_start || '',
            quiet_hours_end: settings.quiet_hours_end || '',
        });

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        put(NotificationSettingController.update.url(), {
            preserveScroll: true,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Notification settings" />

            <h1 className="sr-only">Notification Settings</h1>

            <SettingsLayout>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-4 rounded-lg border p-4">
                        <h2 className="text-lg font-semibold">
                            Notification Preferences
                        </h2>

                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label
                                    htmlFor="whatsapp_enabled"
                                    className="cursor-pointer"
                                >
                                    WhatsApp Notifications
                                </Label>
                                <p className="text-sm text-muted-foreground">
                                    Receive notifications via WhatsApp
                                </p>
                            </div>
                            <Checkbox
                                id="whatsapp_enabled"
                                checked={data.whatsapp_enabled}
                                onCheckedChange={(checked) =>
                                    setData(
                                        'whatsapp_enabled',
                                        checked as boolean,
                                    )
                                }
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label
                                    htmlFor="push_enabled"
                                    className="cursor-pointer"
                                >
                                    Push Notifications
                                </Label>
                                <p className="text-sm text-muted-foreground">
                                    Receive browser push notifications
                                </p>
                            </div>
                            <Checkbox
                                id="push_enabled"
                                checked={data.push_enabled}
                                onCheckedChange={(checked) =>
                                    setData('push_enabled', checked as boolean)
                                }
                            />
                        </div>
                    </div>

                    <div className="space-y-4 rounded-lg border p-4">
                        <h2 className="text-lg font-semibold">
                            Notification Types
                        </h2>

                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label
                                    htmlFor="notify_reorder_alert"
                                    className="cursor-pointer"
                                >
                                    Reorder Alerts
                                </Label>
                                <p className="text-sm text-muted-foreground">
                                    Get notified when stock is low
                                </p>
                            </div>
                            <Checkbox
                                id="notify_reorder_alert"
                                checked={data.notify_reorder_alert}
                                onCheckedChange={(checked) =>
                                    setData(
                                        'notify_reorder_alert',
                                        checked as boolean,
                                    )
                                }
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label
                                    htmlFor="notify_approval_needed"
                                    className="cursor-pointer"
                                >
                                    Approval Requests
                                </Label>
                                <p className="text-sm text-muted-foreground">
                                    Get notified when approvals are needed
                                </p>
                            </div>
                            <Checkbox
                                id="notify_approval_needed"
                                checked={data.notify_approval_needed}
                                onCheckedChange={(checked) =>
                                    setData(
                                        'notify_approval_needed',
                                        checked as boolean,
                                    )
                                }
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label
                                    htmlFor="notify_request_update"
                                    className="cursor-pointer"
                                >
                                    Request Updates
                                </Label>
                                <p className="text-sm text-muted-foreground">
                                    Get notified when your requests are updated
                                </p>
                            </div>
                            <Checkbox
                                id="notify_request_update"
                                checked={data.notify_request_update}
                                onCheckedChange={(checked) =>
                                    setData(
                                        'notify_request_update',
                                        checked as boolean,
                                    )
                                }
                            />
                        </div>
                    </div>

                    <div className="space-y-4 rounded-lg border p-4">
                        <h2 className="text-lg font-semibold">Quiet Hours</h2>
                        <p className="text-sm text-muted-foreground">
                            Set a time range when you don&apos;t want to receive
                            notifications. Leave empty to receive notifications
                            24/7.
                        </p>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="grid gap-2">
                                <Label htmlFor="quiet_hours_start">
                                    Start Time
                                </Label>
                                <Input
                                    id="quiet_hours_start"
                                    type="time"
                                    value={data.quiet_hours_start}
                                    onChange={(e) =>
                                        setData(
                                            'quiet_hours_start',
                                            e.target.value,
                                        )
                                    }
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="quiet_hours_end">
                                    End Time
                                </Label>
                                <Input
                                    id="quiet_hours_end"
                                    type="time"
                                    value={data.quiet_hours_end}
                                    onChange={(e) =>
                                        setData(
                                            'quiet_hours_end',
                                            e.target.value,
                                        )
                                    }
                                />
                            </div>
                        </div>

                        {(errors.quiet_hours_start ||
                            errors.quiet_hours_end) && (
                            <p className="text-sm text-destructive">
                                {errors.quiet_hours_start ||
                                    errors.quiet_hours_end}
                            </p>
                        )}
                    </div>

                    <div className="flex items-center gap-4">
                        <Button disabled={processing} type="submit">
                            Save Settings
                        </Button>

                        {recentlySuccessful && (
                            <p className="text-sm text-muted-foreground">
                                Saved successfully
                            </p>
                        )}
                    </div>
                </form>
            </SettingsLayout>
        </AppLayout>
    );
}
