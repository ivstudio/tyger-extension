import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { HeaderActions } from './HeaderActions';
import { ScanActionsProvider } from '@/app/context/ScanActionsContext';
import { createMockScanResult } from '@/test/fixtures/scanResults';
import { createMockManualChecklist } from '@/test/fixtures/checklists';

const mockHandleRefresh = vi.fn();

function wrapper({ children }: { children: React.ReactNode }) {
    return (
        <ScanActionsProvider
            value={{
                handleScan: vi.fn(),
                handleRefresh: mockHandleRefresh,
            }}
        >
            {children}
        </ScanActionsProvider>
    );
}

vi.mock('@/app/context/useScanContext', () => ({
    useScanState: vi.fn(),
    useChecklist: vi.fn(() => null),
}));

vi.mock('@/services/export', () => ({
    downloadJSON: vi.fn(),
}));

const mockSendMessage = vi.fn((_message?: unknown) => Promise.resolve());
vi.mock('@/services/messaging', () => ({
    sendMessage: (message: unknown) => mockSendMessage(message),
}));

import { useScanState, useChecklist } from '@/app/context/useScanContext';
import { downloadJSON } from '@/services/export';
import { MessageType } from '@/types/messages';

describe('HeaderActions', () => {
    beforeEach(() => {
        vi.mocked(useScanState).mockReturnValue({
            currentScan: null,
            isScanning: false,
        } as any);
        vi.mocked(useChecklist).mockReturnValue(null);
        mockHandleRefresh.mockClear();
        mockSendMessage.mockClear();
    });

    it('calls handleRefresh when Refresh button is clicked', () => {
        render(<HeaderActions />, { wrapper });

        const refreshButton = screen.getByRole('button', { name: /refresh/i });
        fireEvent.click(refreshButton);

        expect(mockHandleRefresh).toHaveBeenCalledTimes(1);
    });

    it('shows Refresh when not scanning', () => {
        render(<HeaderActions />, { wrapper });

        expect(
            screen.getByRole('button', { name: /refresh/i })
        ).toHaveTextContent('Refresh');
    });

    it('shows Scanning... when isScanning is true', () => {
        vi.mocked(useScanState).mockReturnValue({
            currentScan: null,
            isScanning: true,
        } as any);

        render(<HeaderActions />, { wrapper });

        expect(
            screen.getByRole('button', { name: /scanning/i })
        ).toHaveTextContent('Scanning...');
    });

    it('disables Refresh button when isScanning is true', () => {
        vi.mocked(useScanState).mockReturnValue({
            currentScan: null,
            isScanning: true,
        } as any);

        render(<HeaderActions />, { wrapper });

        expect(
            screen.getByRole('button', { name: /scanning/i })
        ).toBeDisabled();
    });

    it('shows picker, clear highlights, and export when currentScan exists', () => {
        const scan = createMockScanResult();
        vi.mocked(useScanState).mockReturnValue({
            currentScan: scan,
            isScanning: false,
        } as any);

        render(<HeaderActions />, { wrapper });

        expect(screen.getByTitle('Pick element on page')).toBeInTheDocument();
        expect(screen.getByTitle('Clear highlights')).toBeInTheDocument();
        expect(screen.getByTitle('Export as JSON')).toBeInTheDocument();
    });

    it('calls downloadJSON when Export is clicked', () => {
        const scan = createMockScanResult();
        const checklist = createMockManualChecklist();
        vi.mocked(useScanState).mockReturnValue({
            currentScan: scan,
            isScanning: false,
        } as any);
        vi.mocked(useChecklist).mockReturnValue(checklist);

        render(<HeaderActions />, { wrapper });

        fireEvent.click(screen.getByTitle('Export as JSON'));

        expect(downloadJSON).toHaveBeenCalledWith(scan, checklist);
    });

    it('sends TOGGLE_PICKER when Pick element is clicked', async () => {
        const scan = createMockScanResult();
        vi.mocked(useScanState).mockReturnValue({
            currentScan: scan,
            isScanning: false,
        } as any);
        mockSendMessage.mockClear();

        render(<HeaderActions />, { wrapper });

        fireEvent.click(screen.getByTitle('Pick element on page'));

        expect(mockSendMessage).toHaveBeenCalledWith({
            type: MessageType.TOGGLE_PICKER,
            data: { enabled: true },
        });
    });

    it('sends CLEAR_HIGHLIGHTS when Clear highlights is clicked', async () => {
        const scan = createMockScanResult();
        vi.mocked(useScanState).mockReturnValue({
            currentScan: scan,
            isScanning: false,
        } as any);
        mockSendMessage.mockClear();

        render(<HeaderActions />, { wrapper });

        fireEvent.click(screen.getByTitle('Clear highlights'));

        expect(mockSendMessage).toHaveBeenCalledWith({
            type: MessageType.CLEAR_HIGHLIGHTS,
        });
    });
});
