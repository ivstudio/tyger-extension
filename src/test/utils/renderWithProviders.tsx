import React from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { ScanProvider } from '@/app/context/ScanContext';

interface AllTheProvidersProps {
    children: React.ReactNode;
}

function AllTheProviders({ children }: AllTheProvidersProps) {
    return <ScanProvider>{children}</ScanProvider>;
}

/**
 * Custom render function that wraps components with necessary providers
 */
export function renderWithProviders(
    ui: React.ReactElement,
    options?: Omit<RenderOptions, 'wrapper'>
) {
    return render(ui, { wrapper: AllTheProviders, ...options });
}

// Re-export everything from @testing-library/react
export * from '@testing-library/react';
export { renderWithProviders as render };
