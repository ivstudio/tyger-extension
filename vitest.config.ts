import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
    plugins: [react()],
    test: {
        // Test environment
        environment: 'happy-dom',

        // Setup files
        setupFiles: ['./src/test/setup.ts'],

        // Coverage configuration
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html', 'lcov'],
            reportsDirectory: './coverage',

            // Overall thresholds
            thresholds: {
                lines: 80,
                statements: 80,
                functions: 75,
                branches: 75,
            },

            // Per-file thresholds for critical files
            perFile: true,
            lines: 80,

            // Exclude patterns
            exclude: [
                'node_modules/',
                'dist/',
                'coverage/',
                'src/test/**',
                '**/*.test.ts',
                '**/*.test.tsx',
                '**/*.config.ts',
                '**/*.config.js',
                'src/app/main.tsx',
                'src/vite-env.d.ts',
            ],
        },

        // Test execution
        watch: false,
        globals: true,
        clearMocks: true,
        mockReset: true,
        restoreMocks: true,

        // Reporters
        reporters: ['verbose'],

        // Performance
        pool: 'threads',

        // Timeouts
        testTimeout: 10000,
        hookTimeout: 10000,
    },

    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
            '@/services': path.resolve(__dirname, './src/services'),
            '@/app': path.resolve(__dirname, './src/app'),
            '@/worker': path.resolve(__dirname, './src/worker'),
            '@/contentScripts': path.resolve(__dirname, './src/contentScripts'),
            '@/test': path.resolve(__dirname, './src/test'),
        },
    },
});
