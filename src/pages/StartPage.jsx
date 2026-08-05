import { useNavigate } from 'react-router-dom';
import LandingPage from './LandingPage';

export default function StartPage() {
    const navigate = useNavigate();
    return <LandingPage onLaunchDrive={() => navigate('/app')} />;
}
