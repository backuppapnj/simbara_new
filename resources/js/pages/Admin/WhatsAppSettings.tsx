import { Head } from '@inertiajs/react'
import Layout from '@/layouts/Layout'

export default function WhatsAppSettings() {
    return (
        <>
            <Head title="WhatsApp Settings" />

            <Layout>
                <div className="space-y-6">
                    <h1 className="text-3xl font-bold">WhatsApp Settings</h1>

                    <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800">
                        <p className="text-gray-600 dark:text-gray-400">
                            WhatsApp settings configuration page.
                        </p>
                    </div>
                </div>
            </Layout>
        </>
    )
}
