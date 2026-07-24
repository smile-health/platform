import { DataTypes, Model, Optional, Sequelize } from 'sequelize';
import { sequelize } from '../db.connection';
import WasteSourceModel from './WasteSourceModel';
import { WasteClassificationModel } from './WasteClassificationModel';

export interface WasteBagQrCodeAttributes {
  id?: number;
  createdBy?: string;
  createdAt?: Date;
  healthcareFacilityId: number;
  wasteSourceId?: number;
  wasteClassificationId?: number;
  qrCode: string;
  wasteSource?: any;
  wasteClassification?: any;
  deletedAt?: Date | null;
  deletedBy?: number | null;
}

interface WasteBagQrCodeCreationAttributes extends Optional<WasteBagQrCodeAttributes, 'id'> {}

export class WasteBagQrCodeModel extends Model<
  WasteBagQrCodeAttributes,
  WasteBagQrCodeCreationAttributes
> {
  id?: number;
  createdBy!: string;
  createdAt!: Date;
  healthcareFacilityId?: number;
  wasteSourceId?: number;
  wasteClassificationId?: number;
  qrCode!: string;
  wasteSource?: any;
  wasteClassification?: any;
}

WasteBagQrCodeModel.init(
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
    healthcareFacilityId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
      field: 'healthcare_facility_id',
    },
    wasteClassificationId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
      field: 'waste_classification_id',
    },
    wasteSourceId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
      field: 'waste_source_id',
    },
    qrCode: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      field: 'qr_code',
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.fn('now'),
      field: 'created_at',
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
    tableName: 'waste_bag_qr_code',
    paranoid: true,
    deletedAt: 'deleted_at',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
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

WasteBagQrCodeModel.belongsTo(WasteClassificationModel, {
  foreignKey: 'waste_classification_id',
  as: 'wasteClassification',
});

WasteBagQrCodeModel.belongsTo(WasteSourceModel, {
  foreignKey: 'waste_source_id',
  as: 'wasteSource',
});

// WasteBagQrCodeModel.addHook('afterCreate', async (instance: WasteBagQrCodeModel) => {
//   const date = new Date();
//   const formattedDate = date.toISOString().slice(0, 10).replace(/-/g, '');
//   instance.qrCode = `${instance.id}${formattedDate}`;
//   await instance.save({ hooks: false });
// });

export default WasteBagQrCodeModel;
