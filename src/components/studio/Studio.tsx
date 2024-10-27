import React, { useState } from 'react';
import {
    Container, Typography, Paper, Box, Grid,
    List, ListItem, ListItemText, Tabs, Tab
} from '@mui/material';
import { styled } from '@mui/material/styles';
import ApiKeyManagementTab from './ApiKeyManagementTab';
import MyStrategiesTab from './MyStrategiesTab';
import TradingBotsTab from './TradingBotsTab';

const SidebarItem = styled(ListItem)(({ theme }) => ({
    '&:hover': {
        backgroundColor: theme.palette.action.hover,
        cursor: 'pointer',
    },
}));

const ContentPaper = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(3),
    height: '100%',
}));

const Studio: React.FC = () => {
    const [activeTab, setActiveTab] = useState(0);

    const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
        setActiveTab(newValue);
    };

    const renderContent = () => {
        switch (activeTab) {
            case 0:
                return <ApiKeyManagementTab />;
            case 1:
                return <MyStrategiesTab />;
            case 2:
                return <TradingBotsTab />;
            default:
                return <Typography>선택된 탭이 없습니다.</Typography>;
        }
    };

    return (
        <Container maxWidth="lg" sx={{ mt: 4 }}>
            <Grid container spacing={3}>
                <Grid item xs={12} md={3}>
                    <Paper elevation={3}>
                        <List component="nav">
                            <SidebarItem
                                selected={activeTab === 0}
                                onClick={() => setActiveTab(0)}
                            >
                                <ListItemText primary="API Key 관리" />
                            </SidebarItem>
                            <SidebarItem
                                selected={activeTab === 1}
                                onClick={() => setActiveTab(1)}
                            >
                                <ListItemText primary="나의 전략" />
                            </SidebarItem>
                            <SidebarItem
                                selected={activeTab === 2}
                                onClick={() => setActiveTab(2)}
                            >
                                <ListItemText primary="트레이딩 봇" />
                            </SidebarItem>
                        </List>
                    </Paper>
                </Grid>
                <Grid item xs={12} md={9}>
                    <ContentPaper elevation={3}>
                        <Tabs value={activeTab} onChange={handleTabChange}>
                            <Tab label="API Key 관리" />
                            <Tab label="나의 전략" />
                            <Tab label="트레이딩 봇" />
                        </Tabs>
                        <Box sx={{ mt: 2 }}>
                            {renderContent()}
                        </Box>
                    </ContentPaper>
                </Grid>
            </Grid>
        </Container>
    );
};

export default Studio;