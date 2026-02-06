import { useReducer, ReactNode } from 'react';
import { scanReducer } from './scanReducer';
import { initialState } from './scanTypes';
import { ScanStateContext, ScanDispatchContext } from './stateContexts';

export function ScanProvider({ children }: { children: ReactNode }) {
    const [state, dispatch] = useReducer(scanReducer, initialState);

    return (
        <ScanStateContext.Provider value={state}>
            <ScanDispatchContext.Provider value={dispatch}>
                {children}
            </ScanDispatchContext.Provider>
        </ScanStateContext.Provider>
    );
}
