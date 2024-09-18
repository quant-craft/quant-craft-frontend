import React, { useState, useEffect } from 'react';
import { Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import { getBackendUrl } from '../../config';

interface PaymentTransaction {
    id: number;
    userId: number;
    amount: string; // BigDecimal을 문자열로 처리
    status: string;
    createdAt: string;
    updatedAt: string;
}

interface PaymentTxnsResponse {
    paymentTxns: PaymentTransaction[];
}

const PaymentHistoryTab: React.FC = () => {
    const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchPaymentHistory = async () => {
            const accessToken = localStorage.getItem('accessToken');
            if (!accessToken) {
                throw new Error('로그인이 필요합니다.');
            }

            try {
                const response = await fetch(`${getBackendUrl()}/api/payment/txns`, {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                    },
                });

                if (!response.ok) {
                    throw new Error('결제 내역을 가져오는데 실패했습니다.');
                }

                const data: PaymentTxnsResponse = await response.json();
                console.log('Received payment data:', data);

                if (data && Array.isArray(data.paymentTxns)) {
                    setTransactions(data.paymentTxns);
                } else {
                    console.error('Expected paymentTxns array, but received:', data);
                    setTransactions([]);
                }
            } catch (err) {
                console.error('Error fetching payment history:', err);
                setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
            } finally {
                setLoading(false);
            }
        };

        fetchPaymentHistory();
    }, []);

    const formatDateTime = (dateTimeString: string) => {
        const date = new Date(dateTimeString);
        return date.toLocaleString('ko-KR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });
    };

    const formatAmount = (amount: string, status: string) => {
        const formattedAmount = new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(Number(amount));
        return status === 'DONE' ? `+${formattedAmount}` : `-${formattedAmount}`;
    };

    const getStatusText = (status: string) => {
        return status === 'DONE' ? '결제완료' : '결제취소';
    };

    if (loading) return <Typography>로딩 중...</Typography>;
    if (error) return <Typography color="error">{error}</Typography>;

    return (
        <>
            <Typography variant="h6" gutterBottom>결제 내역</Typography>
            {transactions.length > 0 ? (
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>날짜</TableCell>
                                <TableCell>내용</TableCell>
                                <TableCell align="right">금액</TableCell>
                                <TableCell>결제 ID</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {transactions.map((txn) => (
                                <TableRow key={txn.id}>
                                    <TableCell>{formatDateTime(txn.createdAt)}</TableCell>
                                    <TableCell>{getStatusText(txn.status)}</TableCell>
                                    <TableCell align="right" style={{ color: txn.status === 'DONE' ? 'green' : 'red' }}>
                                        {formatAmount(txn.amount, txn.status)}
                                    </TableCell>
                                    <TableCell>{txn.id}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            ) : (
                <Typography>결제 내역이 없습니다.</Typography>
            )}
        </>
    );
};

export default PaymentHistoryTab;