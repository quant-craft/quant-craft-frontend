import { Typography, Button, Box } from '@mui/material';

const HeroSection = () => {
    return (
        <Box sx={{ textAlign: 'center', my: 8 }}>
            <Typography variant="h2" component="h1" gutterBottom>
                퀀트 트레이딩의 새로운 시대
            </Typography>
            <Typography variant="h5" component="p" color="text.secondary" paragraph>
                QuantCraft와 함께 자동매매의 힘을 경험하세요
            </Typography>
            <Button variant="contained" size="large" sx={{ mt: 2 }}>
                시작하기
            </Button>
        </Box>
    );
};

export default HeroSection;
