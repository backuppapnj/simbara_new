import { type BreadcrumbItem } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { Search, Filter, FileText, Clock, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import AppLayout from '@/layouts/app-layout';
import { index as indexRoute } from '@/routes/admin.notification-logs';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Notification Logs',
        href: '/admin/notification-logs',
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

interface Link {
    label: string;
    url: string | null;
    active: boolean;
}

interface PaginatedLogs {
    data: NotificationLog[];
    links: Link[];
    meta: {
        current_page: number;
        from: number | null;
        last_page: number;
        per_page: number;
        to: number | null;
        total: number;
    };
}

interface PageProps {
    logs: PaginatedLogs;
    filters: {
        status?: string;
        event_type?: string;
        user_id?: string;
        date_from?: string;
        date_to?: string;
    };
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

export default function NotificationLogs() {
    const { logs, filters } = usePage<PageProps>().props;
    const [selectedLog, setSelectedLog] = useState<NotificationLog | null>(null);
    const [showFilters, setShowFilters] = useState(false);

    const getStatusBadge = (status: NotificationLog['status']) => {
        const config = statusConfig[status];
        const Icon = config.icon;
        return (
            <Badge className={`gap-1 ${config.className}`} variant="outline">
                <Icon className="h-3 w-3" />
                {config.label}
            </Badge>
        );
    };

    const formatDate = (dateString: string | null) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const truncateMessage = (message: string, maxLength = 50) => {
        if (message.length <= maxLength) return message;
        return message.substring(0, maxLength) + '...';
    };

    const applyFilters = () => {
        const params = new URLSearchParams();
        if (filters.status) params.append('status', filters.status);
        if (filters.event_type) params.append('event_type', filters.event_type);
        if (filters.user_id) params.append('user_id', filters.user_id);
        if (filters.date_from) params.append('date_from', filters.date_from);
        if (filters.date_to) params.append('date_to', filters.date_to);

        window.location.href = `/admin/notification-logs${params.toString() ? '?' + params.toString() : ''}`;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Notification Logs" />

            <div className="space-y-6 p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Notification Logs</h1>
                        <p className="text-muted-foreground">
                            View and monitor WhatsApp notification delivery history.
                        </p>
                    </div>

                    <Button
                        variant="outline"
                        onClick={() => setShowFilters(!showFilters)}
                        className="gap-2"
                    >
                        <Filter className="h-4 w-4" />
                        Filters
                    </Button>
                </div>

                {/* Filters */}
                {showFilters && (
                    <div className="rounded-lg border p-4">
                        <h3 className="mb-4 font-semibold">Filter Logs</h3>
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                applyFilters();
                            }}
                            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
                        >
                            <div>
                                <Label htmlFor="status">Status</Label>
                                <select
                                    id="status"
                                    defaultValue={filters.status}
                                    name="status"
                                    className="mt-2 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                >
                                    <option value="">All Statuses</option>
                                    <option value="pending">Pending</option>
                                    <option value="sent">Sent</option>
                                    <option value="failed">Failed</option>
                                    <option value="retrying">Retrying</option>
                                </select>
                            </div>

                            <div>
                                <Label htmlFor="event_type">Event Type</Label>
                                <select
                                    id="event_type"
                                    defaultValue={filters.event_type}
                                    name="event_type"
                                    className="mt-2 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                >
                                    <option value="">All Events</option>
                                    <option value="request_created">Request Created</option>
                                    <option value="approval_needed">Approval Needed</option>
                                    <option value="reorder_alert">Reorder Alert</option>
                                </select>
                            </div>

                            <div>
                                <Label htmlFor="user_id">User ID</Label>
                                <Input
                                    id="user_id"
                                    name="user_id"
                                    defaultValue={filters.user_id}
                                    placeholder="Enter user ID"
                                    className="mt-2"
                                />
                            </div>

                            <div>
                                <Label htmlFor="date_from">From Date</Label>
                                <Input
                                    id="date_from"
                                    type="date"
                                    name="date_from"
                                    defaultValue={filters.date_from}
                                    className="mt-2"
                                />
                            </div>

                            <div>
                                <Label htmlFor="date_to">To Date</Label>
                                <Input
                                    id="date_to"
                                    type="date"
                                    name="date_to"
                                    defaultValue={filters.date_to}
                                    className="mt-2"
                                />
                            </div>

                            <div className="flex items-end gap-2">
                                <Button type="submit" className="gap-2">
                                    <Search className="h-4 w-4" />
                                    Apply Filters
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => (window.location.href = '/admin/notification-logs')}
                                >
                                    Clear
                                </Button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Summary Stats */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-lg border p-4">
                        <div className="text-sm text-muted-foreground">Total Logs</div>
                        <div className="text-2xl font-bold">{logs.meta.total}</div>
                    </div>
                    <div className="rounded-lg border p-4">
                        <div className="text-sm text-muted-foreground">Sent</div>
                        <div className="text-2xl font-bold text-green-600">
                            {logs.data.filter((l) => l.status === 'sent').length}
                        </div>
                    </div>
                    <div className="rounded-lg border p-4">
                        <div className="text-sm text-muted-foreground">Failed</div>
                        <div className="text-2xl font-bold text-red-600">
                            {logs.data.filter((l) => l.status === 'failed').length}
                        </div>
                    </div>
                    <div className="rounded-lg border p-4">
                        <div className="text-sm text-muted-foreground">Pending</div>
                        <div className="text-2xl font-bold text-yellow-600">
                            {logs.data.filter((l) => l.status === 'pending').length}
                        </div>
                    </div>
                </div>

                {/* Logs Table */}
                <div className="overflow-hidden rounded-lg border">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-muted">
                                <tr>
                                    <th className="px-4 py-3 text-left font-medium">Status</th>
                                    <th className="px-4 py-3 text-left font-medium">Event</th>
                                    <th className="px-4 py-3 text-left font-medium">Recipient</th>
                                    <th className="px-4 py-3 text-left font-medium hidden md:table-cell">Phone</th>
                                    <th className="px-4 py-3 text-left font-medium hidden lg:table-cell">Message</th>
                                    <th className="px-4 py-3 text-left font-medium">Created</th>
                                    <th className="px-4 py-3 text-left font-medium">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {logs.data.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={7}
                                            className="px-4 py-8 text-center text-muted-foreground"
                                        >
                                            No notification logs found.
                                        </td>
                                    </tr>
                                ) : (
                                    logs.data.map((log) => (
                                        <tr key={log.id} className="hover:bg-muted/50">
                                            <td className="px-4 py-3">
                                                {getStatusBadge(log.status)}
                                            </td>
                                            <td className="px-4 py-3">
                                                {eventTypeLabels[log.event_type] || log.event_type}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div>
                                                    <div className="font-medium">{log.user?.name || 'N/A'}</div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {log.user?.email || ''}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 hidden md:table-cell">
                                                <code className="text-xs">{log.phone}</code>
                                            </td>
                                            <td className="px-4 py-3 max-w-xs truncate hidden lg:table-cell">
                                                {truncateMessage(log.message)}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                {formatDate(log.created_at)}
                                            </td>
                                            <td className="px-4 py-3">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => setSelectedLog(log)}
                                                    className="gap-1"
                                                >
                                                    <FileText className="h-4 w-4" />
                                                    <span className="hidden sm:inline">View</span>
                                                </Button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {logs.meta.last_page > 1 && (
                        <div className="flex items-center justify-between border-t px-4 py-3">
                            <div className="text-sm text-muted-foreground">
                                Showing {logs.meta.from || 0} to {logs.meta.to || 0} of{' '}
                                {logs.meta.total} results
                            </div>
                            <div className="flex gap-1">
                                {logs.links.map((link, index) => (
                                    <Button
                                        key={index}
                                        variant={link.active ? 'default' : 'outline'}
                                        size="sm"
                                        asChild
                                        disabled={!link.url}
                                    >
                                        <Link
                                            href={link.url || '#'}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    </Button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Log Detail Modal */}
            <Dialog
                open={!!selectedLog}
                onOpenChange={() => setSelectedLog(null)}
            >
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Notification Log Details</DialogTitle>
                        <DialogDescription>
                            View detailed information about this notification.
                        </DialogDescription>
                    </DialogHeader>

                    {selectedLog && (
                        <div className="space-y-4">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                    <Label className="text-muted-foreground">Status</Label>
                                    <div className="mt-1">
                                        {getStatusBadge(selectedLog.status)}
                                    </div>
                                </div>

                                <div>
                                    <Label className="text-muted-foreground">Event Type</Label>
                                    <div className="mt-1 font-medium">
                                        {eventTypeLabels[selectedLog.event_type] || selectedLog.event_type}
                                    </div>
                                </div>

                                <div>
                                    <Label className="text-muted-foreground">Recipient</Label>
                                    <div className="mt-1">
                                        <div className="font-medium">{selectedLog.user?.name || 'N/A'}</div>
                                        <div className="text-sm text-muted-foreground">
                                            {selectedLog.user?.email || ''}
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <Label className="text-muted-foreground">Phone</Label>
                                    <div className="mt-1">
                                        <code className="text-sm">{selectedLog.phone}</code>
                                    </div>
                                </div>

                                <div>
                                    <Label className="text-muted-foreground">Retry Count</Label>
                                    <div className="mt-1 font-medium">{selectedLog.retry_count} / 3</div>
                                </div>

                                <div>
                                    <Label className="text-muted-foreground">Sent At</Label>
                                    <div className="mt-1 font-medium">
                                        {formatDate(selectedLog.sent_at)}
                                    </div>
                                </div>

                                <div className="sm:col-span-2">
                                    <Label className="text-muted-foreground">Created At</Label>
                                    <div className="mt-1 font-medium">
                                        {formatDate(selectedLog.created_at)}
                                    </div>
                                </div>
                            </div>

                            <div>
                                <Label className="text-muted-foreground">Message</Label>
                                <div className="mt-1 rounded-lg bg-muted p-3">
                                    <pre className="whitespace-pre-wrap text-xs">
                                        {selectedLog.message}
                                    </pre>
                                </div>
                            </div>

                            {selectedLog.fonnte_response && (
                                <div>
                                    <Label className="text-muted-foreground">API Response</Label>
                                    <div className="mt-1 rounded-lg bg-muted p-3">
                                        <pre className="whitespace-pre-wrap text-xs overflow-x-auto">
                                            {JSON.stringify(selectedLog.fonnte_response, null, 2)}
                                        </pre>
                                    </div>
                                </div>
                            )}

                            {selectedLog.error_message && (
                                <div>
                                    <Label className="text-muted-foreground">Error Message</Label>
                                    <div className="mt-1 rounded-lg bg-red-50 border border-red-200 p-3 text-red-900">
                                        <pre className="whitespace-pre-wrap text-xs">
                                            {selectedLog.error_message}
                                        </pre>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
