import * as React from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from '@/components/ui/pagination';
import { Skeleton } from '@/components/ui/skeleton';
import {
    ChevronDown,
    ChevronUp,
    ChevronsUpDown,
    Download,
    Search,
    X,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Column<T> {
    id: string;
    header: string;
    accessor: keyof T | ((row: T) => React.ReactNode);
    cell?: (row: T) => React.ReactNode;
    sortable?: boolean;
    filterable?: boolean;
    className?: string;
}

export interface DataTableProps<T> {
    data: T[];
    columns: Column<T>[];
    isLoading?: boolean;
    searchable?: boolean;
    exportable?: boolean;
    pagination?: boolean;
    pageSize?: number;
    pageSizeOptions?: number[];
    emptyMessage?: string;
    onExport?: () => void;
    onRowClick?: (row: T) => void;
    className?: string;
}

type SortDirection = 'asc' | 'desc' | null;

export function DataTable<T extends Record<string, any>>({
    data,
    columns,
    isLoading = false,
    searchable = true,
    exportable = false,
    pagination = true,
    pageSize = 10,
    pageSizeOptions = [10, 25, 50, 100],
    emptyMessage = 'Tidak ada data',
    onExport,
    onRowClick,
    className,
}: DataTableProps<T>) {
    const [searchQuery, setSearchQuery] = React.useState('');
    const [sortColumn, setSortColumn] = React.useState<string | null>(null);
    const [sortDirection, setSortDirection] = React.useState<SortDirection>(null);
    const [currentPage, setCurrentPage] = React.useState(1);
    const [rowsPerPage, setRowsPerPage] = React.useState(pageSize);

    // Filter data based on search query
    const filteredData = React.useMemo(() => {
        if (!searchQuery) return data;

        return data.filter((row) => {
            return columns.some((column) => {
                const value =
                    typeof column.accessor === 'function'
                        ? column.accessor(row)
                        : row[column.accessor];

                if (value === null || value === undefined) return false;

                return String(value)
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase());
            });
        });
    }, [data, searchQuery, columns]);

    // Sort data
    const sortedData = React.useMemo(() => {
        if (!sortColumn || !sortDirection) return filteredData;

        const column = columns.find((col) => col.id === sortColumn);
        if (!column) return filteredData;

        return [...filteredData].sort((a, b) => {
            const aValue =
                typeof column.accessor === 'function'
                    ? column.accessor(a)
                    : a[column.accessor];
            const bValue =
                typeof column.accessor === 'function'
                    ? column.accessor(b)
                    : b[column.accessor];

            if (aValue == null || bValue == null) return 0;
            if (aValue === bValue) return 0;

            const comparison = aValue < bValue ? -1 : 1;
            return sortDirection === 'asc' ? comparison : -comparison;
        });
    }, [filteredData, sortColumn, sortDirection, columns]);

    // Paginate data
    const paginatedData = React.useMemo(() => {
        if (!pagination) return sortedData;

        const startIndex = (currentPage - 1) * rowsPerPage;
        const endIndex = startIndex + rowsPerPage;
        return sortedData.slice(startIndex, endIndex);
    }, [sortedData, currentPage, rowsPerPage, pagination]);

    // Calculate pagination
    const totalPages = Math.ceil(sortedData.length / rowsPerPage);
    const startIndex = (currentPage - 1) * rowsPerPage + 1;
    const endIndex = Math.min(currentPage * rowsPerPage, sortedData.length);

    // Handle sort
    const handleSort = (columnId: string) => {
        const column = columns.find((col) => col.id === columnId);
        if (!column || !column.sortable) return;

        if (sortColumn === columnId) {
            if (sortDirection === 'asc') {
                setSortDirection('desc');
            } else if (sortDirection === 'desc') {
                setSortDirection(null);
                setSortColumn(null);
            }
        } else {
            setSortColumn(columnId);
            setSortDirection('asc');
        }
    };

    // Reset page when search query changes
    React.useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, rowsPerPage]);

    // Get sort icon
    const getSortIcon = (columnId: string) => {
        if (sortColumn !== columnId) {
            return <ChevronsUpDown className="ml-2 size-4 opacity-20" />;
        }
        if (sortDirection === 'asc') {
            return <ChevronUp className="ml-2 size-4" />;
        }
        return <ChevronDown className="ml-2 size-4" />;
    };

    // Render cell
    const renderCell = (column: Column<T>, row: T) => {
        if (column.cell) {
            return column.cell(row);
        }

        const value =
            typeof column.accessor === 'function'
                ? column.accessor(row)
                : row[column.accessor];

        return value ?? '-';
    };

    if (isLoading) {
        return (
            <div className={cn('space-y-3', className)}>
                <div className="flex items-center justify-between">
                    <Skeleton className="h-10 w-64" />
                    <Skeleton className="h-10 w-32" />
                </div>
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                {columns.map((column) => (
                                    <TableHead key={column.id}>
                                        <Skeleton className="h-4 w-24" />
                                    </TableHead>
                                ))}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {Array.from({ length: rowsPerPage }).map((_, i) => (
                                <TableRow key={i}>
                                    {columns.map((column) => (
                                        <TableCell key={column.id}>
                                            <Skeleton className="h-4 w-full" />
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>
        );
    }

    return (
        <div className={cn('space-y-4', className)}>
            {/* Header */}
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2 flex-1">
                    {searchable && (
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                            <Input
                                placeholder="Cari..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9"
                            />
                            {searchQuery && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                                    onClick={() => setSearchQuery('')}
                                >
                                    <X className="size-4" />
                                </Button>
                            )}
                        </div>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    {pagination && pageSizeOptions.length > 0 && (
                        <Select
                            value={String(rowsPerPage)}
                            onValueChange={(value) => {
                                setRowsPerPage(Number(value));
                                setCurrentPage(1);
                            }}
                        >
                            <SelectTrigger className="w-[120px]">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {pageSizeOptions.map((size) => (
                                    <SelectItem key={size} value={String(size)}>
                                        {size} per halaman
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}
                    {exportable && onExport && (
                        <Button variant="outline" size="sm" onClick={onExport}>
                            <Download className="mr-2 size-4" />
                            Export
                        </Button>
                    )}
                </div>
            </div>

            {/* Table */}
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            {columns.map((column) => (
                                <TableHead
                                    key={column.id}
                                    className={cn(
                                        column.sortable && 'cursor-pointer hover:bg-muted/50 select-none',
                                        column.className
                                    )}
                                    onClick={() => column.sortable && handleSort(column.id)}
                                >
                                    <div className="flex items-center">
                                        {column.header}
                                        {column.sortable && getSortIcon(column.id)}
                                    </div>
                                </TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {paginatedData.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}
                                    className="h-24 text-center text-muted-foreground"
                                >
                                    {emptyMessage}
                                </TableCell>
                            </TableRow>
                        ) : (
                            paginatedData.map((row, rowIndex) => (
                                <TableRow
                                    key={rowIndex}
                                    className={cn(onRowClick && 'cursor-pointer')}
                                    onClick={() => onRowClick?.(row)}
                                >
                                    {columns.map((column) => (
                                        <TableCell key={column.id} className={column.className}>
                                            {renderCell(column, row)}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination */}
            {pagination && totalPages > 1 && (
                <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                        Menampilkan {startIndex} sampai {endIndex} dari {sortedData.length} data
                    </div>
                    <Pagination>
                        <PaginationContent>
                            <PaginationItem>
                                <PaginationPrevious
                                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                    className={cn(
                                        currentPage === 1 && 'pointer-events-none opacity-50'
                                    )}
                                />
                            </PaginationItem>
                            {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                                let pageNum;
                                if (totalPages <= 5) {
                                    pageNum = i + 1;
                                } else if (currentPage <= 3) {
                                    pageNum = i + 1;
                                } else if (currentPage >= totalPages - 2) {
                                    pageNum = totalPages - 4 + i;
                                } else {
                                    pageNum = currentPage - 2 + i;
                                }

                                return (
                                    <PaginationItem key={i}>
                                        <PaginationLink
                                            onClick={() => setCurrentPage(pageNum)}
                                            isActive={currentPage === pageNum}
                                            className="cursor-pointer"
                                        >
                                            {pageNum}
                                        </PaginationLink>
                                    </PaginationItem>
                                );
                            })}
                            {totalPages > 5 && currentPage < totalPages - 2 && (
                                <PaginationItem>
                                    <PaginationEllipsis />
                                </PaginationItem>
                            )}
                            <PaginationItem>
                                <PaginationNext
                                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                    className={cn(
                                        currentPage === totalPages && 'pointer-events-none opacity-50'
                                    )}
                                />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                </div>
            )}
        </div>
    );
}
