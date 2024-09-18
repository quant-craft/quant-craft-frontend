import React, { useState, useEffect, useCallback } from 'react';
import {
    Container, Grid, Card, CardContent, CardActions, Typography, Button,
    TextField, Select, MenuItem, Pagination, Box, SelectChangeEvent, InputAdornment
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useNavigate } from 'react-router-dom';
import { getBackendUrl } from '../../config';

interface Strategy {
    id: number;
    name: string;
    description: string;
    price: number;
    path: string;
}

interface StrategiesResponse {
    totalStrategyCount: number;
    totalPage: number;
    strategies: Strategy[];
}

const Market: React.FC = () => {
    const [strategies, setStrategies] = useState<Strategy[]>([]);
    const [totalPages, setTotalPages] = useState(0);
    const [page, setPage] = useState(1);
    const [sortOption, setSortOption] = useState('DEFAULT');
    const [searchKeyword, setSearchKeyword] = useState('');
    const [currentSearchKeyword, setCurrentSearchKeyword] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const fetchStrategies = useCallback(async () => {
        setLoading(true);
        const accessToken = localStorage.getItem('accessToken');

        if (!accessToken) {
            console.error('No access token found');
            setLoading(false);
            return;
        }

        try {
            const baseUrl = getBackendUrl();
            const endpoint = currentSearchKeyword ? '/api/strategies/search' : '/api/strategies/paging';
            const url = new URL(`${baseUrl}${endpoint}`);

            url.searchParams.append('page', page.toString());
            url.searchParams.append('size', '10');
            url.searchParams.append('sortOption', sortOption);

            if (currentSearchKeyword) {
                url.searchParams.append('keyword', currentSearchKeyword);
            }

            const response = await fetch(url.toString(), {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch strategies');
            }

            const data: StrategiesResponse = await response.json();
            setStrategies(data.strategies);
            setTotalPages(data.totalPage);
        } catch (error) {
            console.error('Error fetching strategies:', error);
        } finally {
            setLoading(false);
        }
    }, [page, sortOption, currentSearchKeyword]);

    useEffect(() => {
        fetchStrategies();
    }, [fetchStrategies]);

    const handleSortChange = (event: SelectChangeEvent) => {
        setSortOption(event.target.value as string);
        setPage(1);
    };

    const handleSearch = () => {
        setCurrentSearchKeyword(searchKeyword);
        setPage(1);
    };

    const handleSearchKeyPress = (event: React.KeyboardEvent) => {
        if (event.key === 'Enter') {
            handleSearch();
        }
    };

    const handlePageChange = (_: React.ChangeEvent<unknown>, value: number) => {
        setPage(value);
    };

    return (
        <Container maxWidth="lg" sx={{ mt: 4 }}>
            <Typography variant="h4" gutterBottom>Strategy Marketplace</Typography>
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between' }}>
                <TextField
                    label="Search strategies"
                    variant="outlined"
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                    onKeyPress={handleSearchKeyPress}
                    sx={{ width: '60%' }}
                    InputProps={{
                        endAdornment: (
                            <InputAdornment position="end">
                                <Button onClick={handleSearch}>
                                    <SearchIcon />
                                </Button>
                            </InputAdornment>
                        ),
                    }}
                />
                <Select
                    value={sortOption}
                    onChange={handleSortChange}
                    displayEmpty
                    sx={{ width: '30%' }}
                >
                    <MenuItem value="DEFAULT">Default</MenuItem>
                    <MenuItem value="LATEST">Latest</MenuItem>
                    <MenuItem value="PRICE_DESC">Price (High to Low)</MenuItem>
                    <MenuItem value="PRICE_ASC">Price (Low to High)</MenuItem>
                </Select>
            </Box>
            {loading ? (
                <Typography>Loading...</Typography>
            ) : (
                <Grid container spacing={3}>
                    {strategies.map((strategy) => (
                        <Grid item xs={12} sm={6} md={4} key={strategy.id}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h6">{strategy.name}</Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {strategy.description}
                                    </Typography>
                                    <Typography variant="h6" sx={{ mt: 2 }}>
                                        Price: {strategy.price} points
                                    </Typography>
                                </CardContent>
                                <CardActions>
                                    <Button
                                        size="small"
                                        color="primary"
                                        onClick={() => navigate(`/strategy/${strategy.id}`)}
                                    >
                                        View Details
                                    </Button>
                                </CardActions>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
                <Pagination
                    count={totalPages}
                    page={page}
                    onChange={handlePageChange}
                    color="primary"
                />
            </Box>
        </Container>
    );
};

export default Market;