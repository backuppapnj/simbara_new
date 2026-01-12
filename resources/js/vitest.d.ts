/* eslint-disable @typescript-eslint/no-empty-object-type */
/// <reference types="vitest" />
/// <reference types="@testing-library/jest-dom" />

import type { TestingLibraryMatchers } from '@testing-library/jest-dom/matchers';

declare module 'vitest' {
    export interface Assertion<T = any> extends TestingLibraryMatchers<T, void> {}
    export interface AsymmetricMatchersContaining extends TestingLibraryMatchers<any, void> {}
}
