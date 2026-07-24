import { DataTypes, Model, Optional, Sequelize } from 'sequelize';
import { sequelize } from '../db.connection';
import WasteBagModel from './WasteBagModel';

export interface DisposalItemsAttributes {
    id?: number;
    materialId: number;
    bastNo: string;
    materialName: string;
    qty: number;
    deletedAt?: Date | null;
    deletedBy?: number | null;
}

interface DisposalCreationAttributes extends Optional<DisposalItemsAttributes, 'id'> {}

export class DisposalItemsModel extends Model<DisposalItemsAttributes, DisposalCreationAttributes> {
    id?: number;
    materialId!: number;
    bastNo!: string;
    materialName!: string;
    qty!: number;
}

DisposalItemsModel.init(
    {
        id: {
            type: DataTypes.BIGINT.UNSIGNED,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
        },
        materialId: {
            type: DataTypes.BIGINT.UNSIGNED,
            allowNull: false,
            field: 'material_id',
        },
        bastNo: {
            type: DataTypes.STRING(100),
            allowNull: false,
            field: 'bast_no',
        },
        materialName: {
            type: DataTypes.STRING(255),
            allowNull: false,
            field: 'material_name',
        },
        qty: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true,
            field: 'qty',
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
        tableName: 'disposal_items',
        timestamps: true,
        createdAt: false,
        updatedAt: false,
        sequelize,
        paranoid: true,
        deletedAt: 'deleted_at',
        indexes: [
            {
                name: 'PRIMARY',
                unique: true,
                using: 'BTREE',
                fields: [{ name: 'id' }],
            },
            {
                name: 'idx_disposal_items_material_id',
                using: 'BTREE',
                fields: [{ name: 'material_id' }],
            },
            {
                name: 'idx_disposal_items_bast_no',
                using: 'BTREE',
                fields: [{ name: 'bast_no' }],
            },
            {
                name: 'idx_disposal_items_material_name',
                using: 'BTREE',
                fields: [{ name: 'material_name' }],
            },
        ],
    },
);

DisposalItemsModel.belongsTo(WasteBagModel, {
    as: 'wasteBag',
    foreignKey: { name: 'bastNo', field: 'bast_no' },
    targetKey: 'bastNo',
    constraints: false,
});

export default DisposalItemsModel;
