import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../db.connection';

export interface WasteHierarchyAttributes {
    id?: number;
    createdBy?: string;
    updatedBy?: string;
    regionId: number;
    name: string;
    nameEn: string;
    description?: string;
    descriptionEn?: string;
    parentHierarchyId?: number | null;
    level?: number | 0;
    isResidue?: boolean;
    isActive?: boolean;
    deletedAt?: Date | null;
    deletedBy?: number | null;
}

interface WasteHierarchyCreationAttributes extends Optional<WasteHierarchyAttributes, 'id'> {}

export class WasteHierarchyModel extends Model<
    WasteHierarchyAttributes,
    WasteHierarchyCreationAttributes
> {}

WasteHierarchyModel.init(
    {
        id: {
            type: DataTypes.INTEGER.UNSIGNED,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false,
        },
        createdBy: {
            type: DataTypes.STRING(32),
            allowNull: false,
            field: 'created_by',
        },
        updatedBy: {
            type: DataTypes.STRING(32),
            allowNull: false,
            field: 'updated_by',
        },
        regionId: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
            field: 'region_id',
        },
        parentHierarchyId: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: true,
            field: 'parent_hierarchy_id',
        },
        name: {
            type: DataTypes.STRING(64),
            allowNull: false,
        },
        nameEn: {
            type: DataTypes.STRING(64),
            allowNull: false,
            field: 'name_en',
        },
        description: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        descriptionEn: {
            type: DataTypes.STRING(255),
            allowNull: true,
            field: 'description_en',
        },
        level: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
            defaultValue: 0,
        },
        isResidue: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
            defaultValue: false,
            field: 'is_residue',
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
            defaultValue: true,
            field: 'is_active',
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
        tableName: 'waste_hierarchy',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        paranoid: true,
        deletedAt: 'deleted_at',
        // paranoid: true,
        // defaultScope: {
        //     where: {
        //         isActive: false,
        //     },
        // },
        sequelize,
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

WasteHierarchyModel.belongsTo(WasteHierarchyModel, {
    foreignKey: 'parent_hierarchy_id',
    as: 'wasteType',
    scope: {
        level: 0,
    },
});

WasteHierarchyModel.belongsTo(WasteHierarchyModel, {
    foreignKey: 'parent_hierarchy_id',
    as: 'wasteGroup',
    scope: {
        level: 1,
    },
});

export default WasteHierarchyModel;
