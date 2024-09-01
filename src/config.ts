/// <reference types="vite/client" />

interface Config {
    oauth: {
        kakao: {
            clientId: string;
            authServerUrl: string;
        };
        google: {
            clientId: string;
            authServerUrl: string;
            scopes: string[];
        };
    };
    tossPayments: {
        clientKey: string;
    }
    application: {
        host: {
            backend: string;
        };
    };
}

const getEnvVar = (key: string): string => {
    const value = import.meta.env[key] as string | undefined;
    if (value === undefined) {
        console.warn(`Missing environment variable: ${key}`);
        return '';
    }
    return value;
};

const config: Config = {
    oauth: {
        kakao: {
            clientId: getEnvVar('VITE_KAKAO_CLIENT_ID'),
            authServerUrl: getEnvVar('VITE_KAKAO_AUTH_SERVER_URL'),
        },
        google: {
            clientId: getEnvVar('VITE_GOOGLE_CLIENT_ID'),
            authServerUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
            scopes: [
                'https://www.googleapis.com/auth/userinfo.profile',
                'https://www.googleapis.com/auth/userinfo.email'
            ],
        },
    },
    tossPayments: {
        clientKey: getEnvVar('VITE_TOSS_PAYMENTS_CLIENT_KEY'),
    },
    application: {
        host: {
            backend: getEnvVar('VITE_BACKEND_URL')
        },
    },
};

export default Object.freeze(config);

export function getConfig<K extends keyof Config>(key: K): Config[K] {
    return config[key];
}

export function getOAuthConfig(provider: 'kakao' | 'google') {
    return config.oauth[provider];
}

export function getTossPaymentsClientKey() {
    return config.tossPayments.clientKey;
}

export function getBackendUrl() {
    return config.application.host.backend;
}

export function getKakaoOAuthUrl() {
    const { clientId, authServerUrl } = getOAuthConfig('kakao');
    const redirectUri = `${window.location.origin}/oauth/callback/kakao`;
    return `${authServerUrl}/oauth/authorize?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}`;
}

export function getGoogleOAuthUrl() {
    const { clientId, authServerUrl, scopes } = config.oauth.google;
    const redirectUri = `${window.location.origin}/oauth/callback/google`;

    return `${authServerUrl}?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(scopes.join(' '))}`;
}