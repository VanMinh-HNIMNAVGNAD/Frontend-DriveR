import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { UploadProvider } from './context/UploadContext';
import { FileProvider } from './context/FileContext';
import AppRouter from './routes/AppRouter';

export default function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                {/* UploadProvider phải nằm ngoài FileProvider vì FileProvider gọi useUpload() */}
                <UploadProvider>
                    <FileProvider>
                        <AppRouter />
                    </FileProvider>
                </UploadProvider>
            </AuthProvider>
        </BrowserRouter>
    );
}