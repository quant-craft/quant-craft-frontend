import { ThemeProvider, createTheme, CssBaseline, Container } from '@mui/material';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import FeaturesSection from './components/FeaturesSection';
import Footer from './components/Footer';
import OAuthCallback from './components/auth/OAuthCallback.tsx';
import MyPage from "./components/user/MyPage.tsx";
import TossPaymentsSuccessCallback from "./components/payment/TossPaymentsSuccessCallback.tsx";
import TossPaymentFailCallback from "./components/payment/TossPaymentsFailCallback.tsx";
import Market from "./components/market/Market.tsx";
import StrategyItemDetail from "./components/market/StrategyItemDetail.tsx";
import Studio from "./components/studio/Studio.tsx";

const theme = createTheme({
    // Theme configuration remains unchanged
});

function App() {
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Router>
                <Navbar />
                <Container>
                    <Routes>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/oauth/callback/:provider" element={<OAuthCallback />} />
                        <Route path="/mypage" element={<MyPage />} />
                        <Route path="/market" element={<Market />} />
                        <Route path="/studio/" element={<Studio />} />
                        <Route path="/strategy-item/:id" element={<StrategyItemDetail />} />
                        <Route path="/toss-payment-success" element={<TossPaymentsSuccessCallback />} />
                        <Route path="/toss-payment-fail" element={<TossPaymentFailCallback />} />
                    </Routes>
                </Container>
                <Footer />
            </Router>
        </ThemeProvider>
    );
}

const HomePage = () => (
    <>
        <HeroSection />
        <FeaturesSection />
    </>
);

export default App;