import { createContext, useContext, type ReactNode } from 'react';

export interface ScanActionsContextValue {
    handleScan: () => Promise<void>;
    handleRefresh: () => Promise<void>;
}

const ScanActionsContext = createContext<ScanActionsContextValue | undefined>(
    undefined
);

interface ScanActionsProviderProps {
    value: ScanActionsContextValue;
    children: ReactNode;
}

export function ScanActionsProvider({
    value,
    children,
}: ScanActionsProviderProps) {
    return (
        <ScanActionsContext.Provider value={value}>
            {children}
        </ScanActionsContext.Provider>
    );
}

export function useScanActions(): ScanActionsContextValue {
    const context = useContext(ScanActionsContext);
    if (context === undefined) {
        throw new Error(
            'useScanActions must be used within a ScanActionsProvider'
        );
    }
    return context;
}
