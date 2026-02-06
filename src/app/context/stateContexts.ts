import React, { createContext } from 'react';
import type { ScanState, ScanAction } from './scanTypes';

export const ScanStateContext = createContext<ScanState | undefined>(undefined);
export const ScanDispatchContext = createContext<
    React.Dispatch<ScanAction> | undefined
>(undefined);
