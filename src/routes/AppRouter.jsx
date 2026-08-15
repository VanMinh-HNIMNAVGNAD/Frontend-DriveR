import { Routes, Route, useNavigate, Navigate, useLocation } from 'react-router-dom';
import LandingPage from '../pages/LandingPage';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import MainLayout from '../components/layout/MainLayout';
import PageNotFound from '../pages/PageNotFound';
import SharePage from '../pages/SharePage';

// Pages
import HomePage from '../pages/HomePage';
import MyDrivePage from '../pages/MyDrivePage';
import SharedDrivesPage from '../pages/SharedDrivesPage';
import SharedWithMePage from '../pages/SharedWithMePage';
import RecentPage from '../pages/RecentPage';
import StarredPage from '../pages/StarredPage';
import SpamPage from '../pages/SpamPage';
import TrashPage from '../pages/TrashPage';
import BillingAndQuota from '../pages/BillingAndQuota';

function IndexRedirect() {
    const location = useLocation();
    return <Navigate to={`my-drive${location.search}`} replace />;
}

export default function AppRouter() {
    const navigate = useNavigate();

    return (
        <Routes>
            <Route path="/" element={<LandingPage onLaunchDrive={() => navigate('/app')} />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Route công khai — xem file qua link chia sẻ, không cần đăng nhập */}
            <Route path="/share/:token" element={<SharePage />} />

            <Route path="/app" element={<MainLayout />}>
                <Route index element={<IndexRedirect />} />
                <Route path="home" element={<HomePage />} />
                <Route path="my-drive" element={<MyDrivePage />} />
                <Route path="my-drive/folders/:folderId" element={<MyDrivePage />} />
                <Route path="shared-drives" element={<SharedDrivesPage />} />
                <Route path="shared-drives/folders/:folderId" element={<SharedDrivesPage />} />
                <Route path="shared-with-me" element={<SharedWithMePage />} />
                <Route path="shared-with-me/folders/:folderId" element={<SharedWithMePage />} />
                <Route path="recent" element={<RecentPage />} />
                <Route path="starred" element={<StarredPage />} />
                <Route path="spam" element={<SpamPage />} />
                <Route path="trash" element={<TrashPage />} />
                <Route path="billing" element={<BillingAndQuota />} />
            </Route>

            <Route path="*" element={<PageNotFound onGoHome={() => navigate('/')} />} />
        </Routes>
    );
}
