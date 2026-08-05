import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { FileProvider } from './context/FileContext';
import AppRouter from './routes/AppRouter';

export default function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <FileProvider>
                    <AppRouter />
                </FileProvider>
            </AuthProvider>
        </BrowserRouter>
    );
}