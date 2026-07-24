import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../db.connection';
import { PartnerVehicleAttributes, PartnerVehicleModel } from './PartnerVehicleModel';

export interface WasteTransportationExternalGroupAttributes {
  id?: number;
  createdBy?: string;
  updatedBy?: string;
  created_at?: Date;
  updated_at?: Date;
  totalBagsCount: number;
  totalWeightInKgs: number;
  transporterId: number;
  transporterVehicleId?: number;
  transporterOperatorId?: string;
  treatmentProviderId?: number;
  treatmentOperatorId?: string;
  handoverLattitude?: number;
  handoverLongitude?: number;
  transportationStatus: 'READY_FOR_TRANSPORT' | 'TRANSPORTATION_REQUEST_CREATED' | 'IN_TRANSIT';
  handoverTimestamp?: Date;
  isReadOnly?: boolean;
  groupId?: string;
  wasteTreatmentExternalGroupId?: number;
  wasteBags?: any;
  pickupAt?: Date;
  partnerVehicle?: PartnerVehicleAttributes;
  deletedAt?: Date | null;
  deletedBy?: number | null;
}

interface WasteTransportationExternalGroupCreationAttributes
  extends Optional<
    WasteTransportationExternalGroupAttributes,
    'id' | 'created_at' | 'updated_at'
  > {}

export class WasteTransportationExternalGroupModel
  extends Model<
    WasteTransportationExternalGroupAttributes,
    WasteTransportationExternalGroupCreationAttributes
  >
  implements WasteTransportationExternalGroupAttributes
{
  id?: number;
  createdBy?: string;
  updatedBy?: string;
  created_at?: Date;
  updated_at?: Date;
  totalBagsCount!: number;
  totalWeightInKgs!: number;
  transporterId!: number;
  transporterVehicleId?: number;
  transporterOperatorId?: string;
  treatmentProviderId?: number;
  treatmentOperatorId?: string;
  handoverLattitude?: number;
  handoverLongitude?: number;
  transportationStatus!: 'READY_FOR_TRANSPORT' | 'TRANSPORTATION_REQUEST_CREATED' | 'IN_TRANSIT';
  handoverTimestamp?: Date;
  isReadOnly?: boolean;
  groupId?: string;
  wasteTreatmentExternalGroupId?: number;
  wasteBags?: any;
  pickupAt?: Date;
}

WasteTransportationExternalGroupModel.init(
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
    totalBagsCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      field: 'total_bags_count',
    },
    totalWeightInKgs: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'total_weight_in_kgs',
    },
    transporterId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      field: 'transporter_id',
    },
    transporterVehicleId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      field: 'transporter_vehicle_id',
    },
    transporterOperatorId: {
      type: DataTypes.STRING(36),
      allowNull: true,
      field: 'transporter_operator_id',
    },
    treatmentProviderId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      field: 'treatment_provider_id',
    },
    treatmentOperatorId: {
      type: DataTypes.STRING(36),
      allowNull: true,
      field: 'treatment_operator_id',
    },
    handoverLattitude: {
      type: DataTypes.FLOAT(10, 6),
      allowNull: true,
      field: 'handover_lattitude',
    },
    handoverLongitude: {
      type: DataTypes.FLOAT(10, 6),
      allowNull: true,
      field: 'handover_longitude',
    },
    handoverTimestamp: {
      type: DataTypes.DATE(3),
      allowNull: true,
      defaultValue: null,
      field: 'handover_timestamp',
    },
    transportationStatus: {
      type: DataTypes.ENUM('READY_FOR_TRANSPORT', 'TRANSPORTATION_REQUEST_CREATED', 'IN_TRANSIT'),
      allowNull: false,
      defaultValue: 'READY_FOR_TRANSPORT',
      field: 'transportation_status',
    },
    isReadOnly: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'is_read_only',
    },
    groupId: {
      type: DataTypes.STRING(36),
      allowNull: false,
      field: 'group_id',
    },
    wasteTreatmentExternalGroupId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'waste_treatment_external_group_id',
    },
    pickupAt: {
      type: DataTypes.DATE(3),
      allowNull: true,
      defaultValue: null,
      field: 'pickup_at',
    },
    updated_at: {
      type: DataTypes.DATE(3),
      allowNull: true,
      defaultValue: null,
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
    sequelize,
    tableName: 'waste_transportation_external_group',
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
      {
        name: 'waste_transportation_external_group_transporter_id',
        using: 'BTREE',
        fields: [{ name: 'transporter_id' }],
      },
      {
        name: 'waste_transportation_external_group_created_at',
        using: 'BTREE',
        fields: [{ name: 'created_at' }],
      },
    ],
  },
);

WasteTransportationExternalGroupModel.belongsTo(PartnerVehicleModel, {
  foreignKey: 'transporter_vehicle_id',
  as: 'partnerVehicle',
});

export default WasteTransportationExternalGroupModel;
