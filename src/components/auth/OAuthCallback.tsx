import React, { useEffect } from 'react';
import { useSearchParams, useParams } from 'react-router-dom';
import { getBackendUrl } from "../../config.ts";

const OAuthCallback: React.FC = () => {
    const { provider } = useParams();
    const [searchParams] = useSearchParams();

    useEffect(() => {
        const handleAuthResponse = async () => {
            const code = searchParams.get('code');
            if (!provider || !code) {
                throw new Error('Missing provider or code in URL parameters');
            }

            const redirectUri = `${window.location.origin}/oauth/callback/${provider}`;
            const response = await fetch(`${getBackendUrl()}/api/login/oauth/${provider}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code, redirectUri }),
            });

            if (!response.ok) {
                throw new Error(`Login failed: ${response.body}`);
            }

            const { accessToken, refreshToken } = await response.json();
            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('refreshToken', refreshToken);
            window.location.href = '/';
        };

        handleAuthResponse().catch(error => {
            alert(`로그인에 실패했습니다. 다시 시도해주세요. - ${error.message}`);
            window.location.href = '/';
        });
    }, [provider, searchParams]);

    return <div>Processing your login...</div>;
};

export default OAuthCallback;