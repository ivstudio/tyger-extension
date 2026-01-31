import { useEffect } from 'react';
import { onMessage } from '@/lib/messaging';
import { MessageType } from '@/types/messages';
import { ScanResult } from '@/types/issue';
import { ScanProvider, useScanDispatch } from './context/ScanContext';
import Header from './components/Header';
import IssueList from './components/IssueList';
import IssueDetail from './components/IssueDetail';

function AppContent() {
  const dispatch = useScanDispatch();

  useEffect(() => {
    // Listen for scan results from content script
    onMessage((message) => {
      if (message.type === MessageType.SCAN_COMPLETE) {
        dispatch({
          type: 'SCAN_COMPLETE',
          payload: message.data.result as ScanResult
        });
      } else if (message.type === MessageType.SCAN_ERROR) {
        dispatch({
          type: 'SCAN_ERROR',
          payload: message.data.error
        });
      }
    });
  }, [dispatch]);

  return (
    <div className="flex flex-col h-screen bg-background">
      <Header />
      <div className="flex-1 flex overflow-hidden">
        <div className="w-2/5 border-r border-border overflow-y-auto">
          <IssueList />
        </div>
        <div className="flex-1 overflow-y-auto">
          <IssueDetail />
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ScanProvider>
      <AppContent />
    </ScanProvider>
  );
}
