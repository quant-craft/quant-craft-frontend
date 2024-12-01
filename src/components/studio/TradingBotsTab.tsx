import React, { useState, useEffect } from 'react';
import {
    Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Paper, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Box,
    CircularProgress, Snackbar, Alert, FormControlLabel, Switch, Select, MenuItem,
    FormControl, InputLabel
} from '@mui/material';
import { getBackendUrl } from '../../config';
import TradingMonitoring from './TradingMonitoring';

interface TradingBot {
    id: number;
    name: string;
    dryRun: boolean;
    cash: number;
    status: TradingBotStatus;
    userId: number;
    exchangeApiKeyId: number;
    strategyId: number;
    version: number;
}

interface ExchangeApiKey {
    id: number;
    exchange: string;
    apiKey: string;
    secretKey: string;
    userId: number;
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
    user: any;
    strategies: Strategy[];
}

enum TradingBotStatus {
    PENDING = 'PENDING',
    RUNNING = 'RUNNING',
    STOPPING = 'STOPPING',
    STOPPED = 'STOPPED'
}

const TradingBotsTab: React.FC = () => {
    const [tradingBots, setTradingBots] = useState<TradingBot[]>([]);
    const [exchangeApiKeys, setExchangeApiKeys] = useState<ExchangeApiKey[]>([]);
    const [strategies, setStrategies] = useState<Strategy[]>([]);
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [monitoringOpen, setMonitoringOpen] = useState(false);
    const [selectedBotId, setSelectedBotId] = useState<number | null>(null);
    const [newBot, setNewBot] = useState<Partial<TradingBot>>({
        name: '',
        dryRun: false,
        cash: 0,
        status: TradingBotStatus.PENDING,
        exchangeApiKeyId: 0,
        strategyId: 0
    });

    useEffect(() => {
        Promise.all([
            fetchTradingBots(),
            fetchExchangeApiKeys(),
            fetchStrategies()
        ]);
    }, []);

    const fetchTradingBots = async () => {
        const accessToken = localStorage.getItem('accessToken');
        if (!accessToken) {
            setError('로그인이 필요합니다.');
            return;
        }

        try {
            const response = await fetch(`${getBackendUrl()}/api/users/trading-bots`, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                },
            });

            if (!response.ok) {
                throw new Error('트레이딩 봇 목록을 가져오는데 실패했습니다.');
            }

            const data: TradingBot[] = await response.json();
            setTradingBots(data);
        } catch (err) {
            console.error('Error fetching trading bots:', err);
            setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
        }
    };

    const fetchExchangeApiKeys = async () => {
        const accessToken = localStorage.getItem('accessToken');
        if (!accessToken) return;

        try {
            const response = await fetch(`${getBackendUrl()}/api/exchange-api-keys/list`, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                },
            });

            if (!response.ok) {
                throw new Error('거래소 API 키 목록을 가져오는데 실패했습니다.');
            }

            const data: ExchangeApiKey[] = await response.json();
            setExchangeApiKeys(data);
        } catch (err) {
            console.error('Error fetching exchange API keys:', err);
        }
    };

    const fetchStrategies = async () => {
        const accessToken = localStorage.getItem('accessToken');
        if (!accessToken) return;

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
            setStrategies(data.strategies);
        } catch (err) {
            console.error('Error fetching strategies:', err);
        }
    };

    const handleCreate = async () => {
        setLoading(true);
        const accessToken = localStorage.getItem('accessToken');
        if (!accessToken) {
            setError('로그인이 필요합니다.');
            setLoading(false);
            return;
        }

        try {
            const response = await fetch(`${getBackendUrl()}/api/trading-bots`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newBot),
            });

            if (!response.ok) {
                throw new Error('트레이딩 봇 생성에 실패했습니다.');
            }

            await fetchTradingBots();
            setOpen(false);
            setNewBot({
                name: '',
                dryRun: false,
                cash: 0,
                status: TradingBotStatus.PENDING,
                exchangeApiKeyId: 0,
                strategyId: 0
            });
            setSuccessMessage('트레이딩 봇이 성공적으로 생성되었습니다.');
        } catch (err) {
            console.error('Error creating trading bot:', err);
            setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        setLoading(true);
        const accessToken = localStorage.getItem('accessToken');
        if (!accessToken) {
            setError('로그인이 필요합니다.');
            setLoading(false);
            return;
        }

        try {
            const response = await fetch(`${getBackendUrl()}/api/trading-bots/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                },
            });

            if (!response.ok) {
                throw new Error('트레이딩 봇 삭제에 실패했습니다.');
            }

            await fetchTradingBots();
            setSuccessMessage('트레이딩 봇이 성공적으로 삭제되었습니다.');
        } catch (err) {
            console.error('Error deleting trading bot:', err);
            setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'PENDING':
                return '대기 중';
            case 'RUNNING':
                return '실행 중';
            case 'STOPPING':
                return '정지 중';
            case 'STOPPED':
                return '정지됨';
            default:
                return status;
        }
    };

    if (loading) return <CircularProgress />;

    return (
        <>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">트레이딩 봇 관리</Typography>
                <Button variant="contained" color="primary" onClick={() => setOpen(true)}>
                    새 트레이딩 봇 추가
                </Button>
            </Box>

            {tradingBots.length > 0 ? (
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>이름</TableCell>
                                <TableCell>모의 거래</TableCell>
                                <TableCell>예치금</TableCell>
                                <TableCell>상태</TableCell>
                                <TableCell>거래소 API</TableCell>
                                <TableCell>전략</TableCell>
                                <TableCell>작업</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {tradingBots.map((bot) => (
                                <TableRow key={bot.id}>
                                    <TableCell>{bot.name}</TableCell>
                                    <TableCell>{bot.dryRun ? '예' : '아니오'}</TableCell>
                                    <TableCell>{bot.cash.toLocaleString()}</TableCell>
                                    <TableCell>{getStatusText(bot.status)}</TableCell>
                                    <TableCell>
                                        {exchangeApiKeys.find(key => key.id === bot.exchangeApiKeyId)?.exchange || bot.exchangeApiKeyId}
                                    </TableCell>
                                    <TableCell>
                                        {strategies.find(strategy => strategy.id === bot.strategyId)?.name || bot.strategyId}
                                    </TableCell>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', gap: 1 }}>
                                            <Button
                                                variant="outlined"
                                                color="primary"
                                                onClick={() => {
                                                    setSelectedBotId(bot.id);
                                                    setMonitoringOpen(true);
                                                }}
                                            >
                                                모니터링
                                            </Button>
                                            <Button
                                                variant="outlined"
                                                color="error"
                                                onClick={() => handleDelete(bot.id)}
                                            >
                                                삭제
                                            </Button>
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            ) : (
                <Typography>등록된 트레이딩 봇이 없습니다.</Typography>
            )}

            {/* 새 트레이딩 봇 추가 다이얼로그 */}
            <Dialog open={open} onClose={() => setOpen(false)}>
                <DialogTitle>새 트레이딩 봇 추가</DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                        <TextField
                            label="이름"
                            value={newBot.name}
                            onChange={(e) => setNewBot({ ...newBot, name: e.target.value })}
                        />
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={newBot.dryRun}
                                    onChange={(e) => setNewBot({ ...newBot, dryRun: e.target.checked })}
                                />
                            }
                            label="모의 거래"
                        />
                        <TextField
                            label="예치금"
                            type="number"
                            value={newBot.cash}
                            onChange={(e) => setNewBot({ ...newBot, cash: Number(e.target.value) })}
                        />

                        <FormControl fullWidth>
                            <InputLabel>거래소 API 키</InputLabel>
                            <Select
                                value={newBot.exchangeApiKeyId || ''}
                                label="거래소 API 키"
                                onChange={(e) => setNewBot({ ...newBot, exchangeApiKeyId: Number(e.target.value) })}
                            >
                                {exchangeApiKeys.map((key) => (
                                    <MenuItem key={key.id} value={key.id}>
                                        {key.exchange} - {key.apiKey}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <FormControl fullWidth>
                            <InputLabel>전략</InputLabel>
                            <Select
                                value={newBot.strategyId || ''}
                                label="전략"
                                onChange={(e) => setNewBot({ ...newBot, strategyId: Number(e.target.value) })}
                            >
                                {strategies.map((strategy) => (
                                    <MenuItem key={strategy.id} value={strategy.id}>
                                        {strategy.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <FormControl fullWidth>
                            <InputLabel>상태</InputLabel>
                            <Select
                                value={newBot.status || TradingBotStatus.PENDING}
                                label="상태"
                                onChange={(e) => setNewBot({ ...newBot, status: e.target.value as TradingBotStatus })}
                            >
                                {Object.values(TradingBotStatus).map((status) => (
                                    <MenuItem key={status} value={status}>
                                        {getStatusText(status)}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpen(false)}>취소</Button>
                    <Button onClick={handleCreate}>추가</Button>
                </DialogActions>
            </Dialog>

            {/* 모니터링 다이얼로그 */}
            <TradingMonitoring
                open={monitoringOpen}
                onClose={() => setMonitoringOpen(false)}
                botId={selectedBotId!}
            />

            {/* 에러 메시지 스낵바 */}
            <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError(null)}>
                <Alert onClose={() => setError(null)} severity="error" sx={{ width: '100%' }}>
                    {error}
                </Alert>
            </Snackbar>

            {/* 성공 메시지 스낵바 */}
            <Snackbar open={!!successMessage} autoHideDuration={6000} onClose={() => setSuccessMessage(null)}>
                <Alert onClose={() => setSuccessMessage(null)} severity="success" sx={{ width: '100%' }}>
                    {successMessage}
                </Alert>
            </Snackbar>
        </>
    );
};

export default TradingBotsTab;