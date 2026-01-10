import { usePage } from '@inertiajs/react';

export function usePageProps<T = Record<string, unknown>>() {
    const page = usePage();
    return page.props as T;
}
