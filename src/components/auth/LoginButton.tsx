import React, {useState, useEffect} from 'react';
import {Button} from '@mui/material';
import {useNavigate} from 'react-router-dom';
import AuthDialog from './AuthDialog.tsx';
import {getBackendUrl} from '../../config.ts';

const LoginButton: React.FC = () => {
    const [open, setOpen] = useState(false);
    const [loggedIn, setLoggedIn] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        setLoggedIn(!!localStorage.getItem('accessToken'));
    }, []);

    const handleLogout = async () => {
        const accessToken = localStorage.getItem('accessToken');
        if (!accessToken) return;

        await fetch(`${getBackendUrl()}/api/logout`, {
            method: 'DELETE',
            headers: {'Authorization': `Bearer ${accessToken}`},
        });

        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        setLoggedIn(false);
        window.location.href = '/';
    };

    return (
        <>
            {loggedIn ? (
                <>
                    <Button color="primary" variant="contained" onClick={() => navigate('/mypage')}>
                        My Page
                    </Button>
                    <Button color="secondary" variant="contained" onClick={handleLogout}>
                        Logout
                    </Button>
                </>
            ) : (
                <Button color="primary" variant="contained" onClick={() => setOpen(true)}>
                    Login
                </Button>
            )}
            <AuthDialog open={open} onClose={() => setOpen(false)}/>
        </>
    );
};

export default LoginButton;