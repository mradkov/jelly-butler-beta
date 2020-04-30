import AppConfig from '../../../config';

import Config from '../../blockchain/config';
import Contracts from '../../blockchain/contracts';
import Adapters from '../../blockchain/adapters';
import Exchange from '../../exchange';
import { add, addBig, toBigNumber, mul } from '../../utils/math';
import { PriceService } from '../../components/price/service';
import BalanceRepository from './repository';

import { logError, logInfo } from '../../logger';
import { safeAccess } from '../../utils';

export class BalanceService {
    private static Instance: BalanceService;

    private balances = {};
    private exchangeBalances = {};
    private exchange = new Exchange();
    private priceService = new PriceService();
    private balanceRepository = new BalanceRepository();

    constructor() {
        if (BalanceService.Instance) {
            return BalanceService.Instance;
        }

        BalanceService.Instance = this;
    }

    async update() {
        try {
            for (const network of Object.keys(AppConfig.NETWORKS)) {
                if (AppConfig.NETWORKS[network]) {
                    const address = Config[network].receiverAddress;

                    const result = await Contracts[network].getBalance(address, network);

                    const raw = result.toString();

                    const balance = Adapters[network].parseFromNative(result || 0).toString();

                    this.balances[network] = { address, raw, balance };
                }
            }

            this.exchangeBalances = await this.exchange.getBalance();
            return this.balances;
        } catch (err) {
            logError(`Cannot get balances ${err}`);
            return this.balances;
        }
    }

    async saveBalanceHistory() {
        try {
            let resultBalance = {};
            let portfolioInUsdc = toBigNumber(0);

            for (let network in AppConfig.NETWORKS) {
                try {
                    const jellyBalance = safeAccess(this.balances, [network, 'balance']) || 0;

                    const exchangeBalance = safeAccess(this.exchangeBalances, [network, 'balance']) || 0;

                    const pairPrice = this.priceService.getPairPrice(network, 'USDC');

                    resultBalance[network] = add(jellyBalance, exchangeBalance);

                    portfolioInUsdc = addBig(portfolioInUsdc, mul(pairPrice, resultBalance[network]));
                } catch (err) {
                    logInfo(`Balance History Service Warning - price missing ${err}`);
                }
            }

            resultBalance = { ...resultBalance, portfolioInUsdc: portfolioInUsdc.toString() };

            this.balanceRepository.saveBalance(resultBalance);
        } catch (err) {
            logError(`Cannot save balance snapshot ${err}`);
        }
    }

    getBalances() {
        return this.balances;
    }

    getExchangeBalances() {
        return this.exchangeBalances;
    }
}
