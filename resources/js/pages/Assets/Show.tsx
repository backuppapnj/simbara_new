import { AssetPhotoGallery } from '@/components/assets/AssetPhotoGallery';
import { AssetPhotoUpload } from '@/components/assets/AssetPhotoUpload';
import { Head } from '@inertiajs/react';
import { usePageProps } from '@/hooks/use-page-props';
import { useState } from 'react';
import { PageProps } from '@/types';

interface Asset {
    id: string;
    nama: string;
    kd_brg: string | null;
    merk: string | null;
    ur_kondisi: string | null;
    kd_kondisi: string | null;
    rph_aset: number | null;
    lokasi_ruang: string | null;
    photos: Array<{
        id: string;
        file_path: string;
        file_name: string;
        caption: string | null;
        is_primary: boolean;
    }>;
}

interface PagePropsType extends PageProps {
    asset: Asset;
}

export default function AssetShow() {
    const { asset } = usePageProps<PagePropsType>();
    const [showUpload, setShowUpload] = useState(false);
    const [uploadKey, setUploadKey] = useState(0);

    const handleUploadSuccess = () => {
        setShowUpload(false);
        setUploadKey((prev) => prev + 1);
        // Reload the page to show updated photos
        window.location.reload();
    };

    const formatCurrency = (amount: number | null) => {
        if (!amount) return '-';
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
        }).format(amount);
    };

    return (
        <>
            <Head title={`Detail Aset - ${asset.nama}`} />

            <div className="min-h-screen bg-gray-50 py-8">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900">
                            {asset.nama}
                        </h1>
                        <p className="mt-2 text-sm text-gray-600">
                            Kode Barang: {asset.kd_brg || '-'}
                        </p>
                    </div>

                    {/* Main Content Grid */}
                    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                        {/* Left Column: Asset Info */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Basic Info Card */}
                            <div className="rounded-lg bg-white p-6 shadow-sm">
                                <h2 className="mb-4 text-lg font-semibold text-gray-900">
                                    Informasi Aset
                                </h2>
                                <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">
                                            Nama Aset
                                        </dt>
                                        <dd className="mt-1 text-sm text-gray-900">
                                            {asset.nama}
                                        </dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">
                                            Merk/Tipe
                                        </dt>
                                        <dd className="mt-1 text-sm text-gray-900">
                                            {asset.merk || '-'}
                                        </dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">
                                            Kondisi
                                        </dt>
                                        <dd className="mt-1">
                                            <span
                                                className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                                                    asset.kd_kondisi === '1'
                                                        ? 'bg-green-100 text-green-800'
                                                        : asset.kd_kondisi === '2'
                                                          ? 'bg-yellow-100 text-yellow-800'
                                                          : 'bg-red-100 text-red-800'
                                                }`}
                                            >
                                                {asset.ur_kondisi || '-'}
                                            </span>
                                        </dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">
                                            Nilai Aset
                                        </dt>
                                        <dd className="mt-1 text-sm text-gray-900">
                                            {formatCurrency(asset.rph_aset)}
                                        </dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">
                                            Lokasi
                                        </dt>
                                        <dd className="mt-1 text-sm text-gray-900">
                                            {asset.lokasi_ruang || '-'}
                                        </dd>
                                    </div>
                                </dl>
                            </div>

                            {/* Photos Section */}
                            <div className="rounded-lg bg-white p-6 shadow-sm">
                                <div className="mb-4 flex items-center justify-between">
                                    <h2 className="text-lg font-semibold text-gray-900">
                                        Foto Aset
                                    </h2>
                                    {!showUpload && (
                                        <button
                                            onClick={() => setShowUpload(true)}
                                            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                                        >
                                            + Tambah Foto
                                        </button>
                                    )}
                                </div>

                                {showUpload ? (
                                    <div className="space-y-4">
                                        <AssetPhotoUpload
                                            key={uploadKey}
                                            assetId={asset.id}
                                            onUploadSuccess={handleUploadSuccess}
                                        />
                                        <button
                                            onClick={() => setShowUpload(false)}
                                            className="text-sm text-gray-600 hover:text-gray-900"
                                        >
                                            Batal
                                        </button>
                                    </div>
                                ) : (
                                    <AssetPhotoGallery
                                        assetId={asset.id}
                                        photos={asset.photos}
                                    />
                                )}
                            </div>
                        </div>

                        {/* Right Column: Actions */}
                        <div className="space-y-6">
                            <div className="rounded-lg bg-white p-6 shadow-sm">
                                <h3 className="mb-4 text-lg font-semibold text-gray-900">
                                    Aksi
                                </h3>
                                <div className="space-y-3">
                                    <button className="w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                                        Update Lokasi
                                    </button>
                                    <button className="w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                                        Update Kondisi
                                    </button>
                                    <button className="w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                                        Input Perawatan
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
