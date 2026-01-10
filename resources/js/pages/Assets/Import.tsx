import { Head } from '@inertiajs/react';

export default function AssetImport() {
    return (
        <>
            <Head title="Import Aset" />
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h1 className="text-2xl font-semibold text-gray-900">Import Aset BMN</h1>
                    <p className="mt-2 text-gray-600">
                        Upload file JSON dari SIMAN untuk mengimpor data aset.
                    </p>
                </div>
            </div>
        </>
    );
}
