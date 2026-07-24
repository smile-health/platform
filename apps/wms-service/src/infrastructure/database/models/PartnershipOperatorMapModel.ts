import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../db.connection';
import PartnershipModel from './PartnershipModel';

export interface PartnershipOperatorMapAttributes {
    partnership_id: number;
    operator_id: string;
    operatorName?: string;
    consumerName?: string;
    deletedAt?: Date | null;
    deletedBy?: number | null;
}

interface PartnershipOperatorMapCreationAttributes
    extends Optional<PartnershipOperatorMapAttributes, 'partnership_id'> {}

export class PartnershipOperatorMapModel
    extends Model<PartnershipOperatorMapAttributes, PartnershipOperatorMapCreationAttributes>
    implements PartnershipOperatorMapAttributes
{
    partnership_id!: number;
    operator_id!: string;
}

PartnershipOperatorMapModel.init(
    {
        partnership_id: {
            type: DataTypes.BIGINT.UNSIGNED,
            allowNull: false,
            primaryKey: true,
        },
        operator_id: {
            type: DataTypes.STRING(36),
            allowNull: false,
            primaryKey: true,
        },
        deletedAt: {
            type: DataTypes.DATE,
            allowNull: true,
            field: 'deleted_at',
        },
        deletedBy: {
            type: DataTypes.BIGINT,
            allowNull: true,
            field: 'deleted_by',
        },
    },
    {
        sequelize,
        tableName: 'partnership_operator_map',
        timestamps: true,
        createdAt: false,
        updatedAt: false,
        paranoid: true,
        deletedAt: 'deleted_at',
        indexes: [
            {
                name: 'partnership_id',
                using: 'BTREE',
                fields: [{ name: 'partnership_id' }],
            },
            {
                name: 'operator_id',
                using: 'BTREE',
                fields: [{ name: 'operator_id' }],
            },
        ],
    },
);

PartnershipOperatorMapModel.belongsTo(PartnershipModel, {
    foreignKey: 'partnership_id',
    as: 'partnership',
});

export default PartnershipOperatorMapModel;
