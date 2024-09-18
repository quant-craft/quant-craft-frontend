import React, { useState, useEffect } from 'react';
import { Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import { getBackendUrl } from '../../config';

interface PointTransaction {
    id: number;
    userId: number;
    point: number;
    status: string;
    createdAt: string;
    updatedAt: string;
}

interface PointTxnsResponse {
    pointTxns: PointTransaction[];
}

interface PointInfoTabProps {
    userPoint: number;
    onChargeClick: () => void;
}

const PointInfoTab: React.FC<PointInfoTabProps> = ({ userPoint, onChargeClick }) => {
    const [transactions, setTransactions] = useState<PointTransaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchPointHistory = async () => {
            const accessToken = localStorage.getItem('accessToken');
            if (!accessToken) {
                throw new Error('로그인이 필요합니다.');
            }

            try {
                const response = await fetch(`${getBackendUrl()}/api/points/txns`, {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                    },
                });

                if (!response.ok) {
                    throw new Error('포인트 내역을 가져오는데 실패했습니다.');
                }

                const data: PointTxnsResponse = await response.json();
                console.log('Received data:', data);

                if (data && Array.isArray(data.pointTxns)) {
                    setTransactions(data.pointTxns);
                } else {
                    console.error('Expected pointTxns array, but received:', data);
                    setTransactions([]);
                }
            } catch (err) {
                console.error('Error fetching point history:', err);
                setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
            } finally {
                setLoading(false);
            }
        };

        fetchPointHistory();
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

    if (loading) return <Typography>로딩 중...</Typography>;
    if (error) return <Typography color="error">{error}</Typography>;

    return (
        <>
            <Typography variant="h6" gutterBottom>포인트 정보</Typography>
            <Typography><strong>현재 포인트:</strong> {userPoint}</Typography>
            <Button variant="contained" color="primary" size="small" sx={{ my: 2 }} onClick={onChargeClick}>
                포인트 충전
            </Button>
            {transactions.length > 0 ? (
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>날짜</TableCell>
                                <TableCell>내용</TableCell>
                                <TableCell align="right">포인트</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {transactions.map((txn) => (
                                <TableRow key={txn.id}>
                                    <TableCell>{formatDateTime(txn.createdAt)}</TableCell>
                                    <TableCell>{txn.status === 'CHARGE' ? '충전' : '사용'}</TableCell>
                                    <TableCell align="right" style={{ color: txn.status === 'CHARGE' ? 'green' : 'red' }}>
                                        {txn.status === 'CHARGE' ? '+' : '-'}{txn.point}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            ) : (
                <Typography>포인트 거래 내역이 없습니다.</Typography>
            )}
        </>
    );
};

export default PointInfoTab;