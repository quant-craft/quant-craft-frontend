import React, { useState, useEffect } from 'react';
import {
    Container, Typography, Paper, Box, CircularProgress, Grid,
    List, ListItem, ListItemText, Button, Modal, TextField
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { getBackendUrl } from '../../config';

interface UserInfo {
    nickname: string;
    email: string;
    oauthProvider: string;
    point: number;
}

interface PointChargeModalProps {
    open: boolean;
    onClose: () => void;
    onCharge: (amount: number) => void;
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

const PointChargeModal: React.FC<PointChargeModalProps> = ({ open, onClose, onCharge }) => {
    const [chargeAmount, setChargeAmount] = useState<number>(5000);
    const [inputError, setInputError] = useState<string>('');

    const handleCharge = () => {
        if (chargeAmount >= 5000) {
            onCharge(chargeAmount);
            onClose();
        } else {
            setInputError('최소 충전 금액은 5,000원입니다.');
        }
    };

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        if (/^\d*$/.test(value)) {
            const numericValue = parseInt(value, 10);
            setChargeAmount(isNaN(numericValue) ? 0 : numericValue);
            if (value === '') {
                setInputError('');
            } else if (numericValue < 5000) {
                setInputError('최소 충전 금액은 5,000원입니다.');
            } else {
                setInputError('');
            }
        }
    };

    const incrementAmount = (amount: number) => {
        setChargeAmount(prevAmount => {
            const newAmount = prevAmount + amount;
            setInputError(newAmount < 5000 ? '최소 충전 금액은 5,000원입니다.' : '');
            return newAmount;
        });
    };

    return (
        <Modal open={open} onClose={onClose}>
            <Box sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: 400,
                bgcolor: 'background.paper',
                boxShadow: 24,
                p: 4,
            }}>
                <Typography variant="h6" component="h2" gutterBottom>
                    포인트 충전
                </Typography>
                <Typography gutterBottom>
                    다양한 서비스 이용을 위해 포인트 충전을 할 수 있습니다.
                </Typography>
                <Box mt={2}>
                    <Typography>충전(결제) 금액 (단위 원)</Typography>
                    <TextField
                        fullWidth
                        type="number"
                        value={chargeAmount || ''}
                        onChange={handleInputChange}
                        error={!!inputError}
                        helperText={inputError}
                        inputProps={{ min: 5000 }}
                    />
                </Box>
                <Box mt={2} display="flex" justifyContent="space-between">
                    <Button variant="outlined" onClick={() => incrementAmount(5000)}>+5,000</Button>
                    <Button variant="outlined" onClick={() => incrementAmount(10000)}>+10,000</Button>
                    <Button variant="outlined" onClick={() => incrementAmount(50000)}>+50,000</Button>
                </Box>
                <Box mt={2}>
                    <Typography>충전 예정 포인트</Typography>
                    <Typography variant="h5" color="primary">
                        {chargeAmount.toLocaleString()}P
                    </Typography>
                </Box>
                <Box mt={2} display="flex" justifyContent="flex-end">
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleCharge}
                        disabled={chargeAmount < 5000}
                    >
                        결제하기
                    </Button>
                </Box>
            </Box>
        </Modal>
    );
};

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

    const handleChargePoints = async (amount: number) => {
        // Here you would typically integrate with a payment gateway
        // For this example, we'll just update the local state
        setUserInfo(prevInfo => prevInfo ? {...prevInfo, point: prevInfo.point + amount} : null);
        // In a real application, you'd also want to update this on the server
    };

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
            <PointChargeModal
                open={isChargeModalOpen}
                onClose={() => setIsChargeModalOpen(false)}
                onCharge={handleChargePoints}
            />
        </Container>
    );
};

export default MyPage;