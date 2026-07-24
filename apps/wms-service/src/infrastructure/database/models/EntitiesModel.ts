import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../db.connection';
import HealthcareAssetModel from './HealthcareAssetModel';

export interface EntitiesAttributes {
  id: number;
  name: string;
  type?: number;
  address?: string;
  tag?: string;
  province_id?: string;
  regency_id?: string;
  sub_district_id?: string;
  village_id?: string;
  integration_type?: number;
  integration_client_id?: number;
  location?: string;
  external_properties?: object;
  entity_type_id?: number;
  entity_type_name?: string;
  entity_type_integration_type?: number;
  entity_type_external_properties?: string;
  province_name?: string;
  regency_name?: string;
  district_name?: string;
  updated_at?: Date;
  code?: string;
  id_satu_sehat?: number;
  nib?: string;
  head_name?: string;
  email?: string;
  gender?: number;
  mobile_phone?: string;
  latitude?: number;
  longitude?: number;
  total_bad_room?: number;
  percentage_bad_room?: number;
  is_active?: boolean;
  deletedAt?: Date | null;
  deletedBy?: number | null;
}

interface EntitiesCreationAttributes extends Optional<EntitiesAttributes, 'id'> {}

class EntitiesModel
  extends Model<EntitiesAttributes, EntitiesCreationAttributes>
  implements EntitiesAttributes
{
  id!: number;
  name!: string;
  type?: number;
  address?: string;
  tag?: string;
  province_id?: string;
  regency_id?: string;
  sub_district_id?: string;
  village_id?: string;
  integration_type?: number;
  integration_client_id?: number;
  location?: string;
  external_properties?: object;
  entity_type_id?: number;
  entity_type_name?: string;
  entity_type_integration_type?: number;
  entity_type_external_properties?: string;
  province_name?: string;
  regency_name?: string;
  district_name?: string;
  updated_at?: Date;
  code?: string;
  id_satu_sehat?: number;
  nib?: string;
  head_name?: string;
  email?: string;
  gender?: number;
  mobile_phone?: string;
  latitude?: number;
  longitude?: number;
  total_bad_room?: number;
  percentage_bad_room?: number;
  is_active?: boolean;
}

EntitiesModel.init(
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      allowNull: false,
      autoIncrement: false,
    },
    name: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    type: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    address: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    tag: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    province_id: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    regency_id: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    sub_district_id: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    village_id: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    integration_type: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    integration_client_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    location: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    external_properties: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    // entity_type flatten
    entity_type_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    entity_type_name: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    entity_type_integration_type: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    entity_type_external_properties: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    province_name: {
      type: DataTypes.STRING(64),
      allowNull: true,
    },
    regency_name: {
      type: DataTypes.STRING(64),
      allowNull: true,
    },
    district_name: {
      type: DataTypes.STRING(64),
      allowNull: true,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    code: {
      type: DataTypes.STRING(32),
      allowNull: true,
    },
    id_satu_sehat: {
      type: DataTypes.BIGINT,
      allowNull: true,
    },
    nib: {
      type: DataTypes.STRING(64),
      allowNull: true,
    },
    head_name: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    gender: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    mobile_phone: {
      type: DataTypes.STRING(32),
      allowNull: true,
    },
    latitude: {
      type: DataTypes.FLOAT(10, 6),
      allowNull: true,
    },
    longitude: {
      type: DataTypes.FLOAT(10, 6),
      allowNull: true,
    },
    total_bad_room: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    percentage_bad_room: {
      type: DataTypes.FLOAT(7, 2),
      allowNull: true,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: true,
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
    tableName: 'entities',
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
        name: 'name_idx',
        using: 'BTREE',
        fields: [{ name: 'name' }],
      },
      {
        name: 'province_id_idx',
        using: 'BTREE',
        fields: [{ name: 'province_id' }],
      },
      {
        name: 'village_id_idx',
        using: 'BTREE',
        fields: [{ name: 'village_id' }],
      },
    ],
  },
);

EntitiesModel.hasMany(HealthcareAssetModel, {
  foreignKey: 'healthcareFacilityId',
  as: 'healthcareAssets',
});

export default EntitiesModel;
