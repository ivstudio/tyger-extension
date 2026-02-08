import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PageToScanUrl } from './PageToScanUrl';
import { useScanState } from '@/app/context/useScanContext';

// Mock the useScanState hook
vi.mock('@/app/context/useScanContext', () => ({
    useScanState: vi.fn(),
}));

const mockUseScanState = vi.mocked(useScanState);

describe('PageToScanUrl', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('when a URL is available', () => {
        it('displays the page-to-scan label and URL', () => {
            mockUseScanState.mockReturnValue({
                currentUrl: 'https://example.com/page',
            } as any);

            render(<PageToScanUrl />);

            expect(screen.getByText('Page to scan')).toBeInTheDocument();
            expect(screen.getByText('example.com/page')).toBeInTheDocument();
        });

        it('displays host and path without protocol', () => {
            mockUseScanState.mockReturnValue({
                currentUrl: 'https://test.com/path/to/page',
            } as any);

            render(<PageToScanUrl />);

            expect(
                screen.getByText('test.com/path/to/page')
            ).toBeInTheDocument();
        });

        it('omits protocol (e.g. https://) from displayed URL', () => {
            mockUseScanState.mockReturnValue({
                currentUrl: 'https://secure.com',
            } as any);

            render(<PageToScanUrl />);

            expect(screen.getByText('secure.com/')).toBeInTheDocument();
            expect(screen.queryByText('https://')).not.toBeInTheDocument();
        });

        it('includes path when URL has query parameters', () => {
            mockUseScanState.mockReturnValue({
                currentUrl: 'https://example.com/search?q=test',
            } as any);

            const { container } = render(<PageToScanUrl />);

            expect(container.textContent).toContain('example.com/search');
        });

        it('includes path when URL has hash', () => {
            mockUseScanState.mockReturnValue({
                currentUrl: 'https://example.com/page#section',
            } as any);

            const { container } = render(<PageToScanUrl />);

            expect(container.textContent).toContain('example.com/page');
        });

        it('displays host, port, and path when URL has a port', () => {
            mockUseScanState.mockReturnValue({
                currentUrl: 'http://localhost:3000/app',
            } as any);

            render(<PageToScanUrl />);

            expect(screen.getByText('localhost:3000/app')).toBeInTheDocument();
        });

        it('shows a visible status indicator with the URL block', () => {
            mockUseScanState.mockReturnValue({
                currentUrl: 'https://example.com',
            } as any);

            const { container } = render(<PageToScanUrl />);

            const indicator = container.querySelector('.bg-green-500');
            expect(indicator).toBeInTheDocument();
        });
    });

    describe('when no URL is available', () => {
        it('does not show the page-to-scan section when URL is null', () => {
            mockUseScanState.mockReturnValue({
                currentUrl: null,
            } as any);

            const { container } = render(<PageToScanUrl />);

            expect(container.firstChild).toBeNull();
        });

        it('does not show the page-to-scan section when URL is undefined', () => {
            mockUseScanState.mockReturnValue({
                currentUrl: undefined,
            } as any);

            const { container } = render(<PageToScanUrl />);

            expect(container.firstChild).toBeNull();
        });

        it('does not show the page-to-scan section when URL is empty', () => {
            mockUseScanState.mockReturnValue({
                currentUrl: '',
            } as any);

            const { container } = render(<PageToScanUrl />);

            expect(container.firstChild).toBeNull();
        });
    });

    describe('URL display formatting', () => {
        it('displays subdomain, host, and path correctly', () => {
            mockUseScanState.mockReturnValue({
                currentUrl: 'https://subdomain.example.com/page',
            } as any);

            render(<PageToScanUrl />);

            expect(
                screen.getByText('subdomain.example.com/page')
            ).toBeInTheDocument();
        });

        it('displays URLs with multiple path segments', () => {
            mockUseScanState.mockReturnValue({
                currentUrl: 'https://example.com/a/b/c/d',
            } as any);

            render(<PageToScanUrl />);

            expect(screen.getByText('example.com/a/b/c/d')).toBeInTheDocument();
        });

        it('displays URL with trailing slash', () => {
            mockUseScanState.mockReturnValue({
                currentUrl: 'https://example.com/page/',
            } as any);

            render(<PageToScanUrl />);

            expect(screen.getByText('example.com/page/')).toBeInTheDocument();
        });

        it('displays root URL (host only) with trailing slash', () => {
            mockUseScanState.mockReturnValue({
                currentUrl: 'https://example.com',
            } as any);

            render(<PageToScanUrl />);

            expect(screen.getByText('example.com/')).toBeInTheDocument();
        });

        it('displays root URL when path is just slash', () => {
            mockUseScanState.mockReturnValue({
                currentUrl: 'https://example.com/',
            } as any);

            render(<PageToScanUrl />);

            expect(screen.getByText('example.com/')).toBeInTheDocument();
        });
    });

    describe('when URL is invalid or malformed', () => {
        it('shows the raw string when URL cannot be parsed', () => {
            mockUseScanState.mockReturnValue({
                currentUrl: 'not-a-valid-url',
            } as any);

            render(<PageToScanUrl />);

            expect(screen.getByText('not-a-valid-url')).toBeInTheDocument();
        });

        it('shows the raw string for malformed URLs without crashing', () => {
            mockUseScanState.mockReturnValue({
                currentUrl: 'http://',
            } as any);

            render(<PageToScanUrl />);

            expect(screen.getByText('http://')).toBeInTheDocument();
        });

        it('displays path when URL contains encoded or special characters', () => {
            mockUseScanState.mockReturnValue({
                currentUrl: 'https://example.com/path?q=hello%20world',
            } as any);

            const { container } = render(<PageToScanUrl />);

            expect(container.textContent).toContain('example.com/path');
        });
    });

    describe('when the current URL changes', () => {
        it('updates displayed URL when context provides a new URL', () => {
            mockUseScanState.mockReturnValue({
                currentUrl: 'https://first.com',
            } as any);

            const { rerender } = render(<PageToScanUrl />);

            expect(screen.getByText('first.com/')).toBeInTheDocument();

            mockUseScanState.mockReturnValue({
                currentUrl: 'https://second.com',
            } as any);

            rerender(<PageToScanUrl />);

            expect(screen.getByText('second.com/')).toBeInTheDocument();
            expect(screen.queryByText('first.com/')).not.toBeInTheDocument();
        });

        it('shows the section when URL changes from absent to present', () => {
            mockUseScanState.mockReturnValue({
                currentUrl: null,
            } as any);

            const { container, rerender } = render(<PageToScanUrl />);

            expect(container.firstChild).toBeNull();

            mockUseScanState.mockReturnValue({
                currentUrl: 'https://example.com',
            } as any);

            rerender(<PageToScanUrl />);

            expect(screen.getByText('example.com/')).toBeInTheDocument();
        });

        it('hides the section when URL changes from present to absent', () => {
            mockUseScanState.mockReturnValue({
                currentUrl: 'https://example.com',
            } as any);

            const { container, rerender } = render(<PageToScanUrl />);

            expect(screen.getByText('example.com/')).toBeInTheDocument();

            mockUseScanState.mockReturnValue({
                currentUrl: null,
            } as any);

            rerender(<PageToScanUrl />);

            expect(container.firstChild).toBeNull();
        });
    });

    describe('accessibility and visible structure', () => {
        it('shows the "Page to scan" label when a URL is present', () => {
            mockUseScanState.mockReturnValue({
                currentUrl: 'https://example.com',
            } as any);

            render(<PageToScanUrl />);

            expect(screen.getByText('Page to scan')).toBeInTheDocument();
        });

        it('renders URL text in monospace for readability', () => {
            mockUseScanState.mockReturnValue({
                currentUrl: 'https://example.com',
            } as any);

            render(<PageToScanUrl />);

            const urlElement = screen.getByText('example.com/');
            expect(urlElement).toHaveClass('font-mono');
        });

        it('allows long URLs to wrap and stay visible', () => {
            mockUseScanState.mockReturnValue({
                currentUrl: 'https://example.com/very/long/path',
            } as any);

            render(<PageToScanUrl />);

            const urlElement = screen.getByText('example.com/very/long/path');
            expect(urlElement).toHaveClass('break-all');
        });
    });
});
