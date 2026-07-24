import PartnershipOperatorMap from '../../../domain/entities/PartnershipOperatorMap';
import PartnershipOperatorMapRepository from '../../../domain/repositories/PartnershipOperatorMapRepository';

export default class UpdatePartnershipOperatorMapUseCase {
    constructor(private readonly repo: PartnershipOperatorMapRepository) {}

    async execute(
        partnership_id: number,
        operator_id: string,
        partnershipId: number,
        operatorId: string,
    ): Promise<PartnershipOperatorMap | null> {
        try {
            const wasteSource: PartnershipOperatorMap = new PartnershipOperatorMap({
                partnershipId,
                operatorId,
            });

            //get data some operator and healthcare
            let existingDataOperatorMap: any =
                await this.repo.findPartnershipOperatorMapByCondition({
                    partnership_id: partnershipId,
                    operator_id: operatorId,
                });
            if (existingDataOperatorMap) {
                console.error(
                    `OperatorId ${operatorId} and PartnershipId ${partnershipId} already exists`,
                );
                throw new Error(
                    `OperatorId ${operatorId} and PartnershipId ${partnershipId} already exists`,
                );
            }

            let dataOperatorMapHistory: any =
                await this.repo.findPartnershipOperatorMapByCondition({
                    partnership_id: partnership_id,
                    operator_id: operator_id,
                });

            if (!dataOperatorMapHistory) {
                console.error(`Partnership OperatorMap with operatorId ${operator_id} not found`);
                throw new Error(`Partnership OperatorMap with operatorId ${operator_id} not found`);
            }

            await this.repo.updatePartnershipOperatorMap(wasteSource, partnership_id, operator_id);
            console.log('Waste source updated successfully(execute):', wasteSource);
            return wasteSource;
        } catch (error) {
            console.error('Error creating waste source:', error);
            throw new Error(error instanceof Error ? error.message : String(error));
        }
    }
}
