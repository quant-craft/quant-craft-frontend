import React, { useState, useEffect } from 'react';
import {
    Typography, Box, Button, Modal, TextField
} from '@mui/material';
import { getTossPaymentsClientKey } from '../../config';

interface TossPaymentsInstance {
    requestPayment(
        method: string,
        options: {
            amount: number;
            orderId: string;
            orderName: string;
            customerName: string;
            successUrl: string;
            failUrl: string;
        }
    ): Promise<void>;
}

declare global {
    interface Window {
        TossPayments?: (clientKey: string) => TossPaymentsInstance;
    }
}

interface PointChargeModalProps {
    open: boolean;
    onClose: () => void;
    nickname: string | null;
}

const TossPaymentsModal: React.FC<PointChargeModalProps> = ({ open, onClose, nickname }) => {
    const [chargeAmount, setChargeAmount] = useState<number>(5000);
    const [inputError, setInputError] = useState<string>('');

    useEffect(() => {
        const script = document.createElement('script');
        script.src = 'https://js.tosspayments.com/v1/payment';
        script.async = true;
        document.body.appendChild(script);

        return () => {
            document.body.removeChild(script);
        };
    }, []);

    const handleCharge = () => {
        if (chargeAmount >= 5000) {
            const clientKey = getTossPaymentsClientKey();
            if (window.TossPayments) {
                const tossPayments = window.TossPayments(clientKey);
                tossPayments.requestPayment('카드', {
                    amount: chargeAmount,
                    orderId: 'POINT-CHARGE-' + Date.now(),
                    orderName: '포인트 충전',
                    customerName: nickname || '사용자',
                    successUrl: `${window.location.origin}/toss-payment-success`,
                    failUrl: `${window.location.origin}/toss-payment-fail`,
                }).catch((error: Error) => {
                    if (error.name === 'USER_CANCEL') {
                        console.log('사용자가 결제를 취소했습니다.');
                    } else {
                        console.error('결제 오류:', error);
                    }
                });
                onClose();
            } else {
                console.error('TossPayments is not loaded');
            }
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

export default TossPaymentsModal;