import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Typography, Button, CircularProgress, Box } from '@mui/material';
import { getBackendUrl } from '../../config';

interface Strategy {
    id: number;
    name: string;
    description: string;
    price: number;
    path: string;
}

const StrategyDetail: React.FC = () => {
    const [strategy, setStrategy] = useState<Strategy | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchStrategy = async () => {
            const accessToken = localStorage.getItem('accessToken');
            if (!accessToken) {
                setError('No access token found');
                setLoading(false);
                return;
            }

            try {
                const response = await fetch(`${getBackendUrl()}/api/strategies/${id}`, {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                    },
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch strategy details');
                }

                const data: Strategy = await response.json();
                setStrategy(data);
            } catch (error) {
                console.error('Error fetching strategy:', error);
                setError('Failed to load strategy details');
            } finally {
                setLoading(false);
            }
        };

        fetchStrategy();
    }, [id]);

    const handleBuyStrategy = async () => {
        if (!strategy) return;

        const accessToken = localStorage.getItem('accessToken');
        if (!accessToken) {
            alert('Please login to buy a strategy');
            return;
        }

        try {
            const response = await fetch(`${getBackendUrl()}/api/strategies/${strategy.id}/buy`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                },
            });

            if (response.ok) {
                alert('Strategy purchased successfully!');
                navigate('/market'); // Redirect to market after successful purchase
            } else {
                const errorMessage = await response.text();
                alert(`Failed to purchase strategy: ${errorMessage}`);
            }
        } catch (error) {
            console.error('Error buying strategy:', error);
            alert('Failed to purchase strategy. Please check your network connection and try again.');
        }
    };

    if (loading) return <CircularProgress />;
    if (error) return <Typography color="error">{error}</Typography>;
    if (!strategy) return <Typography>Strategy not found</Typography>;

    return (
        <Container maxWidth="md" sx={{ mt: 4 }}>
            <Typography variant="h4" gutterBottom>{strategy.name}</Typography>
            <Typography variant="body1" paragraph>{strategy.description}</Typography>
            <Typography variant="h6" gutterBottom>Price: {strategy.price} points</Typography>
            <Box sx={{ mt: 3 }}>
                <Button variant="contained" color="primary" onClick={handleBuyStrategy}>
                    Buy Strategy
                </Button>
                <Button variant="outlined" sx={{ ml: 2 }} onClick={() => navigate('/market')}>
                    Back to Market
                </Button>
            </Box>
        </Container>
    );
};

export default StrategyDetail;