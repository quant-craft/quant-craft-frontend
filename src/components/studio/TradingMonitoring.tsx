// TradingMonitoring.tsx
import React, { useEffect, useState, useRef } from 'react';
import { Dialog, DialogTitle, DialogContent, Paper, Typography, Box, Button } from '@mui/material';
import { getBackendUrl } from '../../config';
import {EventSourcePolyfill} from "event-source-polyfill";

interface TradingMonitoringProps {
    open: boolean;
    onClose: () => void;
    botId: number;
}

const TradingMonitoring: React.FC<TradingMonitoringProps> = ({ open, onClose, botId }) => {
    const [updates, setUpdates] = useState<string[]>([]);
    const scrollRef = useRef<HTMLDivElement>(null);
    const [autoScroll, setAutoScroll] = useState(true);

    useEffect(() => {
        if (!open) return;

        const accessToken = localStorage.getItem('accessToken');
        if (!accessToken) {
            console.error('로그인이 필요합니다.');
            return;
        }

        const eventSource = new EventSourcePolyfill(`${getBackendUrl()}/api/stream/demo-tradings`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            },
            heartbeatTimeout: 120000,
            withCredentials: true
        });

        eventSource.onmessage = (event) => {
            setUpdates(prev => [...prev, event.data]);
            if (autoScroll && scrollRef.current) {
                setTimeout(() => {
                    scrollRef.current?.scrollTo({
                        top: scrollRef.current.scrollHeight,
                        behavior: 'smooth'
                    });
                }, 100);
            }
        };

        eventSource.onerror = (error) => {
            console.error('SSE Error:', error);
            eventSource.close();
        };

        return () => {
            eventSource.close();
        };
    }, [open, botId, autoScroll]);

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
                <Box
                    ref={scrollRef}
                    sx={{
                        height: '600px',
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
                            key={index}
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
                                {update}
                            </Typography>
                        </Paper>
                    ))}
                </Box>
            </DialogContent>
        </Dialog>
    );
};

export default TradingMonitoring;