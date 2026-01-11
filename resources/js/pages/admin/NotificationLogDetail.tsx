import { type BreadcrumbItem } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowLeft, Clock, CheckCircle2, XCircle, AlertCircle, FileText, User, Phone, Calendar } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import AppLayout from '@/layouts/app-layout';
import { show as showRoute } from '@/routes/admin.notification-logs';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Notification Logs',
        href: '/admin/notification-logs',
    },
    {
        title: 'Log Details',
        href: '#',
    },
];

interface User {
    id: number;
    name: string;
    email: string;
}

interface NotificationLog {
    id: string;
    user_id: string;
    event_type: string;
    phone: string;
    message: string;
    status: 'pending' | 'sent' | 'failed' | 'retrying';
    fonnte_response: object | null;
    error_message: string | null;
    retry_count: number;
    sent_at: string | null;
    created_at: string;
    user: User;
}

interface PageProps {
    log: NotificationLog;
}

const statusConfig = {
    pending: {
        label: 'Pending',
        icon: Clock,
        className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    },
    sent: {
        label: 'Sent',
        icon: CheckCircle2,
        className: 'bg-green-100 text-green-800 border-green-200',
    },
    failed: {
        label: 'Failed',
        icon: XCircle,
        className: 'bg-red-100 text-red-800 border-red-200',
    },
    retrying: {
        label: 'Retrying',
        icon: AlertCircle,
        className: 'bg-blue-100 text-blue-800 border-blue-200',
    },
};

const eventTypeLabels: Record<string, string> = {
    request_created: 'Request Created',
    approval_needed: 'Approval Needed',
    reorder_alert: 'Reorder Alert',
};

export default function NotificationLogDetail() {
    const { log } = usePage<PageProps>().props;

    const getStatusBadge = (status: NotificationLog['status']) => {
        const config = statusConfig[status];
        const Icon = config.icon;
        return (
            <Badge className={`gap-2 text-sm px-3 py-1 ${config.className}`} variant="outline">
                <Icon className="h-4 w-4" />
                {config.label}
            </Badge>
        );
    };

    const formatDate = (dateString: string | null) => {
        if (!dateString) return 'Not sent yet';
        return new Date(dateString).toLocaleString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
        });
    };

    const InfoRow = ({
        icon: Icon,
        label,
        value,
        valueClass = '',
    }: {
        icon: React.ElementType;
        label: string;
        value: React.ReactNode;
        valueClass?: string;
    }) => (
        <div className="flex items-start gap-3 py-2">
            <Icon className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div className="flex-1">
                <div className="text-sm text-muted-foreground">{label}</div>
                <div className={`font-medium ${valueClass}`}>{value}</div>
            </div>
        </div>
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Notification Log #${log.id}`} />

            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" asChild>
                        <Link href="/admin/notification-logs">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Logs
                        </Link>
                    </Button>
                </div>

                <div>
                    <h1 className="text-2xl font-bold">Notification Log Details</h1>
                    <p className="text-muted-foreground">
                        Log ID: <code className="text-xs">{log.id}</code>
                    </p>
                </div>

                {/* Status Badge */}
                <div className="flex justify-center">
                    {getStatusBadge(log.status)}
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Basic Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="h-5 w-5" />
                                Basic Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-1">
                                <InfoRow
                                    icon={Calendar}
                                    label="Created At"
                                    value={formatDate(log.created_at)}
                                />
                                <InfoRow
                                    icon={Clock}
                                    label="Sent At"
                                    value={formatDate(log.sent_at)}
                                />
                                <InfoRow
                                    icon={AlertCircle}
                                    label="Retry Count"
                                    value={`${log.retry_count} / 3 attempts`}
                                />
                                <Separator />
                                <InfoRow
                                    icon={FileText}
                                    label="Event Type"
                                    value={eventTypeLabels[log.event_type] || log.event_type}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Recipient Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="h-5 w-5" />
                                Recipient Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-1">
                                <InfoRow
                                    icon={User}
                                    label="Name"
                                    value={log.user?.name || 'N/A'}
                                />
                                <InfoRow
                                    icon={FileText}
                                    label="Email"
                                    value={log.user?.email || 'N/A'}
                                    valueClass="text-sm"
                                />
                                <InfoRow
                                    icon={Phone}
                                    label="Phone"
                                    value={<code className="text-sm">{log.phone}</code>}
                                />
                                <InfoRow
                                    icon={FileText}
                                    label="User ID"
                                    value={<code className="text-xs">{log.user_id}</code>}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Message */}
                <Card>
                    <CardHeader>
                        <CardTitle>Message Content</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-lg bg-muted p-4">
                            <pre className="whitespace-pre-wrap text-sm leading-relaxed">
                                {log.message}
                            </pre>
                        </div>
                    </CardContent>
                </Card>

                {/* API Response */}
                {log.fonnte_response && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Fonnte API Response</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="rounded-lg bg-muted p-4 overflow-x-auto">
                                <pre className="whitespace-pre-wrap text-xs font-mono">
                                    {JSON.stringify(log.fonnte_response, null, 2)}
                                </pre>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Error Message */}
                {log.error_message && (
                    <Card className="border-red-200">
                        <CardHeader>
                            <CardTitle className="text-red-900">Error Details</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="rounded-lg bg-red-50 border border-red-200 p-4">
                                <pre className="whitespace-pre-wrap text-sm text-red-900">
                                    {log.error_message}
                                </pre>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Additional Information for Failed/Retrying */}
                {(log.status === 'failed' || log.status === 'retrying') && (
                    <Card className="border-yellow-200 bg-yellow-50">
                        <CardHeader>
                            <CardTitle className="text-yellow-900">Troubleshooting</CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm text-yellow-900 space-y-2">
                            <p>
                                <strong>Retry Attempts:</strong> {log.retry_count} of 3
                            </p>
                            {log.status === 'failed' && (
                                <p>
                                    This notification has permanently failed after all retry attempts.
                                    Please check the error message above and consider:
                                </p>
                            )}
                            {log.status === 'retrying' && (
                                <p>
                                    This notification is still being retried. The system will automatically
                                    attempt to resend it. Check back later for updates.
                                </p>
                            )}
                            <ul className="list-disc pl-5 space-y-1 mt-2">
                                <li>Verify the recipient phone number is correct</li>
                                <li>Check if the Fonnte API token is valid</li>
                                <li>Ensure the recipient has WhatsApp enabled</li>
                                <li>Review Fonnte service status</li>
                            </ul>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}
