import { describe, it, expect } from 'vitest';

/**
 * Test file to verify layout components are properly configured
 */

describe('Layout Components', () => {
    describe('AuthLayout', () => {
        it('should import AuthLayout component', async () => {
            const layout = await import('@/layouts/auth-layout');
            expect(layout).toBeDefined();
            expect(layout.default).toBeDefined();
        });
    });

    describe('AppLayout', () => {
        it('should import AppLayout component', async () => {
            const layout = await import('@/layouts/app-layout');
            expect(layout).toBeDefined();
            expect(layout.default).toBeDefined();
        });
    });

    describe('BlankLayout', () => {
        it('should import BlankLayout component', async () => {
            const layout = await import('@/layouts/blank-layout');
            expect(layout).toBeDefined();
            expect(layout.default).toBeDefined();
        });
    });

    describe('Layout Components Integration', () => {
        it('should import all required layout components', async () => {
            const layouts = await Promise.all([
                import('@/layouts/app-layout'),
                import('@/layouts/auth-layout'),
                import('@/layouts/blank-layout'),
                import('@/layouts/app/app-sidebar-layout'),
                import('@/layouts/app/app-header-layout'),
            ]);

            layouts.forEach((layout) => {
                expect(layout).toBeDefined();
            });
        });

        it('should import app shell and content components', async () => {
            const components = await Promise.all([
                import('@/components/app-shell'),
                import('@/components/app-content'),
            ]);

            components.forEach((component) => {
                expect(component).toBeDefined();
            });
        });
    });
});
