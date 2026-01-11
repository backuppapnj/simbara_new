import { Head } from '@inertiajs/react'
import AppLayout from '@/layouts/app-layout'
import { Link } from '@inertiajs/react'
import { type BreadcrumbItem } from '@/types'

interface NotificationLog {
    id: number
    event_type: string
    status: string
    recipient: string
    subject: string
    body: string
    created_at: string
    updated_at: string
    user: {
        id: number
        name: string
    } | null
}

interface Props {
    log: NotificationLog
}

export default function NotificationLogDetail({ log }: Props) {
    const getBadgeColor = (status: string) => {
        switch (status) {
            case 'sent':
                return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
            case 'failed':
                return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
            case 'pending':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
        }
    }

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Admin',
            href: '/admin/notification-logs',
        },
        {
            title: 'Notification Log Detail',
            href: '',
        },
    ]

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Notification Log #${log.id}`} />
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h1 className="text-3xl font-bold">Notification Log Detail</h1>
                        <Link
                            href={route('admin.notification-logs.index')}
                            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800"
                        >
                            Back to Logs
                        </Link>
                    </div>

                    <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800">
                        <dl className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                            <div>
                                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">ID</dt>
                                <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">{log.id}</dd>
                            </div>

                            <div>
                                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</dt>
                                <dd className="mt-1">
                                    <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getBadgeColor(log.status)}`}>
                                        {log.status}
                                    </span>
                                </dd>
                            </div>

                            <div>
                                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Event Type</dt>
                                <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">{log.event_type}</dd>
                            </div>

                            <div>
                                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Recipient</dt>
                                <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">{log.recipient}</dd>
                            </div>

                            <div>
                                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">User</dt>
                                <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                                    {log.user?.name || '-'}
                                </dd>
                            </div>

                            <div>
                                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Created At</dt>
                                <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                                    {new Date(log.created_at).toLocaleString()}
                                </dd>
                            </div>

                            <div className="sm:col-span-2">
                                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Subject</dt>
                                <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">{log.subject || '-'}</dd>
                            </div>

                            <div className="sm:col-span-2">
                                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Body</dt>
                                <dd className="mt-1 whitespace-pre-wrap text-sm text-gray-900 dark:text-gray-100">
                                    {log.body || '-'}
                                </dd>
                            </div>
                        </dl>
                    </div>
                </div>
        </AppLayout>
    )
}
