export const MAINNET_URL = 'https://oidc-station.firmachain.io';
export const TESTNET_URL = 'https://oidc-station-testnet.firmachain.dev';

export const NETWORK = 'mainnet' as 'mainnet' | 'testnet';
export const URL = NETWORK === 'testnet' ? TESTNET_URL : MAINNET_URL;
