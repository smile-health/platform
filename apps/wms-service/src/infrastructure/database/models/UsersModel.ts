import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../db.connection';
import EntitiesModel from './EntitiesModel';
import UserRoleModel from './UserRoleModel';

export interface UsersAttributes {
    id?: number;
    user_uuid: string;
    entity_id: number;
    firstname?: string;
    lastname?: string;
    email?: string;
    username?: string;
    mobile_phone?: string;
    gender?: number;
    gender_label?: string;
    date_of_birth?: string;
    role?: number;
    role_id?: number;
    role_label?: string;
    view_only?: boolean;
    status?: number;
    last_device?: number;
    last_login?: string;
    integration_client_id?: number;
    keycloak_uuid?: string;
    external_roles?: string;
    address?: string;
    manufacture_id?: number;
    village_id?: string;
    external_properties?: object;
    deleted_at?: string;
    created_at?: string;
    updated_at?: string;
    created_by?: number;
    updated_by?: number;
    deleted_by?: number;
    is_active?: boolean;
}

interface UsersCreationAttributes extends Optional<UsersAttributes, 'id'> {}

class UsersModel
    extends Model<UsersAttributes, UsersCreationAttributes>
    implements UsersAttributes
{
    id?: number;
    user_uuid!: string;
    entity_id!: number;
    firstname?: string;
    lastname?: string;
    email?: string;
    username?: string;
    mobile_phone?: string;
    gender?: number;
    gender_label?: string;
    date_of_birth?: string;
    role?: number;
    role_id?: number;
    role_label?: string;
    view_only?: boolean;
    status?: number;
    last_device?: number;
    last_login?: string;
    integration_client_id?: number;
    keycloak_uuid?: string;
    external_roles?: string;
    address?: string;
    manufacture_id?: number;
    village_id?: string;
    external_properties?: object;
    deleted_at?: string;
    created_at?: string;
    updated_at?: string;
    created_by?: number;
    updated_by?: number;
    deleted_by?: number;
    is_active?: boolean;
}

UsersModel.init(
    {
        id: {
            type: DataTypes.BIGINT,
            primaryKey: true,
            allowNull: false,
        },
        user_uuid: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        entity_id: {
            type: DataTypes.BIGINT,
            allowNull: false,
        },
        firstname: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        lastname: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        email: {
            type: DataTypes.STRING(150),
            allowNull: true,
            unique: true,
        },
        username: {
            type: DataTypes.STRING(100),
            allowNull: true,
            unique: true,
        },
        mobile_phone: {
            type: DataTypes.STRING(20),
            allowNull: true,
        },
        gender: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        gender_label: {
            type: DataTypes.STRING(20),
            allowNull: true,
        },
        date_of_birth: {
            type: DataTypes.DATEONLY,
            allowNull: true,
        },
        role: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        role_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        role_label: {
            type: DataTypes.STRING(50),
            allowNull: true,
        },
        view_only: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
        status: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        last_device: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        last_login: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        integration_client_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        keycloak_uuid: {
            type: DataTypes.UUID,
            allowNull: true,
        },
        external_roles: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        address: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        manufacture_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        village_id: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        external_properties: {
            type: DataTypes.JSON,
            allowNull: true,
        },
        deleted_at: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        created_at: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        updated_at: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        created_by: {
            type: DataTypes.BIGINT,
            allowNull: true,
        },
        updated_by: {
            type: DataTypes.BIGINT,
            allowNull: true,
        },
        deleted_by: {
            type: DataTypes.BIGINT,
            allowNull: true,
        },
        is_active: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
            defaultValue: true,
        },
    },
    {
        tableName: 'users',
        sequelize,
        timestamps: true,
        createdAt: false,
        updatedAt: false,
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
                name: 'user_uuid_idx',
                using: 'BTREE',
                fields: [{ name: 'user_uuid' }],
            },
            {
                name: 'entity_id_idx',
                using: 'BTREE',
                fields: [{ name: 'entity_id' }],
            },
            {
                name: 'email_idx',
                using: 'BTREE',
                fields: [{ name: 'email' }],
            },
            {
                name: 'username_idx',
                using: 'BTREE',
                fields: [{ name: 'username' }],
            },
        ],
    },
);

UsersModel.belongsTo(EntitiesModel, {
    foreignKey: 'entity_id',
    as: 'entity',
});

UsersModel.belongsTo(UserRoleModel, {
    foreignKey: 'external_roles',
    targetKey: 'type',
    as: 'userRole',
});

export default UsersModel;
