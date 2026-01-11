import { Link, Head } from '@inertiajs/react'
import { useState } from 'react'
import Layout from '@/layouts/Layout'

interface NotificationLog {
    id: number
    event_type: string
    status: string
    recipient: string
    created_at: string
    user: {
        id: number
        name: string
    } | null
}

interface PaginationLinks {
    first: string | null
    last: string | null
    prev: string | null
    next: string | null
}

interface Meta {
    current_page: number
    from: number | null
    last_page: number
    links: { url: string | null; label: string; active: boolean }[]
    path: string
    per_page: number
    to: number | null
    total: number
}

interface Props {
    logs: {
        data: NotificationLog[]
        links: PaginationLinks
        meta: Meta
    }
    filters: {
        status?: string
        event_type?: string
        user_id?: string
        date_from?: string
        date_to?: string
    }
}

export default function NotificationLogs({ logs, filters }: Props) {
    const [currentFilters, setCurrentFilters] = useState(filters)

    const handleFilterChange = (key: string, value: string) => {
        setCurrentFilters({ ...currentFilters, [key]: value })
    }

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

    return (
        <>
            <Head title="Notification Logs" />

            <Layout>
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h1 className="text-3xl font-bold">Notification Logs</h1>
                    </div>

                    <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800">
                        <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-5">
                            <input
                                type="text"
                                placeholder="Status"
                                value={currentFilters.status || ''}
                                onChange={(e) => handleFilterChange('status', e.target.value)}
                                className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
                            />
                            <input
                                type="text"
                                placeholder="Event Type"
                                value={currentFilters.event_type || ''}
                                onChange={(e) => handleFilterChange('event_type', e.target.value)}
                                className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
                            />
                            <input
                                type="date"
                                value={currentFilters.date_from || ''}
                                onChange={(e) => handleFilterChange('date_from', e.target.value)}
                                className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
                            />
                            <input
                                type="date"
                                value={currentFilters.date_to || ''}
                                onChange={(e) => handleFilterChange('date_to', e.target.value)}
                                className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
                            />
                            <Link
                                href={route('admin.notification-logs.index')}
                                className="flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800"
                            >
                                Clear Filters
                            </Link>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-gray-900">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                            ID
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                            Event Type
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                            Recipient
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                            User
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                            Created At
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
                                    {logs.data.map((log) => (
                                        <tr key={log.id}>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                                                {log.id}
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                                                {log.event_type}
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4">
                                                <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getBadgeColor(log.status)}`}>
                                                    {log.status}
                                                </span>
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                                                {log.recipient}
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                                                {log.user?.name || '-'}
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                                                {new Date(log.created_at).toLocaleString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {logs.meta.last_page > 1 && (
                            <div className="mt-4 flex items-center justify-between">
                                <div className="text-sm text-gray-700 dark:text-gray-300">
                                    Showing {logs.meta.from} to {logs.meta.to} of {logs.meta.total} results
                                </div>
                                <div className="flex gap-2">
                                    {logs.meta.links.map((link, index) => (
                                        <Link
                                            key={index}
                                            href={link.url || '#'}
                                            className={`rounded px-3 py-1 text-sm ${
                                                link.active
                                                    ? 'bg-blue-600 text-white'
                                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                                            }`}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </Layout>
        </>
    )
}
