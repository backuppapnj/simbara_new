import { update } from '@/actions/App/Http/Controllers/Admin/WhatsAppSettingsController';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { Loader2, MessageSquare, Save, Send } from 'lucide-react';
import { useState } from 'react';

interface WhatsAppSettingsProps {
    apiToken?: string | null;
    hasToken: boolean;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Admin',
        href: '/admin/whatsapp-settings',
    },
    {
        title: 'WhatsApp Settings',
        href: '',
    },
];

export default function WhatsAppSettings({
    apiToken,
    hasToken,
}: WhatsAppSettingsProps) {
    const [showTestForm, setShowTestForm] = useState(false);

    const settingsForm = useForm({
        api_token: '',
    });

    const testForm = useForm({
        phone: '',
        message: 'This is a test message from the asset management system.',
    });

    const handleSettingsSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        settingsForm.patch(update(), {
            onSuccess: () => {
                settingsForm.reset();
            },
        });
    };

    const handleTestSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        testForm.post(update().url.replace('/update', '/test-send'), {
            onSuccess: () => {
                setShowTestForm(false);
                testForm.reset();
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="WhatsApp Settings" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">WhatsApp Settings</h1>
                        <p className="text-muted-foreground">
                            Configure WhatsApp API settings for notifications
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <MessageSquare className="size-5 text-muted-foreground" />
                    </div>
                </div>

                {/* API Token Settings */}
                <div className="rounded-lg border bg-card p-6 shadow-sm">
                    <div className="mb-4">
                        <h2 className="text-xl font-semibold">Fonnte API Token</h2>
                        <p className="text-sm text-muted-foreground">
                            Configure your Fonnte API token for sending WhatsApp
                            messages
                        </p>
                    </div>

                    <form onSubmit={handleSettingsSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="api_token">API Token</Label>
                            <Input
                                id="api_token"
                                name="api_token"
                                type="password"
                                placeholder={hasToken ? 'Update token (leave empty to keep current)' : 'Enter your Fonnte API token'}
                                value={settingsForm.data.api_token}
                                onChange={(e) =>
                                    settingsForm.setData(
                                        'api_token',
                                        e.target.value,
                                    )
                                }
                                data-test="api-token-input"
                            />
                            {settingsForm.errors.api_token && (
                                <p className="text-sm text-destructive">
                                    {settingsForm.errors.api_token}
                                </p>
                            )}
                            {hasToken && (
                                <p className="text-sm text-muted-foreground">
                                    Current token: {apiToken}
                                </p>
                            )}
                        </div>

                        <div className="flex gap-2">
                            <Button
                                type="submit"
                                disabled={settingsForm.processing}
                                data-test="save-whatsapp-button"
                            >
                                {settingsForm.processing ? (
                                    <>
                                        <Loader2 className="mr-2 size-4 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save className="mr-2 size-4" />
                                        Save Token
                                    </>
                                )}
                            </Button>
                            {hasToken && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setShowTestForm(!showTestForm)}
                                    data-test="test-whatsapp-button"
                                >
                                    <Send className="mr-2 size-4" />
                                    Test Send
                                </Button>
                            )}
                        </div>
                    </form>
                </div>

                {/* Test Send Form */}
                {showTestForm && (
                    <div className="rounded-lg border bg-card p-6 shadow-sm">
                        <div className="mb-4">
                            <h2 className="text-xl font-semibold">
                                Test WhatsApp Message
                            </h2>
                            <p className="text-sm text-muted-foreground">
                                Send a test message to verify your API token is
                                working
                            </p>
                        </div>

                        <form onSubmit={handleTestSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="test_phone">
                                    Phone Number
                                </Label>
                                <Input
                                    id="test_phone"
                                    name="phone"
                                    type="tel"
                                    placeholder="e.g., 628123456789"
                                    value={testForm.data.phone}
                                    onChange={(e) =>
                                        testForm.setData('phone', e.target.value)
                                    }
                                />
                                {testForm.errors.phone && (
                                    <p className="text-sm text-destructive">
                                        {testForm.errors.phone}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="test_message">Message</Label>
                                <textarea
                                    id="test_message"
                                    name="message"
                                    rows={3}
                                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    placeholder="Enter test message"
                                    value={testForm.data.message}
                                    onChange={(e) =>
                                        testForm.setData(
                                            'message',
                                            e.target.value,
                                        )
                                    }
                                />
                                {testForm.errors.message && (
                                    <p className="text-sm text-destructive">
                                        {testForm.errors.message}
                                    </p>
                                )}
                            </div>

                            <div className="flex gap-2">
                                <Button
                                    type="submit"
                                    disabled={testForm.processing}
                                >
                                    {testForm.processing ? (
                                        <>
                                            <Loader2 className="mr-2 size-4 animate-spin" />
                                            Sending...
                                        </>
                                    ) : (
                                        <>
                                            <Send className="mr-2 size-4" />
                                            Send Test Message
                                        </>
                                    )}
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        setShowTestForm(false);
                                        testForm.reset();
                                    }}
                                >
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Help Section */}
                <div className="rounded-lg border bg-card p-6 shadow-sm">
                    <h3 className="mb-2 font-semibold">
                        Getting Fonnte API Token
                    </h3>
                    <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                        <li>
                            Visit{' '}
                            <a
                                href="https://fonnte.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary underline"
                            >
                                fonnte.com
                            </a>
                        </li>
                        <li>Sign up or log in to your account</li>
                        <li>Navigate to the API section</li>
                        <li>Copy your API token</li>
                        <li>Paste it in the field above</li>
                    </ol>
                </div>
            </div>
        </AppLayout>
    );
}
