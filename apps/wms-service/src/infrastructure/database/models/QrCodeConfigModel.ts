import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../db.connection';
import WasteSourceModel from '../../../infrastructure/database/models/WasteSourceModel';
import { WasteClassificationModel } from './WasteClassificationModel';

export interface QrCodeConfigAttributes {
    id?: number;
    createdBy?: string;
    updatedBy?: string;
    healthcareFacilityId: number;
    wasteSourceId: number;
    wasteClassificationId: number;
    labelCount: number;
    deletedAt?: Date | null;
    deletedBy?: number | null;
}

interface QrCodeConfigCreationAttributes extends Optional<QrCodeConfigAttributes, 'id'> {}

export class QrCodeConfigModel extends Model<
    QrCodeConfigAttributes,
    QrCodeConfigCreationAttributes
> {}

QrCodeConfigModel.init(
    {
        id: {
            autoIncrement: true,
            type: DataTypes.BIGINT.UNSIGNED,
            allowNull: false,
            primaryKey: true,
        },
        createdBy: {
            type: DataTypes.STRING(36),
            allowNull: false,
            field: 'created_by',
        },
        updatedBy: {
            type: DataTypes.STRING(36),
            allowNull: false,
            field: 'updated_by',
        },
        healthcareFacilityId: {
            type: DataTypes.BIGINT.UNSIGNED,
            allowNull: false,
            field: 'healthcare_facility_id',
        },
        wasteSourceId: {
            type: DataTypes.BIGINT.UNSIGNED,
            allowNull: false,
            field: 'waste_source_id',
        },
        wasteClassificationId: {
            type: DataTypes.BIGINT.UNSIGNED,
            allowNull: false,
            field: 'waste_classification_id',
        },
        labelCount: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
            field: 'label_count',
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
        tableName: 'qr_code_config',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        paranoid: true,
        deletedAt: 'deleted_at',
        indexes: [
            {
                name: 'PRIMARY',
                unique: true,
                using: 'BTREE',
                fields: [{ name: 'id' }],
            },
        ],
    },
);

QrCodeConfigModel.belongsTo(WasteSourceModel, {
    foreignKey: 'waste_source_id',
    as: 'wasteSource',
});

QrCodeConfigModel.belongsTo(WasteClassificationModel, {
    foreignKey: 'waste_classification_id',
    as: 'wasteClassification',
});

WasteSourceModel.hasMany(QrCodeConfigModel, {
    foreignKey: 'waste_source_id',
    as: 'qrCodeConfig',
});

export default QrCodeConfigModel;
