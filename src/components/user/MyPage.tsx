import React, { useState, useEffect } from 'react';
import {
    Container, Typography, Paper, Box, CircularProgress, Grid,
    List, ListItem, ListItemText, Tabs, Tab
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { getBackendUrl } from '../../config';
import TossPaymentsModal from "../payment/TossPaymentsModal";
import UserInfoTab from './UserInfoTab';
import PointInfoTab from "./PointInfoTab.tsx";

interface UserInfo {
    nickname: string;
    email: string;
    oauthProvider: string;
    point: number;
}

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

const MyPage: React.FC = () => {
    const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isChargeModalOpen, setIsChargeModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState(0);

    useEffect(() => {
        const fetchUserInfo = async () => {
            const accessToken = localStorage.getItem('accessToken');
            if (!accessToken) {
                throw new Error('로그인이 필요합니다.');
            }

            const response = await fetch(`${getBackendUrl()}/api/users`, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                },
            });

            if (!response.ok) {
                throw new Error('사용자 정보를 가져오는데 실패했습니다.');
            }

            return response.json();
        };

        fetchUserInfo()
            .then(data => {
                setUserInfo(data);
                setLoading(false);
            })
            .catch(err => {
                setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
                setLoading(false);
            });
    }, []);

    if (loading) return <CircularProgress />;
    if (error) return <Typography color="error">{error}</Typography>;
    if (!userInfo) return <Typography>사용자 정보를 불러올 수 없습니다.</Typography>;

    const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
        setActiveTab(newValue);
    };

    return (
        <Container maxWidth="lg" sx={{ mt: 4 }}>
            <Grid container spacing={3}>
                <Grid item xs={12} md={3}>
                    <Paper elevation={3}>
                        <List component="nav">
                            <SidebarItem onClick={() => setActiveTab(0)}>
                                <ListItemText primary="사용자 정보" />
                            </SidebarItem>
                            <SidebarItem onClick={() => setActiveTab(1)}>
                                <ListItemText primary="포인트 정보" />
                            </SidebarItem>
                        </List>
                    </Paper>
                </Grid>
                <Grid item xs={12} md={9}>
                    <ContentPaper elevation={3}>
                        <Tabs value={activeTab} onChange={handleTabChange}>
                            <Tab label="사용자 정보" />
                            <Tab label="포인트 정보" />
                        </Tabs>
                        <Box sx={{ mt: 2 }}>
                            {activeTab === 0 && (
                                <UserInfoTab
                                    userInfo={userInfo}
                                    onChargeClick={() => setIsChargeModalOpen(true)}
                                />
                            )}
                            {activeTab === 1 && (
                                <PointInfoTab
                                    userPoint={userInfo.point}
                                    onChargeClick={() => setIsChargeModalOpen(true)}
                                />
                            )}
                        </Box>
                    </ContentPaper>
                </Grid>
            </Grid>
            <TossPaymentsModal
                open={isChargeModalOpen}
                onClose={() => setIsChargeModalOpen(false)}
                nickname={userInfo.nickname}
            />
        </Container>
    );
};

export default MyPage;