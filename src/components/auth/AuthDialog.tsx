import React from 'react';
import {Button, Dialog, DialogActions, DialogContent, DialogTitle} from '@mui/material';
import {getGoogleOAuthUrl, getKakaoOAuthUrl} from '../../config.ts';

interface AuthDialogProps {
    open: boolean;
    onClose: () => void;
}

const AuthDialog: React.FC<AuthDialogProps> = ({ open, onClose }) => {
    const handleKakaoLogin = () => {
        window.location.href = getKakaoOAuthUrl();
    };

    const handleGoogleLogin = () => {
        window.location.href = getGoogleOAuthUrl();
    };

    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>로그인 선택</DialogTitle>
            <DialogContent>
                원하는 로그인 방법을 선택하세요.
            </DialogContent>
            <DialogActions>
                <Button onClick={handleKakaoLogin} color="primary">
                    카카오 로그인
                </Button>
                <Button onClick={handleGoogleLogin} color="secondary">
                    구글 로그인
                </Button>
                <Button onClick={onClose} color="inherit">
                    취소
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default AuthDialog;