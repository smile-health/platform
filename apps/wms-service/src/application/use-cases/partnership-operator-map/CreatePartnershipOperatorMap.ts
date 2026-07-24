import PartnershipOperatorMap from '../../../domain/entities/PartnershipOperatorMap';
import PartnershipOperatorMapRepository from '../../../domain/repositories/PartnershipOperatorMapRepository';
import CreatePartnershipOperatorMapDTO from '../../dtos/CreatePartnershipOperatorMapDTO';
import PartnershipRepository from '../../../domain/repositories/PartnershipRepository';

export default class CreatePartnershipOperatorMapUseCase {
    constructor(
        private readonly partnerOperator: PartnershipOperatorMapRepository,
        private readonly partnership: PartnershipRepository,
    ) {}

    async execute(data: CreatePartnershipOperatorMapDTO): Promise<PartnershipOperatorMap | string> {
        try {
            const { partnershipId, operatorId } = data;

            const wasteSource: PartnershipOperatorMap = new PartnershipOperatorMap({
                partnershipId,
                operatorId,
            });

            //get data some operator and healthcare
            let existingDataOperatorMap: any =
                await this.partnerOperator.findPartnershipOperatorMapByCondition({
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

            const validationPartnership = await this.partnership.getPartnershipById(
                partnershipId.toString(),
                '',
            );

            if (!validationPartnership) {
                return `No partnership for ID ${partnershipId}`;
            }

            await this.partnerOperator.createPartnershipOperatorMap(wasteSource);
            console.log('Partnership OperatorMap created successfully(execute):', wasteSource);
            return wasteSource;
        } catch (error) {
            console.error('Error creating waste source:', error);
            throw new Error(error instanceof Error ? error.message : String(error));
        }
    }
}
