import {Button} from '@mui/material';
import {useState, useEffect} from 'react';
import AuthDialog from './AuthDialog.tsx';
import {getBackendUrl} from '../../config.ts';

const LoginButton: React.FC = () => {
    const [open, setOpen] = useState(false);
    const [loggedIn, setLoggedIn] = useState(false);

    useEffect(() => {
        const accessToken = localStorage.getItem('accessToken');
        if (accessToken) {
            setLoggedIn(true);
        }
    }, []);

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleLogout = async () => {
        const accessToken = localStorage.getItem('accessToken');
        if (!accessToken) return;

        await fetch(`${getBackendUrl}/api/logout`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            },
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
                    <Button color="primary" variant="contained" href="/mypage">
                        My Page
                    </Button>
                    <Button color="secondary" variant="contained" onClick={handleLogout}>
                        Logout
                    </Button>
                </>
            ) : (
                <Button color="primary" variant="contained" onClick={handleClickOpen}>
                    Login
                </Button>
            )}
            <AuthDialog open={open} onClose={handleClose}/>
        </>
    );
};

export default LoginButton;
