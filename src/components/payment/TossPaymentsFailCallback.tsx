import React from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Typography, Container, Paper, Button } from '@mui/material';

const TossPaymentFailCallback: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const errorCode = searchParams.get('code');
    const errorMessage = searchParams.get('message');

    return (
        <Container maxWidth="sm" sx={{ mt: 4 }}>
            <Paper elevation={3} sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="h6" color="error">결제에 실패했습니다.</Typography>
                {errorCode && (
                    <Typography variant="body1" sx={{ mt: 2 }}>
                        오류 코드: {errorCode}
                    </Typography>
                )}
                {errorMessage && (
                    <Typography variant="body1" sx={{ mt: 1 }}>
                        오류 메시지: {errorMessage}
                    </Typography>
                )}
                <Button variant="contained" color="primary" onClick={() => navigate('/mypage')} sx={{ mt: 2 }}>
                    마이페이지로 돌아가기
                </Button>
            </Paper>
        </Container>
    );
};

export default TossPaymentFailCallback;