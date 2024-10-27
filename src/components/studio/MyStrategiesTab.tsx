import React, { useState, useEffect } from 'react';
import { Typography, CircularProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import { getBackendUrl } from '../../config';

interface User {
    id: number;
    nickname: string;
    email: string;
    oauthProvider: string;
    point: number;
}

interface Strategy {
    id: number;
    name: string;
    description: string;
    leverage: number;
    exclusiveOrders: boolean;
    hedgeMode: boolean;
    timeframe: string;
    symbol: string;
    exchange: string;
}

interface UserStrategyResponse {
    user: User;
    strategies: Strategy[];
}

const MyStrategiesTab: React.FC = () => {
    const [userStrategies, setUserStrategies] = useState<UserStrategyResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchMyStrategies = async () => {
            const accessToken = localStorage.getItem('accessToken');
            if (!accessToken) {
                setError('로그인이 필요합니다.');
                setLoading(false);
                return;
            }

            try {
                const response = await fetch(`${getBackendUrl()}/api/users/strategies`, {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                    },
                });

                if (!response.ok) {
                    throw new Error('전략 목록을 가져오는데 실패했습니다.');
                }

                const data: UserStrategyResponse = await response.json();
                setUserStrategies(data);
            } catch (err) {
                console.error('Error fetching strategies:', err);
                setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
            } finally {
                setLoading(false);
            }
        };

        fetchMyStrategies();
    }, []);

    if (loading) return <CircularProgress />;
    if (error) return <Typography color="error">{error}</Typography>;
    if (!userStrategies) return <Typography>전략 정보를 불러올 수 없습니다.</Typography>;

    return (
        <>
            <Typography variant="h6" gutterBottom>나의 전략</Typography>
            {userStrategies.strategies.length > 0 ? (
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>이름</TableCell>
                                <TableCell>설명</TableCell>
                                <TableCell>레버리지</TableCell>
                                <TableCell>독점 주문</TableCell>
                                <TableCell>헤지 모드</TableCell>
                                <TableCell>타임프레임</TableCell>
                                <TableCell>심볼</TableCell>
                                <TableCell>거래소</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {userStrategies.strategies.map((strategy) => (
                                <TableRow key={strategy.id}>
                                    <TableCell>{strategy.name}</TableCell>
                                    <TableCell>{strategy.description}</TableCell>
                                    <TableCell>{strategy.leverage}</TableCell>
                                    <TableCell>{strategy.exclusiveOrders ? '예' : '아니오'}</TableCell>
                                    <TableCell>{strategy.hedgeMode ? '예' : '아니오'}</TableCell>
                                    <TableCell>{strategy.timeframe}</TableCell>
                                    <TableCell>{strategy.symbol}</TableCell>
                                    <TableCell>{strategy.exchange}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            ) : (
                <Typography>보유한 전략이 없습니다.</Typography>
            )}
        </>
    );
};

export default MyStrategiesTab;