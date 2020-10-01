import { In } from 'typeorm';

import Repository from '../../repository';
import { logDebug } from '../../logger';
import { safeAccess } from '../../utils';
import UserConfig from '../../config';
import { RefundModel } from './model';

export default class RefundRepository {
    private refundRepository;

    constructor() {
        const userConfig = new UserConfig().getUserConfig();

        const getRefundRepository = safeAccess(Repository, [userConfig.DATABASE.ACTIVE, 'refund']);

        if (!getRefundRepository) {
            throw new Error('REFUND_REPOSITORY_MISSING');
        } else {
            this.refundRepository = getRefundRepository();
        }
    }

    public async create(withdraw: any) {
        try {
            return this.refundRepository.save(
                new RefundModel(
                    withdraw.id,
                    withdraw.hashLock,
                    withdraw.secret,
                    withdraw.transactionHash,
                    withdraw.sender,
                    withdraw.receiver,
                    withdraw.network
                )
            );
        } catch (error) {
            logDebug(`WITHDRAW_REPOSITORY_ERROR`, error);
            return error;
        }
    }

    public findManyByIds(ids) {
        return this.refundRepository.find({ where: { id: In(ids) } });
    }
}