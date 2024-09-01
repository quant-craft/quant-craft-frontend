import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CircularProgress, Typography, Container, Paper, Button } from '@mui/material';
import { getBackendUrl } from "../../config";

const TossPaymentSuccessCallback: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const confirmPayment = async () => {
            const paymentKey = searchParams.get('paymentKey');
            const orderId = searchParams.get('orderId');
            const amount = searchParams.get('amount');

            if (!paymentKey || !orderId || !amount) {
                throw new Error('Missing payment information in URL parameters');
            }

            const accessToken = localStorage.getItem('accessToken');
            if (!accessToken) {
                throw new Error('로그인이 필요합니다.');
            }

            try {
                const chargeResponse = await fetch(`${getBackendUrl()}/api/points/charge`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${accessToken}`
                    },
                    body: JSON.stringify({ paymentKey, orderId, amount: parseInt(amount) }),
                });

                if (!chargeResponse.ok) {
                    throw new Error('포인트 충전에 실패했습니다.');
                }
                setLoading(false);
            } catch (error) {
                if (error instanceof Error) {
                    setError(error.message);
                } else {
                    setError('알 수 없는 오류가 발생했습니다.');
                }
                setLoading(false);
            }
        };

        confirmPayment();
    }, [searchParams]);

    if (loading) {
        return (
            <Container maxWidth="sm" sx={{ mt: 4, textAlign: 'center' }}>
                <CircularProgress />
                <Typography variant="h6" sx={{ mt: 2 }}>결제를 처리 중입니다...</Typography>
            </Container>
        );
    }

    if (error) {
        return (
            <Container maxWidth="sm" sx={{ mt: 4 }}>
                <Paper elevation={3} sx={{ p: 3, textAlign: 'center' }}>
                    <Typography variant="h6" color="error">{error}</Typography>
                    <Button variant="contained" color="primary" onClick={() => navigate('/mypage')} sx={{ mt: 2 }}>
                        마이페이지로 돌아가기
                    </Button>
                </Paper>
            </Container>
        );
    }

    return (
        <Container maxWidth="sm" sx={{ mt: 4 }}>
            <Paper elevation={3} sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="h6" color="primary">결제가 성공적으로 완료되었습니다!</Typography>
                <Typography variant="body1" sx={{ mt: 2 }}>
                    포인트가 충전되었습니다.
                </Typography>
                <Button variant="contained" color="primary" onClick={() => navigate('/mypage')} sx={{ mt: 2 }}>
                    마이페이지로 돌아가기
                </Button>
            </Paper>
        </Container>
    );
};

export default TossPaymentSuccessCallback;