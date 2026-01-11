import { Head } from '@inertiajs/react'
import AppLayout from '@/layouts/app-layout'
import { type BreadcrumbItem } from '@/types'

export default function WhatsAppSettings() {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Admin',
            href: '/admin/whatsapp-settings',
        },
        {
            title: 'WhatsApp Settings',
            href: '',
        },
    ]

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="WhatsApp Settings" />
            <div className="space-y-6">
                <h1 className="text-3xl font-bold">WhatsApp Settings</h1>

                <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800">
                    <p className="text-gray-600 dark:text-gray-400">
                        WhatsApp settings configuration page.
                    </p>
                </div>
            </div>
        </AppLayout>
    )
}
