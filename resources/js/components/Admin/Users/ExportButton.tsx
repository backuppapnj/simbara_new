import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { FileSpreadsheet, FileText, Download } from 'lucide-react';
import { useState } from 'react';
import { router } from '@inertiajs/react';

interface ExportButtonProps {
    filters: {
        search?: string;
        role?: string;
        is_active?: string | null;
        department?: string;
        sort_by?: string;
        sort_direction?: string;
    };
}

export function ExportButton({ filters }: ExportButtonProps) {
    const [isExporting, setIsExporting] = useState(false);

    const handleExport = (format: 'csv' | 'xlsx') => {
        setIsExporting(true);

        // Build query string from current filters
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                params.append(key, String(value));
            }
        });
        params.append('format', format);

        // Open export URL in new tab to download file
        const exportUrl = `/admin/users/export?${params.toString()}`;
        window.open(exportUrl, '_blank');

        // Reset loading state after a short delay
        setTimeout(() => setIsExporting(false), 1000);
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" disabled={isExporting}>
                    <Download className="mr-2 h-4 w-4" />
                    {isExporting ? 'Exporting...' : 'Export'}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleExport('csv')}>
                    <FileText className="mr-2 h-4 w-4" />
                    Export as CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('xlsx')}>
                    <FileSpreadsheet className="mr-2 h-4 w-4" />
                    Export as Excel
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
