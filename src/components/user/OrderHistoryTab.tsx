import React, { useState, useEffect } from 'react';
import { Typography, CircularProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import { getBackendUrl } from '../../config';

interface OrderItem {
    id: number;
    strategyItem: {
        id: number;
        name: string;
    };
}

interface Order {
    id: number;
    status: string;
    totalPrice: number;
    orderItem: OrderItem;
    createdAt: string;
    canceledAt: string | null;
}

const OrderHistoryTab: React.FC = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchOrders = async () => {
            const accessToken = localStorage.getItem('accessToken');
            if (!accessToken) {
                setError('로그인이 필요합니다.');
                setLoading(false);
                return;
            }

            try {
                const response = await fetch(`${getBackendUrl()}/api/orders`, {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                    },
                });

                if (!response.ok) {
                    throw new Error('주문 내역을 가져오는데 실패했습니다.');
                }

                const data: Order[] = await response.json();
                setOrders(data);
            } catch (err) {
                console.error('Error fetching orders:', err);
                setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
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

    if (loading) return <CircularProgress />;
    if (error) return <Typography color="error">{error}</Typography>;

    return (
        <>
            <Typography variant="h6" gutterBottom>주문 내역</Typography>
            {orders.length > 0 ? (
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>주문 ID</TableCell>
                                <TableCell>상품명</TableCell>
                                <TableCell>상태</TableCell>
                                <TableCell>가격</TableCell>
                                <TableCell>주문일시</TableCell>
                                <TableCell>취소일시</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {orders.map((order) => (
                                <TableRow key={order.id}>
                                    <TableCell>{order.id}</TableCell>
                                    <TableCell>{order.orderItem.strategyItem.name}</TableCell>
                                    <TableCell>{order.status}</TableCell>
                                    <TableCell>{order.totalPrice}</TableCell>
                                    <TableCell>{formatDateTime(order.createdAt)}</TableCell>
                                    <TableCell>{order.canceledAt ? formatDateTime(order.canceledAt) : '-'}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            ) : (
                <Typography>주문 내역이 없습니다.</Typography>
            )}
        </>
    );
};

export default OrderHistoryTab;