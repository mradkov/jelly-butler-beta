import { Config } from '@jelly-swap/aeternity';
import UserConfig from '../../config';
import { safeAccess } from '../../utils';

export default () => {
    const userConfig = new UserConfig().getUserConfig();

    const address = safeAccess(userConfig, ['WALLETS', 'AE', 'ADDRESS']);
    const secret = safeAccess(userConfig, ['WALLETS', 'AE', 'SECRET']);

    const config = {
        ...Config(7200),
        providerUrl: 'https://sdk-mainnet.aepps.com/',
        internalUrl: 'https://sdk-mainnet.aepps.com/',
        compilerUrl: 'https://compiler.aepps.com',
        wsUrl: 'wss://mainnet.aeternal.io/websocket',
        apiUrl: 'https://mainnet.aeternal.io/',
        contractAddress: 'ct_jmRkfpzmn7KZbXbkEL9wueJkb1vaFzMnVFJMFjAnJgj1CTtQe',
        explorer: 'https://explorer.aepps.com/transactions/',
        REFUND_PERIOD: 10,
        VALID_EXPIRATION: 72000,
    };

    if (address && secret) {
        return {
            ...config,
            receiverAddress: address,
            KEY_PAIR: {
                publicKey: address,
                secretKey: secret,
            },
        };
    } else {
        throw new Error('Aeternity ADDRESS and SECRET are missing.');
    }
};
