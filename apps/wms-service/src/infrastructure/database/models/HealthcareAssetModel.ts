import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../db.connection';

export interface HealthcareAssetAttributes {
  id: number;
  healthcareFacilityId: number;
  assetTypeName: string;
  assetWorkingStatusName: string;
  status: boolean;
  assetId?: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
  deletedBy?: number | null;
}

interface HealthcareAssetCreationAttributes extends Optional<HealthcareAssetAttributes, 'id'> {}

export class HealthcareAssetModel extends Model<
  HealthcareAssetAttributes,
  HealthcareAssetCreationAttributes
> {}

HealthcareAssetModel.init(
  {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      primaryKey: true,
    },
    assetId: {
      type: DataTypes.STRING(64),
      allowNull: true,
      field: 'asset_id',
    },
    assetTypeName: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: 'asset_type_name',
    },
    healthcareFacilityId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'entity_id',
    },
    assetWorkingStatusName: {
      type: DataTypes.STRING(64),
      allowNull: false,
      field: 'asset_working_status_name',
    },
    status: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'status',
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'created_at',
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'updated_at',
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
    tableName: 'healthcare_asset',
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
    ],
  },
);

export default HealthcareAssetModel;
