import { ScanProvider } from './context/ScanContext';
import MainView from './MainView';

export function App() {
    return (
        <ScanProvider>
            <MainView />
        </ScanProvider>
    );
}
