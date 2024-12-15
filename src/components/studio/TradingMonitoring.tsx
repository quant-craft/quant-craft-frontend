import React, { useEffect, useState, useRef } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    Paper,
    Typography,
    Box,
    Button,
    Tabs,
    Tab
} from '@mui/material';
import { getBackendUrl } from '../../config';
import { EventSourcePolyfill } from "event-source-polyfill";

interface TradingMonitoringProps {
    open: boolean;
    onClose: () => void;
    botId: number;
}

interface Update {
    message: string;
    timestamp: number;
}

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

interface CustomEventMap extends EventSourceEventMap {
    'INIT': MessageEvent;
    'market.info': MessageEvent;
    'trading.events': MessageEvent;
    'heartbeat': MessageEvent;
}

// EventSourcePolyfill의 타입을 확장
interface CustomEventSource extends EventSourcePolyfill {
    addEventListener<K extends keyof CustomEventMap>(
        type: K,
        listener: (event: CustomEventMap[K]) => void
    ): void;
}

const TabPanel = (props: TabPanelProps) => {
    const { children, value, index, ...other } = props;
    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            {...other}
        >
            {value === index && (
                <Box>{children}</Box>
            )}
        </div>
    );
};

const TradingMonitoring: React.FC<TradingMonitoringProps> = ({ open, onClose, botId }) => {
    const [selectedTab, setSelectedTab] = useState(0);
    const [marketUpdates, setMarketUpdates] = useState<Update[]>([]);
    const [tradingUpdates, setTradingUpdates] = useState<Update[]>([]);
    const marketScrollRef = useRef<HTMLDivElement>(null);
    const tradingScrollRef = useRef<HTMLDivElement>(null);
    const [autoScroll, setAutoScroll] = useState(true);

    useEffect(() => {
        if (!open) return;

        const accessToken = localStorage.getItem('accessToken');
        if (!accessToken) {
            console.error('로그인이 필요합니다.');
            return;
        }

        const eventSource = new EventSourcePolyfill(
            `${getBackendUrl()}/api/stream/demo-tradings/${botId}`,
            {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                },
                heartbeatTimeout: 180000,
                withCredentials: true,
            }
        ) as CustomEventSource;

        const handleScroll = (ref: React.RefObject<HTMLDivElement>) => {
            if (autoScroll && ref.current) {
                setTimeout(() => {
                    ref.current?.scrollTo({
                        top: ref.current.scrollHeight,
                        behavior: 'smooth'
                    });
                }, 100);
            }
        };

        eventSource.addEventListener('INIT', (e: MessageEvent) => {
            const update = { message: `Connection established: ${e.data}`, timestamp: Date.now() };
            setMarketUpdates(prev => [...prev, update]);
            setTradingUpdates(prev => [...prev, update]);
            handleScroll(marketScrollRef);
            handleScroll(tradingScrollRef);
        });

        eventSource.addEventListener('market.info', (e: MessageEvent) => {
            const update = { message: `Market Info: ${e.data}`, timestamp: Date.now() };
            setMarketUpdates(prev => [...prev, update]);
            handleScroll(marketScrollRef);
        });

        eventSource.addEventListener('trading.events', (e: MessageEvent) => {
            const update = { message: `Trading Event: ${e.data}`, timestamp: Date.now() };
            setTradingUpdates(prev => [...prev, update]);
            handleScroll(tradingScrollRef);
        });

        eventSource.addEventListener('heartbeat', (e: MessageEvent) => {
            const update = { message: `Heartbeat: ${e.data}`, timestamp: Date.now() };
            setMarketUpdates(prev => [...prev, update]);
            setTradingUpdates(prev => [...prev, update]);
            handleScroll(marketScrollRef);
            handleScroll(tradingScrollRef);
        });

        eventSource.onerror = () => {
            const update = { message: 'Connection lost. Attempting to reconnect...', timestamp: Date.now() };
            setMarketUpdates(prev => [...prev, update]);
            setTradingUpdates(prev => [...prev, update]);
        };

        return () => {
            eventSource.close();
        };
    }, [open, botId, autoScroll]);

    const renderUpdates = (updates: Update[], scrollRef: React.RefObject<HTMLDivElement>) => (
        <Box
            ref={scrollRef}
            sx={{
                height: '500px',
                overflowY: 'auto',
                backgroundColor: '#1e1e1e',
                padding: 1,
                '& > div': {
                    borderRadius: 1,
                    mb: 0.5
                }
            }}
        >
            {updates.map((update, index) => (
                <Paper
                    key={`${update.timestamp}-${index}`}
                    sx={{
                        p: 1,
                        backgroundColor: '#2d2d2d',
                        border: '1px solid #3d3d3d'
                    }}
                >
                    <Typography
                        fontFamily="monospace"
                        sx={{
                            color: '#d4d4d4',
                            fontSize: '0.9rem',
                            whiteSpace: 'pre-wrap',
                            wordBreak: 'break-all'
                        }}
                    >
                        {update.message}
                    </Typography>
                </Paper>
            ))}
        </Box>
    );

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                실시간 트레이딩 모니터링
                <Button
                    variant="outlined"
                    size="small"
                    onClick={() => setAutoScroll(!autoScroll)}
                >
                    자동 스크롤 {autoScroll ? 'ON' : 'OFF'}
                </Button>
            </DialogTitle>
            <DialogContent>
                <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
                    <Tabs
                        value={selectedTab}
                        onChange={(_, newValue) => setSelectedTab(newValue)}
                        variant="fullWidth"
                    >
                        <Tab label="시장 정보" />
                        <Tab label="트레이딩 이벤트" />
                    </Tabs>
                </Box>

                <TabPanel value={selectedTab} index={0}>
                    {renderUpdates(marketUpdates, marketScrollRef)}
                </TabPanel>
                <TabPanel value={selectedTab} index={1}>
                    {renderUpdates(tradingUpdates, tradingScrollRef)}
                </TabPanel>
            </DialogContent>
        </Dialog>
    );
};

export default TradingMonitoring;