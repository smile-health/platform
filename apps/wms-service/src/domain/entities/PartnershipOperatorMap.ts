import { PartnershipAttributes } from '../../infrastructure/database/models/PartnershipModel';

export default class PartnershipOperatorMap {
    public partnershipId: number;
    public operatorId: string;
    public partnership: PartnershipAttributes | undefined;
    public consumerName?: string;
    public operatorName?: string;
    public userName?: string;
    public firstName?: string;
    public lastName?: string;
    public entityName?: string;
    public entityType?: string;
    public email?: string;
    public mobilePhone?: string;
    public userRole?: string;
    public companyType?: string;

    constructor(partnershipOperatorMap: {
        partnershipId: number;
        operatorId: string;
        partnership?: PartnershipAttributes;
        consumerName?: string;
        operatorName?: string;
        userName?: string;
        firstName?: string;
        lastName?: string;
        entityName?: string;
        entityType?: string;
        email?: string;
        mobilePhone?: string;
        userRole?: string;
        companyType?: string;
    }) {
        this.partnershipId = partnershipOperatorMap.partnershipId;
        this.operatorId = partnershipOperatorMap.operatorId;
        this.partnership = partnershipOperatorMap.partnership;
        this.consumerName = partnershipOperatorMap.consumerName;
        this.operatorName = partnershipOperatorMap.operatorName;
        this.userName = partnershipOperatorMap.userName;
        this.firstName = partnershipOperatorMap.firstName;
        this.lastName = partnershipOperatorMap.lastName;
        this.entityName = partnershipOperatorMap.entityName;
        this.entityType = partnershipOperatorMap.entityType;
        this.email = partnershipOperatorMap.email;
        this.mobilePhone = partnershipOperatorMap.mobilePhone;
        this.userRole = partnershipOperatorMap.userRole;
        this.companyType = partnershipOperatorMap.companyType;
    }
}

export class OperatorsSelectDTO {
    public operatorId: string;
    public operatorName?: string;

    constructor(partnership: { operatorId: string; operatorName?: string }) {
        this.operatorId = partnership.operatorId;
        this.operatorName = partnership.operatorName;
    }
}
