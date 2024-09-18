import React from 'react';
import { Typography, Box, Button } from '@mui/material';

interface UserInfoTabProps {
    userInfo: {
        nickname: string;
        email: string;
        oauthProvider: string;
        point: number;
    };
    onChargeClick: () => void;
}

const UserInfoTab: React.FC<UserInfoTabProps> = ({ userInfo, onChargeClick }) => (
    <>
        <Typography variant="h6" gutterBottom>사용자 정보</Typography>
        <Typography><strong>닉네임:</strong> {userInfo.nickname}</Typography>
        <Typography><strong>이메일:</strong> {userInfo.email}</Typography>
        <Typography><strong>로그인 방식:</strong> {userInfo.oauthProvider}</Typography>
        <Box display="flex" alignItems="center" mt={2}>
            <Typography><strong>포인트:</strong> {userInfo.point}</Typography>
            <Button variant="contained" color="primary" size="small" sx={{ ml: 2 }} onClick={onChargeClick}>
                포인트 충전
            </Button>
        </Box>
    </>
);

export default UserInfoTab;