import React, { useState, useEffect } from 'react';
import {
    Container, Typography, Paper, Box, CircularProgress, Grid,
    List, ListItem, ListItemText, Button
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { getBackendUrl } from '../../config';
import TossPaymentsModal from "../payment/TossPaymentsModal.tsx";

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

    if (loading) {
        return <CircularProgress />;
    }

    if (error) {
        return <Typography color="error">{error}</Typography>;
    }

    return (
        <Container maxWidth="lg" sx={{ mt: 4 }}>
            <Grid container spacing={3}>
                <Grid item xs={12} md={3}>
                    <Paper elevation={3}>
                        <List component="nav">
                            <SidebarItem>
                                <ListItemText primary="사용자 정보" />
                            </SidebarItem>
                        </List>
                    </Paper>
                </Grid>
                <Grid item xs={12} md={9}>
                    <ContentPaper elevation={3}>
                        <Box>
                            <Typography variant="h6" gutterBottom>사용자 정보</Typography>
                            <Typography><strong>닉네임:</strong> {userInfo?.nickname}</Typography>
                            <Typography><strong>이메일:</strong> {userInfo?.email}</Typography>
                            <Typography><strong>로그인 방식:</strong> {userInfo?.oauthProvider}</Typography>
                            <Box display="flex" alignItems="center" mt={2}>
                                <Typography><strong>포인트:</strong> {userInfo?.point}</Typography>
                                <Button variant="contained" color="primary" size="small" sx={{ ml: 2 }} onClick={() => setIsChargeModalOpen(true)}>
                                    포인트 충전
                                </Button>
                            </Box>
                        </Box>
                    </ContentPaper>
                </Grid>
            </Grid>
            <TossPaymentsModal
                open={isChargeModalOpen}
                onClose={() => setIsChargeModalOpen(false)}
                nickname={userInfo?.nickname ?? null}
            />
        </Container>
    );
};

export default MyPage;