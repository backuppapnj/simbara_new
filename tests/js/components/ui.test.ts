import { describe, it, expect } from 'vitest';

/**
 * Test file to verify shadcn/ui components are properly installed and can be imported
 */

describe('shadcn/ui Components', () => {
    describe('Form Components', () => {
        it('should import Input component', async () => {
            const button = await import('@/components/ui/input');
            expect(button).toBeDefined();
        });

        it('should import Label component', async () => {
            const label = await import('@/components/ui/label');
            expect(label).toBeDefined();
        });

        it('should import Checkbox component', async () => {
            const checkbox = await import('@/components/ui/checkbox');
            expect(checkbox).toBeDefined();
        });

        it('should import Select component', async () => {
            const select = await import('@/components/ui/select');
            expect(select).toBeDefined();
        });
    });

    describe('Feedback Components', () => {
        it('should import Alert component', async () => {
            const alert = await import('@/components/ui/alert');
            expect(alert).toBeDefined();
        });

        it('should import Dialog component', async () => {
            const dialog = await import('@/components/ui/dialog');
            expect(dialog).toBeDefined();
        });

        it('should import Skeleton component', async () => {
            const skeleton = await import('@/components/ui/skeleton');
            expect(skeleton).toBeDefined();
        });

        it('should import Sheet component', async () => {
            const sheet = await import('@/components/ui/sheet');
            expect(sheet).toBeDefined();
        });
    });

    describe('Data Display Components', () => {
        it('should import Card component', async () => {
            const card = await import('@/components/ui/card');
            expect(card).toBeDefined();
        });

        it('should import Badge component', async () => {
            const badge = await import('@/components/ui/badge');
            expect(badge).toBeDefined();
        });

        it('should import Avatar component', async () => {
            const avatar = await import('@/components/ui/avatar');
            expect(avatar).toBeDefined();
        });

        it('should import Separator component', async () => {
            const separator = await import('@/components/ui/separator');
            expect(separator).toBeDefined();
        });
    });

    describe('Navigation Components', () => {
        it('should import Button component', async () => {
            const button = await import('@/components/ui/button');
            expect(button).toBeDefined();
        });

        it('should import DropdownMenu component', async () => {
            const dropdown = await import('@/components/ui/dropdown-menu');
            expect(dropdown).toBeDefined();
        });

        it('should import Sidebar component', async () => {
            const sidebar = await import('@/components/ui/sidebar');
            expect(sidebar).toBeDefined();
        });

        it('should import Breadcrumb component', async () => {
            const breadcrumb = await import('@/components/ui/breadcrumb');
            expect(breadcrumb).toBeDefined();
        });
    });
});
