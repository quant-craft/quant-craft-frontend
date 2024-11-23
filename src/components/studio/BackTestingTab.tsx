import React, { useEffect, useRef, useState } from 'react';
import { createChart, IChartApi, DeepPartial, ChartOptions } from 'lightweight-charts';
import {
    Typography,
    Button,
    Box,
    Grid,
    Paper,
    TextField,
    Alert,
    CircularProgress,
    Card,
    CardContent
} from '@mui/material';
import { styled } from '@mui/material/styles';
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

interface ChartData {
    time: string;
    value: number;
    drawdown?: number;
}

interface TradeData {
    time: string;
    price: number;
    size: number;
    pnl: number;
    color: string;
}

interface TradeItem {
    Size: number;
    EntryBar: number;
    ExitBar: number;
    EntryPrice: number;
    ExitPrice: number;
    PnL: number;
    ReturnPct: number;
    EntryTime: string;
    ExitTime: string;
    Duration: string;
}

interface EquityCurveItem {
    Equity: number;
    DrawdownPct: number;
    DrawdownDuration: string;
}

const ChartContainer = styled('div')`
    width: 100%;
    height: 400px;
`;

const TradesChartContainer = styled('div')`
    width: 100%;
    height: 300px;
`;

const chartConfig: DeepPartial<ChartOptions> = {
    layout: {
        background: { color: '#ffffff' },
        textColor: '#333333',
    },
    grid: {
        vertLines: { color: '#f0f0f0' },
        horzLines: { color: '#f0f0f0' },
    },
    crosshair: {
        mode: 1,
        vertLine: {
            width: 1,
            color: '#758696',
            style: 3,
        },
        horzLine: {
            width: 1,
            color: '#758696',
            style: 3,
        },
    },
    rightPriceScale: {
        borderColor: '#dfdfdf',
        scaleMargins: {
            top: 0.1,
            bottom: 0.1,
        },
    },
    timeScale: {
        borderColor: '#dfdfdf',
        timeVisible: true,
        secondsVisible: false,
        fixLeftEdge: true,
        fixRightEdge: true,
        tickMarkFormatter: (time: number) => {
            const date = new Date(time * 1000);
            return date.toLocaleDateString('ko-KR', {
                month: 'numeric',
                day: 'numeric',
                hour: 'numeric',
                minute: 'numeric'
            });
        }
    },
    handleScroll: {
        mouseWheel: true,
        pressedMouseMove: true,
        horzTouchDrag: true,
        vertTouchDrag: true,
    },
    handleScale: {
        axisPressedMouseMove: true,
        mouseWheel: true,
        pinch: true,
    },
};

const BackTestingTab: React.FC = () => {
    // Refs
    const equityChartRef = useRef<HTMLDivElement>(null);
    const tradesChartRef = useRef<HTMLDivElement>(null);
    const chartInstanceRef = useRef<IChartApi | null>(null);
    const tradesChartInstanceRef = useRef<IChartApi | null>(null);

    // State
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<BackTestingResult | null>(null);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [strategyId, setStrategyId] = useState('');
    const [cash, setCash] = useState('1000000');
    const [commission, setCommission] = useState('0.0004');

    // Data Parsing Functions
    const parseEquityCurve = (equityCurve: string): ChartData[] => {
        try {
            const data = JSON.parse(equityCurve);
            return data.map((item: EquityCurveItem) => {
                // 각 데이터 포인트마다 timestamp를 정확하게 생성
                let dateStr = item.DrawdownDuration;
                if (dateStr === "NaT") {
                    // 첫 데이터 포인트의 경우 시작일을 사용
                    dateStr = startDate;
                } else {
                    // DrawdownDuration에서 날짜 부분만 추출
                    dateStr = dateStr.split(' ')[0];
                }

                return {
                    time: dateStr,
                    value: item.Equity,
                    drawdown: item.DrawdownPct * 100
                };
            });
        } catch (error) {
            console.error('Error parsing equity curve:', error);
            return [];
        }
    };

    const parseTrades = (trades: string): TradeData[] => {
        try {
            const data = JSON.parse(trades);
            return data.map((trade: TradeItem) => {
                // EntryTime에서 정확한 날짜와 시간 추출
                const entryDate = new Date(trade.EntryTime);
                const dateStr = entryDate.toISOString().split('T')[0]; // YYYY-MM-DD 형식

                return {
                    time: dateStr,
                    price: trade.EntryPrice,
                    size: trade.Size,
                    pnl: trade.PnL,
                    color: trade.PnL >= 0 ? '#26a69a' : '#ef5350'
                };
            });
        } catch (error) {
            console.error('Error parsing trades:', error);
            return [];
        }
    };

    // API Call
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
                    startDate,
                    endDate,
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

    // Chart Creation and Update
    useEffect(() => {
        if (!result?.equityCurve || !equityChartRef.current) return;

        // Clean up previous charts
        if (chartInstanceRef.current) {
            chartInstanceRef.current.remove();
        }
        if (tradesChartInstanceRef.current) {
            tradesChartInstanceRef.current.remove();
        }

        // Create Equity Chart
        chartInstanceRef.current = createChart(equityChartRef.current, {
            ...chartConfig,
            width: equityChartRef.current.clientWidth,
            height: 400,
        });

        // Equity Series
        const equitySeries = chartInstanceRef.current.addAreaSeries({
            lineColor: '#2962FF',
            topColor: 'rgba(41, 98, 255, 0.3)',
            bottomColor: 'rgba(41, 98, 255, 0.05)',
            lineWidth: 2,
            priceFormat: {
                type: 'price',
                precision: 0,
                minMove: 1,
            },
        });

        // Drawdown Series
        const drawdownSeries = chartInstanceRef.current.addHistogramSeries({
            color: '#ef5350',
            priceFormat: {
                type: 'percent',
                precision: 2,
            },
            priceScaleId: 'drawdown',
        });

        chartInstanceRef.current.priceScale('drawdown').applyOptions({
            scaleMargins: {
                top: 0.8,
                bottom: 0,
            },
            visible: true,
        });

        const equityData = parseEquityCurve(result.equityCurve);
        equitySeries.setData(equityData.map(d => ({ time: d.time, value: d.value })));
        drawdownSeries.setData(equityData.map(d => ({ time: d.time, value: d.drawdown || 0 })));

        chartInstanceRef.current.timeScale().fitContent();

        // Create Trades Chart
        if (tradesChartRef.current && result.trades) {
            tradesChartInstanceRef.current = createChart(tradesChartRef.current, {
                ...chartConfig,
                width: tradesChartRef.current.clientWidth,
                height: 300,
            });

            // PnL Series
            const tradePnlSeries = tradesChartInstanceRef.current.addHistogramSeries({
                color: '#26a69a',
                priceFormat: {
                    type: 'price',
                    precision: 2,
                },
            });

            // Price Series
            const priceSeries = tradesChartInstanceRef.current.addLineSeries({
                color: '#2962FF',
                lineWidth: 1,
                priceFormat: {
                    type: 'price',
                    precision: 2,
                },
            });

            const tradesData = parseTrades(result.trades);

            tradePnlSeries.setData(tradesData.map(trade => ({
                time: trade.time,
                value: trade.pnl,
                color: trade.color
            })));

            priceSeries.setData(tradesData.map(trade => ({
                time: trade.time,
                value: trade.price
            })));

            tradesChartInstanceRef.current.timeScale().fitContent();
        }

        // Resize Handler
        const handleResize = () => {
            if (equityChartRef.current && chartInstanceRef.current) {
                chartInstanceRef.current.applyOptions({
                    width: equityChartRef.current.clientWidth,
                });
                chartInstanceRef.current.timeScale().fitContent();
            }
            if (tradesChartRef.current && tradesChartInstanceRef.current) {
                tradesChartInstanceRef.current.applyOptions({
                    width: tradesChartRef.current.clientWidth,
                });
                tradesChartInstanceRef.current.timeScale().fitContent();
            }
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            if (chartInstanceRef.current) {
                chartInstanceRef.current.remove();
            }
            if (tradesChartInstanceRef.current) {
                tradesChartInstanceRef.current.remove();
            }
        };
    }, [result, startDate]);

    // Render Functions
    const renderMetrics = () => {
        if (!result) return null;

        const metrics = [
            { label: '수익률', value: `${result.totalReturn.toFixed(2)}%`, color: result.totalReturn >= 0 ? 'success.main' : 'error.main' },
            { label: '승률', value: `${result.winRate.toFixed(2)}%`, color: 'primary.main' },
            { label: '최대 낙폭', value: `${result.maxDrawdown.toFixed(2)}%`, color: 'error.main' },
            { label: '수익 팩터', value: result.profitFactor.toFixed(2), color: 'primary.main' },
            { label: '총 거래 횟수', value: result.totalTrades, color: 'primary.main' },
            { label: '최종 자산', value: `₩${result.finalEquity.toLocaleString()}`, color: result.finalEquity >= result.initialCapital ? 'success.main' : 'error.main' },
        ];

        return (
            <Grid container spacing={2}>
                {metrics.map((metric, index) => (
                    <Grid item xs={12} sm={6} md={4} key={index}>
                        <Card>
                            <CardContent>
                                <Typography variant="subtitle2" gutterBottom>
                                    {metric.label}
                                </Typography>
                                <Typography variant="h4" sx={{ color: metric.color }}>
                                    {metric.value}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        );
    };

    const renderInputForm = () => (
        <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
                <TextField
                    label="시작일"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                />
            </Grid>
            <Grid item xs={12} md={6}>
                <TextField
                    label="종료일"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    fullWidth
                    InputLabelProps={{ shrink: true }}
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
    );

    return (
        <Box>
            <Typography variant="h5" gutterBottom>백테스팅</Typography>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
            )}

            <Paper sx={{ p: 3, mb: 3 }}>
                {renderInputForm()}
                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                        variant="contained"
                        onClick={handleRunBacktest}
                        disabled={loading}
                        size="large"
                    >
                        {loading ? <CircularProgress size={24} /> : '백테스트 실행'}
                    </Button>
                </Box>
            </Paper>

            {result && (
                <>
                    {renderMetrics()}
                    <Paper sx={{ p: 3, mt: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            자산 곡선
                        </Typography>
                        <ChartContainer ref={equityChartRef} />
                    </Paper>
                    <Paper sx={{ p: 3, mt: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            거래별 수익/손실
                        </Typography>
                        <TradesChartContainer ref={tradesChartRef} />
                    </Paper>
                </>
            )}
        </Box>
    );
};

export default BackTestingTab;