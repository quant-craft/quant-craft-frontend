import React, { useState } from 'react';
import {
    Container, Typography, Paper, Box, Grid,
    List, ListItem, ListItemText, Tabs, Tab
} from '@mui/material';
import { styled } from '@mui/material/styles';
import ApiKeyManagementTab from './ApiKeyManagementTab';

// 추후 추가될 컴포넌트들을 여기에 임포트합니다.
// import BacktestingTab from './BacktestingTab';
// import StrategyDevelopmentTab from './StrategyDevelopmentTab';

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
            // 추후 다른 탭들을 여기에 추가합니다.
            // case 1:
            //     return <BacktestingTab />;
            // case 2:
            //     return <StrategyDevelopmentTab />;
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
                            {/* 추후 다른 메뉴 항목들을 여기에 추가합니다. */}
                            {/* <SidebarItem
                                selected={activeTab === 1}
                                onClick={() => setActiveTab(1)}
                            >
                                <ListItemText primary="백테스팅" />
                            </SidebarItem>
                            <SidebarItem
                                selected={activeTab === 2}
                                onClick={() => setActiveTab(2)}
                            >
                                <ListItemText primary="전략 개발" />
                            </SidebarItem> */}
                        </List>
                    </Paper>
                </Grid>
                <Grid item xs={12} md={9}>
                    <ContentPaper elevation={3}>
                        <Tabs value={activeTab} onChange={handleTabChange}>
                            <Tab label="API Key 관리" />
                            {/* 추후 다른 탭들을 여기에 추가합니다. */}
                            {/* <Tab label="백테스팅" />
                            <Tab label="전략 개발" /> */}
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