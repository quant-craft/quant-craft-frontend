import React from 'react';
import { Typography, Grid, Paper, Box } from '@mui/material';
import TimelineIcon from '@mui/icons-material/Timeline';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';

interface FeatureItemProps {
    icon: React.ReactNode;
    title: string;
    description: string;
}

const FeatureItem: React.FC<FeatureItemProps> = ({ icon, title, description }) => (
    <Paper elevation={3} sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            {icon}
            <Typography variant="h6" component="h3" sx={{ ml: 2 }}>
                {title}
            </Typography>
        </Box>
        <Typography variant="body1" color="text.secondary">
            {description}
        </Typography>
    </Paper>
);

const FeaturesSection: React.FC = () => {
    return (
        <Box sx={{ my: 8 }}>
            <Typography variant="h4" component="h2" gutterBottom align="center">
                주요 기능
            </Typography>
            <Grid container spacing={4} sx={{ mt: 4 }}>
                <Grid item xs={12} md={4}>
                    <FeatureItem
                        icon={<TimelineIcon fontSize="large" color="primary" />}
                        title="백테스팅"
                        description="과거 데이터로 전략을 테스트하세요"
                    />
                </Grid>
                <Grid item xs={12} md={4}>
                    <FeatureItem
                        icon={<ShowChartIcon fontSize="large" color="primary" />}
                        title="모의투자"
                        description="리스크 없이 전략을 실험해보세요"
                    />
                </Grid>
                <Grid item xs={12} md={4}>
                    <FeatureItem
                        icon={<AccountBalanceIcon fontSize="large" color="primary" />}
                        title="실제 거래"
                        description="검증된 전략으로 실제 거래를 시작하세요"
                    />
                </Grid>
            </Grid>
        </Box>
    );
};

export default FeaturesSection;