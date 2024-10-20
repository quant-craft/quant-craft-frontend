import React, { useState, useEffect } from 'react';
import {
    Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Paper, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Select, MenuItem, Box,
    CircularProgress, Snackbar, Alert, AlertTitle
} from '@mui/material';
import { getBackendUrl } from '../../config';

interface ExchangeApiKey {
    id: number;
    exchange: ExchangeType;
    apiKey: string;
    secretKey: string;
}

enum ExchangeType {
    BINANCE = 'BINANCE',
    UPBIT = 'UPBIT',
    BITGET = 'BITGET',
}

const ApiKeyManagementTab: React.FC = () => {
    const [apiKeys, setApiKeys] = useState<ExchangeApiKey[]>([]);
    const [open, setOpen] = useState(false);
    const [editingKey, setEditingKey] = useState<ExchangeApiKey | null>(null);
    const [newKey, setNewKey] = useState<Partial<ExchangeApiKey>>({
        exchange: ExchangeType.BINANCE,
        apiKey: '',
        secretKey: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    useEffect(() => {
        fetchApiKeys();
    }, []);

    const fetchApiKeys = async () => {
        setLoading(true);
        const accessToken = localStorage.getItem('accessToken');
        if (!accessToken) {
            setError('로그인이 필요합니다.');
            setLoading(false);
            return;
        }

        try {
            const response = await fetch(`${getBackendUrl()}/api/exchange-api-keys/list`, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                },
            });

            if (!response.ok) {
                throw new Error('API 키 목록을 가져오는데 실패했습니다.');
            }

            const data: ExchangeApiKey[] = await response.json();
            setApiKeys(data);
        } catch (err) {
            console.error('Error fetching API keys:', err);
            setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
        } finally {
            setLoading(false);
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
            const response = await fetch(`${getBackendUrl()}/api/exchange-api-keys`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newKey),
            });

            if (!response.ok) {
                throw new Error('API 키 생성에 실패했습니다.');
            }

            await fetchApiKeys();
            setOpen(false);
            setNewKey({ exchange: ExchangeType.BINANCE, apiKey: '', secretKey: '' });
            setSuccessMessage('API 키가 성공적으로 생성되었습니다.');
        } catch (err) {
            console.error('Error creating API key:', err);
            setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async () => {
        if (!editingKey) return;
        setLoading(true);
        const accessToken = localStorage.getItem('accessToken');
        if (!accessToken) {
            setError('로그인이 필요합니다.');
            setLoading(false);
            return;
        }

        try {
            const response = await fetch(`${getBackendUrl()}/api/exchange-api-keys/${editingKey.id}`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(editingKey),
            });

            if (!response.ok) {
                throw new Error('API 키 수정에 실패했습니다.');
            }

            await fetchApiKeys();
            setEditingKey(null);
            setSuccessMessage('API 키가 성공적으로 수정되었습니다.');
        } catch (err) {
            console.error('Error updating API key:', err);
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
            const response = await fetch(`${getBackendUrl()}/api/exchange-api-keys/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                },
            });

            if (!response.ok) {
                throw new Error('API 키 삭제에 실패했습니다.');
            }

            await fetchApiKeys();
            setSuccessMessage('API 키가 성공적으로 삭제되었습니다.');
        } catch (err) {
            console.error('Error deleting API key:', err);
            setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <CircularProgress />;

    return (
        <>
            <Typography variant="h6" gutterBottom>API Key 관리</Typography>
            <Alert severity="warning" sx={{ mb: 2 }}>
                <AlertTitle>주의</AlertTitle>
                Secret Key가 노출되어 있습니다. 이 정보를 타인과 공유하지 마세요.
            </Alert>
            <Button variant="contained" color="primary" onClick={() => setOpen(true)} sx={{ mb: 2 }}>
                새 API Key 추가
            </Button>
            {apiKeys.length > 0 ? (
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>거래소</TableCell>
                                <TableCell>API Key</TableCell>
                                <TableCell>Secret Key</TableCell>
                                <TableCell>작업</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {apiKeys.map((key) => (
                                <TableRow key={key.id}>
                                    <TableCell>{key.exchange}</TableCell>
                                    <TableCell>{key.apiKey}</TableCell>
                                    <TableCell>{key.secretKey}</TableCell>
                                    <TableCell>
                                        <Button onClick={() => setEditingKey(key)}>수정</Button>
                                        <Button onClick={() => handleDelete(key.id)}>삭제</Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            ) : (
                <Typography>등록된 API 키가 없습니다.</Typography>
            )}

            {/* 새 API Key 추가 다이얼로그 */}
            <Dialog open={open} onClose={() => setOpen(false)}>
                <DialogTitle>새 API Key 추가</DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                        <Select
                            value={newKey.exchange}
                            onChange={(e) => setNewKey({ ...newKey, exchange: e.target.value as ExchangeType })}
                        >
                            {Object.values(ExchangeType).map((type) => (
                                <MenuItem key={type} value={type}>{type}</MenuItem>
                            ))}
                        </Select>
                        <TextField
                            label="API Key"
                            value={newKey.apiKey}
                            onChange={(e) => setNewKey({ ...newKey, apiKey: e.target.value })}
                        />
                        <TextField
                            label="Secret Key"
                            value={newKey.secretKey}
                            onChange={(e) => setNewKey({ ...newKey, secretKey: e.target.value })}
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpen(false)}>취소</Button>
                    <Button onClick={handleCreate}>추가</Button>
                </DialogActions>
            </Dialog>

            {/* API Key 수정 다이얼로그 */}
            <Dialog open={!!editingKey} onClose={() => setEditingKey(null)}>
                <DialogTitle>API Key 수정</DialogTitle>
                <DialogContent>
                    {editingKey && (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                            <Select
                                value={editingKey.exchange}
                                onChange={(e) => setEditingKey({ ...editingKey, exchange: e.target.value as ExchangeType })}
                            >
                                {Object.values(ExchangeType).map((type) => (
                                    <MenuItem key={type} value={type}>{type}</MenuItem>
                                ))}
                            </Select>
                            <TextField
                                label="API Key"
                                value={editingKey.apiKey}
                                onChange={(e) => setEditingKey({ ...editingKey, apiKey: e.target.value })}
                            />
                            <TextField
                                label="Secret Key"
                                value={editingKey.secretKey}
                                onChange={(e) => setEditingKey({ ...editingKey, secretKey: e.target.value })}
                            />
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setEditingKey(null)}>취소</Button>
                    <Button onClick={handleUpdate}>수정</Button>
                </DialogActions>
            </Dialog>

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

export default ApiKeyManagementTab;