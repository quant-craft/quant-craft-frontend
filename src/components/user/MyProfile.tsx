import React, { useState, useEffect } from 'react';
import {
    Container, Typography, Paper, Box, CircularProgress, Grid,
    List, ListItem, ListItemText
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { getBackendUrl } from '../../config';

interface UserInfo {
    id: number;
    nickname: string;
    email: string;
    oauthProvider: string;
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
                            <Typography><strong>ID:</strong> {userInfo?.id}</Typography>
                            <Typography><strong>닉네임:</strong> {userInfo?.nickname}</Typography>
                            <Typography><strong>이메일:</strong> {userInfo?.email}</Typography>
                            <Typography><strong>로그인 방식:</strong> {userInfo?.oauthProvider}</Typography>
                        </Box>
                    </ContentPaper>
                </Grid>
            </Grid>
        </Container>
    );
};

export default MyPage;