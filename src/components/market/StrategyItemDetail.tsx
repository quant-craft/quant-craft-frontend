import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Typography, Button, CircularProgress, Box, Paper, Grid } from '@mui/material';
import { getBackendUrl } from '../../config';

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

interface StrategyItem {
    id: number;
    name: string;
    description: string;
    price: number;
    strategy: Strategy;
}

interface Order {
    id: number;
    status: string;
    totalPrice: number;
    orderItem: {
        id: number;
        name: string;
    };
    createdAt: string;
    canceledAt: string | null;
}

const StrategyItemDetail: React.FC = () => {
    const [strategyItem, setStrategyItem] = useState<StrategyItem | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchStrategyItem = async () => {
            const accessToken = localStorage.getItem('accessToken');
            if (!accessToken) {
                setError('No access token found');
                setLoading(false);
                return;
            }

            try {
                const response = await fetch(`${getBackendUrl()}/api/strategy-items/${id}`, {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                    },
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch strategy item details');
                }

                const data: StrategyItem = await response.json();
                setStrategyItem(data);
            } catch (error) {
                console.error('Error fetching strategy item:', error);
                setError('Failed to load strategy item details');
            } finally {
                setLoading(false);
            }
        };

        fetchStrategyItem();
    }, [id]);

    const handleBuyStrategyItem = async () => {
        if (!strategyItem) return;

        const accessToken = localStorage.getItem('accessToken');
        if (!accessToken) {
            alert('Please login to buy a strategy item');
            return;
        }

        try {
            const response = await fetch(`${getBackendUrl()}/api/orders/strategy-items/${strategyItem.id}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                },
            });

            if (response.ok) {
                const order: Order = await response.json();
                alert(`Strategy item purchased successfully! Order ID: ${order.id}`);
                navigate('/market');
            } else {
                const errorMessage = await response.text();
                alert(`Failed to purchase strategy item: ${errorMessage}`);
            }
        } catch (error) {
            console.error('Error buying strategy item:', error);
            alert('Failed to purchase strategy item. Please check your network connection and try again.');
        }
    };

    if (loading) return <CircularProgress />;
    if (error) return <Typography color="error">{error}</Typography>;
    if (!strategyItem) return <Typography>Strategy item not found</Typography>;

    return (
        <Container maxWidth="md" sx={{ mt: 4 }}>
            <Typography variant="h4" gutterBottom>{strategyItem.name}</Typography>
            <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom>Strategy Item Details</Typography>
                <Typography variant="body1" paragraph>{strategyItem.description}</Typography>
                <Typography variant="h6" gutterBottom>Price: {strategyItem.price} points</Typography>
            </Paper>

            <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom>Strategy Details</Typography>
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                        <Typography><strong>Name:</strong> {strategyItem.strategy.name}</Typography>
                        <Typography><strong>Description:</strong> {strategyItem.strategy.description}</Typography>
                        <Typography><strong>Leverage:</strong> {strategyItem.strategy.leverage}</Typography>
                        <Typography><strong>Exclusive Orders:</strong> {strategyItem.strategy.exclusiveOrders ? 'Yes' : 'No'}</Typography>
                        <Typography><strong>Hedge Mode:</strong> {strategyItem.strategy.hedgeMode ? 'Yes' : 'No'}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <Typography><strong>Timeframe:</strong> {strategyItem.strategy.timeframe}</Typography>
                        <Typography><strong>Symbol:</strong> {strategyItem.strategy.symbol}</Typography>
                        <Typography><strong>Exchange:</strong> {strategyItem.strategy.exchange}</Typography>
                    </Grid>
                </Grid>
            </Paper>

            <Box sx={{ mt: 3 }}>
                <Button variant="contained" color="primary" onClick={handleBuyStrategyItem}>
                    Buy Strategy Item
                </Button>
                <Button variant="outlined" sx={{ ml: 2 }} onClick={() => navigate('/market')}>
                    Back to Market
                </Button>
            </Box>
        </Container>
    );
};

export default StrategyItemDetail;