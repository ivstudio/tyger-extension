import { ScanProvider } from './context/ScanContext';
import AppContent from './AppContent';

export default function App() {
    return (
        <ScanProvider>
            <AppContent />
        </ScanProvider>
    );
}
