import React, { useState } from 'react';
import {
    Typography, Button, Box, Grid, Paper,
    TextField, Alert, CircularProgress, Card, CardContent
} from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getBackendUrl } from '../../config';

interface BackTestingResult {
    id: number;
    strategyId: string;
    strategyName: string;
    startDate: string;
    endDate: string;
    initialCapital: number;
    finalEquity: number;
    totalReturn: number;
    maxDrawdown: number;
    winRate: number;
    profitFactor: number;
    totalTrades: number;
    trades: string;
    equityCurve: string;
}

const BackTestingTab: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<BackTestingResult | null>(null);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [strategyId, setStrategyId] = useState('');
    const [cash, setCash] = useState('1000000');
    const [commission, setCommission] = useState('0.0004');

    const handleRunBacktest = async () => {
        if (!startDate || !endDate || !strategyId || !cash) {
            setError('모든 필드를 입력해주세요.');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const accessToken = localStorage.getItem('accessToken');
            if (!accessToken) {
                setError('로그인이 필요합니다.');
                return;
            }

            const response = await fetch(`${getBackendUrl()}/api/backtestings/run`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    startDate: startDate,
                    endDate: endDate,
                    strategyId,
                    cash: parseFloat(cash),
                    commission: parseFloat(commission)
                }),
            });

            if (!response.ok) {
                throw new Error('백테스팅 실행 중 오류가 발생했습니다.');
            }

            const data = await response.json();
            setResult(data);
        } catch (err) {
            console.error('Error running backtest:', err);
            setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };

    const parseEquityCurve = (equityCurve: string) => {
        try {
            return JSON.parse(equityCurve);
        } catch {
            return [];
        }
    };

    const parseTrades = (trades: string) => {
        try {
            return JSON.parse(trades);
        } catch {
            return [];
        }
    };

    const renderMetrics = () => {
        if (!result) return null;

        return (
            <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>수익률</Typography>
                            <Typography variant="h4" color={result.totalReturn >= 0 ? "primary" : "error"}>
                                {result.totalReturn.toFixed(2)}%
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>승률</Typography>
                            <Typography variant="h4" color="primary">
                                {result.winRate.toFixed(2)}%
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>최대 낙폭</Typography>
                            <Typography variant="h4" color="error">
                                {result.maxDrawdown.toFixed(2)}%
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        );
    };

    const renderEquityCurve = () => {
        if (!result?.equityCurve) return null;

        const data = parseEquityCurve(result.equityCurve);

        return (
            <Paper sx={{ p: 2, mt: 2 }}>
                <Typography variant="h6" gutterBottom>자산 곡선</Typography>
                <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="index" />
                        <YAxis />
                        <Tooltip />
                        <Line
                            type="monotone"
                            dataKey="Equity"
                            stroke="#8884d8"
                            dot={false}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </Paper>
        );
    };

    const renderTrades = () => {
        if (!result?.trades) return null;

        const trades = parseTrades(result.trades);

        return (
            <Paper sx={{ p: 2, mt: 2 }}>
                <Typography variant="h6" gutterBottom>거래 내역</Typography>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={trades}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="EntryTime" />
                        <YAxis />
                        <Tooltip />
                        <Line
                            type="monotone"
                            dataKey="PnL"
                            stroke="#82ca9d"
                            dot={false}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </Paper>
        );
    };

    return (
        <Box>
            <Typography variant="h6" gutterBottom>백테스팅</Typography>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
            )}

            <Paper sx={{ p: 2, mb: 2 }}>
                <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                        <TextField
                            label="시작일"
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            fullWidth
                            InputLabelProps={{
                                shrink: true,
                            }}
                        />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <TextField
                            label="종료일"
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            fullWidth
                            InputLabelProps={{
                                shrink: true,
                            }}
                        />
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <TextField
                            label="전략 ID"
                            value={strategyId}
                            onChange={(e) => setStrategyId(e.target.value)}
                            fullWidth
                        />
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <TextField
                            label="초기 자본"
                            value={cash}
                            onChange={(e) => setCash(e.target.value)}
                            type="number"
                            fullWidth
                        />
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <TextField
                            label="수수료율"
                            value={commission}
                            onChange={(e) => setCommission(e.target.value)}
                            type="number"
                            fullWidth
                        />
                    </Grid>
                </Grid>

                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                        variant="contained"
                        onClick={handleRunBacktest}
                        disabled={loading}
                    >
                        {loading ? <CircularProgress size={24} /> : '백테스트 실행'}
                    </Button>
                </Box>
            </Paper>

            {result && (
                <>
                    {renderMetrics()}
                    {renderEquityCurve()}
                    {renderTrades()}
                </>
            )}
        </Box>
    );
};

export default BackTestingTab;