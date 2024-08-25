import { ThemeProvider, createTheme, CssBaseline, Container } from '@mui/material';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import FeaturesSection from './components/FeaturesSection';
import Footer from './components/Footer';

const theme = createTheme({
});

function App() {
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Navbar />
            <Container>
                <HeroSection />
                <FeaturesSection />
            </Container>
            <Footer />
        </ThemeProvider>
    );
}

export default App;