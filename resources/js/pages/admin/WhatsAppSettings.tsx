import { type BreadcrumbItem } from '@/types';
import { Form, Head, useForm, usePage } from '@inertiajs/react';
import { FormEvent, useState } from 'react';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { update, testSend as testSendAction } from '@/routes/admin.whatsapp-settings';
import { CheckCircle2, AlertCircle, Send } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'WhatsApp Settings',
        href: '/admin/whatsapp-settings',
    },
];

interface PageProps {
    apiToken: string | null;
    hasToken: boolean;
}

export default function WhatsAppSettings() {
    const { apiToken, hasToken } = usePage<PageProps>().props;
    const [showTokenInput, setShowTokenInput] = useState(!hasToken);
    const [showTestResult, setShowTestResult] = useState<{
        type: 'success' | 'error';
        message: string;
    } | null>(null);

    const {
        data,
        setData,
        post,
        processing,
        errors,
        recentlySuccessful,
        clearErrors,
    } = useForm({
        api_token: '',
    });

    const {
        data: testData,
        setData: setTestData,
        post: postTest,
        processing: testProcessing,
        errors: testErrors,
    } = useForm({
        phone: '',
        message: 'This is a test message from the Asset Management System.',
    });

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        clearErrors();
        post(update(), {
            preserveScroll: true,
            onSuccess: () => {
                setShowTokenInput(false);
            },
        });
    };

    const handleTestSend = (e: FormEvent) => {
        e.preventDefault();
        setShowTestResult(null);
        postTest(testSendAction(), {
            preserveScroll: true,
            onSuccess: (page) => {
                const flash = page.props.flash as { success?: string; error?: string } | undefined;
                if (flash?.success) {
                    setShowTestResult({ type: 'success', message: flash.success });
                    setTestData('phone', '');
                } else if (flash?.error) {
                    setShowTestResult({ type: 'error', message: flash.error });
                }
            },
        });
    };

    const maskToken = (token: string | null): string => {
        if (!token) return 'Not configured';
        return token;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="WhatsApp Settings" />

            <div className="space-y-6 p-6">
                <div>
                    <h1 className="text-2xl font-bold">WhatsApp Settings</h1>
                    <p className="text-muted-foreground">
                        Configure your Fonnte API integration for WhatsApp notifications.
                    </p>
                </div>

                {/* API Token Section */}
                <div className="rounded-lg border p-6">
                    <h2 className="mb-4 text-lg font-semibold">API Configuration</h2>

                    {!showTokenInput && hasToken ? (
                        <div className="space-y-4">
                            <div>
                                <Label>Current API Token</Label>
                                <div className="mt-1 flex items-center gap-2">
                                    <code className="rounded bg-muted px-3 py-2 text-sm">
                                        {maskToken(apiToken)}
                                    </code>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setShowTokenInput(true)}
                                    >
                                        Update
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <Form {...update().form()} onSubmit={handleSubmit} className="space-y-4">
                            {({ errors: formErrors }) => (
                                <>
                                    <div>
                                        <Label htmlFor="api_token">Fonnte API Token</Label>
                                        <Input
                                            id="api_token"
                                            type="password"
                                            value={data.api_token}
                                            onChange={(e) => setData('api_token', e.target.value)}
                                            placeholder="Enter your Fonnte API token"
                                            className="mt-2"
                                        />
                                        {errors.api_token && (
                                            <p className="mt-1 text-sm text-destructive">
                                                {errors.api_token}
                                            </p>
                                        )}
                                    </div>

                                    <div className="flex gap-2">
                                        <Button type="submit" disabled={processing}>
                                            {processing ? 'Saving...' : hasToken ? 'Update Token' : 'Save Token'}
                                        </Button>
                                        {hasToken && (
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => {
                                                    setShowTokenInput(false);
                                                    clearErrors();
                                                }}
                                            >
                                                Cancel
                                            </Button>
                                        )}
                                    </div>

                                    {recentlySuccessful && (
                                        <Alert className="border-green-500 bg-green-50 text-green-900">
                                            <CheckCircle2 className="h-4 w-4" />
                                            <AlertDescription>
                                                API token saved successfully.
                                            </AlertDescription>
                                        </Alert>
                                    )}
                                </>
                            )}
                        </Form>
                    )}
                </div>

                {/* Test Send Section */}
                {hasToken && (
                    <div className="rounded-lg border p-6">
                        <h2 className="mb-4 text-lg font-semibold">Test Message</h2>
                        <p className="mb-4 text-sm text-muted-foreground">
                            Send a test WhatsApp message to verify your API configuration.
                        </p>

                        <form onSubmit={handleTestSend} className="space-y-4">
                            <div>
                                <Label htmlFor="phone">Phone Number</Label>
                                <Input
                                    id="phone"
                                    type="tel"
                                    value={testData.phone}
                                    onChange={(e) => setTestData('phone', e.target.value)}
                                    placeholder="+6281234567890 or 08123456789"
                                    className="mt-2"
                                />
                                {testErrors.phone && (
                                    <p className="mt-1 text-sm text-destructive">
                                        {testErrors.phone}
                                    </p>
                                )}
                            </div>

                            <div>
                                <Label htmlFor="message">Message</Label>
                                <textarea
                                    id="message"
                                    value={testData.message}
                                    onChange={(e) => setTestData('message', e.target.value)}
                                    rows={4}
                                    className="mt-2 flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    placeholder="Enter test message"
                                />
                                {testErrors.message && (
                                    <p className="mt-1 text-sm text-destructive">
                                        {testErrors.message}
                                    </p>
                                )}
                            </div>

                            <Button type="submit" disabled={testProcessing}>
                                <Send className="mr-2 h-4 w-4" />
                                {testProcessing ? 'Sending...' : 'Send Test Message'}
                            </Button>
                        </form>

                        {showTestResult && (
                            <Alert
                                variant={showTestResult.type === 'success' ? 'default' : 'destructive'}
                                className={
                                    showTestResult.type === 'success'
                                        ? 'mt-4 border-green-500 bg-green-50 text-green-900'
                                        : 'mt-4'
                                }
                            >
                                {showTestResult.type === 'success' ? (
                                    <CheckCircle2 className="h-4 w-4" />
                                ) : (
                                    <AlertCircle className="h-4 w-4" />
                                )}
                                <AlertDescription>{showTestResult.message}</AlertDescription>
                            </Alert>
                        )}
                    </div>
                )}

                {/* Help Section */}
                <div className="rounded-lg border p-6 bg-muted/50">
                    <h3 className="mb-2 font-semibold">Getting Your Fonnte API Token</h3>
                    <ol className="list-inside list-decimal space-y-1 text-sm text-muted-foreground">
                        <li>Visit <a href="https://fonnte.com" target="_blank" rel="noopener noreferrer" className="text-primary underline">fonnte.com</a> and create an account</li>
                        <li>Navigate to the dashboard and copy your API token</li>
                        <li>Paste the token above and save</li>
                        <li>Send a test message to verify the configuration</li>
                    </ol>
                </div>
            </div>
        </AppLayout>
    );
}
