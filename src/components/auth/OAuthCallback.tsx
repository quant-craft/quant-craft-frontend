import {useEffect} from 'react';
import {useSearchParams, useParams} from 'react-router-dom';

const OAuthCallback: React.FC = () => {
    const {provider} = useParams();
    const [searchParams] = useSearchParams();

    useEffect(() => {
        const handleAuthResponse = async () => {
            const code = searchParams.get('code');
            if (!provider || !code) {
                return handleError('Missing provider or code in URL parameters');
            }

            const response = await fetch(`http://localhost:8080/api/login/oauth/${provider}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({code}),
            });

            if (!response.ok) {
                return handleError(`Login failed - ${response.status}`);
            }

            const {accessToken, refreshToken} = await response.json();
            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('refreshToken', refreshToken);
            window.location.href = '/';
        };

        const handleError = (message: string) => {
            alert('로그인에 실패했습니다. 다시 시도해주세요. - ' + message);
            window.location.href = '/';
        };

        handleAuthResponse()
    }, [provider, searchParams]);

    return (
        <div>
            <p>Processing your login...</p>
        </div>
    );
};

export default OAuthCallback;
