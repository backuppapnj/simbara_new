'use client';

import { Button } from '@/components/ui/button';
import { BarcodeScanner } from '@/components/scanner/barcode-scanner';
import { cn } from '@/lib/utils';
import { Scan, X } from 'lucide-react';
import { useState } from 'react';

interface ScannerInputProps {
    value?: string;
    onChange?: (value: string) => void;
    onScanSuccess?: (code: string) => void;
    placeholder?: string;
    className?: string;
    disabled?: boolean;
    label?: string;
    scanLabel?: string;
    helpText?: string;
}

export function ScannerInput({
    value = '',
    onChange,
    onScanSuccess,
    placeholder = 'Scan barcode atau ketik kode barang...',
    className,
    disabled = false,
    label,
    scanLabel = 'Scan',
    helpText,
}: ScannerInputProps) {
    const [showScanner, setShowScanner] = useState(false);

    const handleScanSuccess = (code: string) => {
        if (onChange) {
            onChange(code);
        }
        if (onScanSuccess) {
            onScanSuccess(code);
        }
    };

    const handleClear = () => {
        if (onChange) {
            onChange('');
        }
    };

    return (
        <div className={cn('space-y-2', className)}>
            {label && (
                <label className="text-sm font-medium">
                    {label}
                </label>
            )}

            <div className="flex gap-2">
                {/* Input Field */}
                <div className="relative flex-1">
                    <input
                        type="text"
                        value={value}
                        onChange={(e) => onChange?.(e.target.value)}
                        placeholder={placeholder}
                        disabled={disabled}
                        className="w-full rounded-md border bg-background px-3 py-2 pr-8 text-sm disabled:cursor-not-allowed disabled:opacity-50"
                    />

                    {/* Clear Button */}
                    {value && !disabled && (
                        <button
                            type="button"
                            onClick={handleClear}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 disabled:cursor-not-allowed disabled:opacity-50"
                            disabled={disabled}
                        >
                            <X className="h-4 w-4" />
                        </button>
                    )}
                </div>

                {/* Scan Button */}
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowScanner(true)}
                    disabled={disabled}
                    className="shrink-0"
                >
                    <Scan className="mr-2 h-4 w-4" />
                    {scanLabel}
                </Button>
            </div>

            {helpText && (
                <p className="text-xs text-muted-foreground">
                    {helpText}
                </p>
            )}

            {/* Scanner Modal */}
            {showScanner && (
                <div className="fixed inset-0 z-50 flex h-screen w-screen items-center justify-center bg-black">
                    <BarcodeScanner
                        onScanSuccess={(code) => {
                            handleScanSuccess(code);
                            setShowScanner(false);
                        }}
                        onClose={() => setShowScanner(false)}
                        className="h-full w-full"
                    />
                </div>
            )}
        </div>
    );
}
