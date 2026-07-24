var DataTypes = require('sequelize').DataTypes;
var _asset_manufacturer = require('./asset_manufacturer');
var _asset_model = require('./asset_model');
var _entity_location = require('./entity_location');
var _entity_settings = require('./entity_settings');
var _global_settings = require('./global_settings');
var _healthcare_facility_asset = require('./healthcare_facility_asset');
var _healthcare_facility_asset_activity = require('./healthcare_facility_asset_activity');
var _partner_vehicle = require('./partner_vehicle');
var _partnership = require('./partnership');
var _partnership_operator_map = require('./partnership_operator_map');
var _partnership_vehicle_map = require('./partnership_vehicle_map');
var _qr_code_config = require('./qr_code_config');
var _region = require('./region');
var _scale_data = require('./scale_data');
var _permission = require('./permission');
var _transporter_operator_coodinates = require('./transporter_operator_coodinates');
var _user_role = require('./user_role');
var _user_role_permission_map = require('./user_role_permission_map');
var _waste_bag_audit_trail = require('./waste_bag_audit_trail');
var _waste_bag_qr_code = require('./waste_bag_qr_code');
var _waste_bag = require('./waste_bag');
var _waste_classification = require('./waste_classification');
var _waste_hierarchy = require('./waste_hierarchy');
var _waste_source = require('./waste_source');
var _waste_transportation_group = require('./waste_transportation_group');
var _waste_transportation_request = require('./waste_transportation_request');
var _waste_treatment_group = require('./waste_treatment_group');
var _waste_treatment_request = require('./waste_treatment_request');
var _waste_transportation_external_group = require('./waste_transportation_external_group');
var _waste_treatment_external_group = require('./waste_treatment_external_group');

function initModels(sequelize) {
    var asset_manufacturer = _asset_manufacturer(sequelize, DataTypes);
    var asset_model = _asset_model(sequelize, DataTypes);
    var entity_location = _entity_location(sequelize, DataTypes);
    var entity_settings = _entity_settings(sequelize, DataTypes);
    var global_settings = _global_settings(sequelize, DataTypes);
    var healthcare_facility_asset = _healthcare_facility_asset(sequelize, DataTypes);
    var healthcare_facility_asset_activity = _healthcare_facility_asset_activity(
        sequelize,
        DataTypes,
    );
    var partner_vehicle = _partner_vehicle(sequelize, DataTypes);
    var partnership = _partnership(sequelize, DataTypes);
    var partnership_operator_map = _partnership_operator_map(sequelize, DataTypes);
    var partnership_vehicle_map = _partnership_vehicle_map(sequelize, DataTypes);
    var qr_code_config = _qr_code_config(sequelize, DataTypes);
    var region = _region(sequelize, DataTypes);
    var scale_data = _scale_data(sequelize, DataTypes);
    var permission = _permission(sequelize, DataTypes);
    var transporter_operator_coodinates = _transporter_operator_coodinates(sequelize, DataTypes);
    var user_role = _user_role(sequelize, DataTypes);
    var user_role_permission_map = _user_role_permission_map(sequelize, DataTypes);
    var waste_bag_audit_trail = _waste_bag_audit_trail(sequelize, DataTypes);
    var waste_bag_qr_code = _waste_bag_qr_code(sequelize, DataTypes);
    var waste_bag = _waste_bag(sequelize, DataTypes);
    var waste_classification = _waste_classification(sequelize, DataTypes);
    var waste_hierarchy = _waste_hierarchy(sequelize, DataTypes);
    var waste_source = _waste_source(sequelize, DataTypes);
    var waste_transportation_group = _waste_transportation_group(sequelize, DataTypes);
    var waste_transportation_request = _waste_transportation_request(sequelize, DataTypes);
    var waste_treatment_group = _waste_treatment_group(sequelize, DataTypes);
    var waste_treatment_request = _waste_treatment_request(sequelize, DataTypes);
    var waste_transportation_external_group = _waste_transportation_external_group(
        sequelize,
        DataTypes,
    );
    var waste_treatment_external_group = _waste_treatment_external_group(sequelize, DataTypes);

    return {
        asset_manufacturer,
        asset_model,
        entity_location,
        entity_settings,
        global_settings,
        healthcare_facility_asset,
        healthcare_facility_asset_activity,
        partner_vehicle,
        partnership,
        partnership_operator_map,
        partnership_vehicle_map,
        qr_code_config,
        region,
        scale_data,
        permission,
        transporter_operator_coodinates,
        user_role,
        user_role_permission_map,
        waste_bag_audit_trail,
        waste_bag_qr_code,
        waste_bag,
        waste_classification,
        waste_hierarchy,
        waste_source,
        waste_transportation_group,
        waste_transportation_request,
        waste_treatment_group,
        waste_treatment_request,
        waste_transportation_external_group,
        waste_treatment_external_group,
    };
}
module.exports = initModels;
module.exports.initModels = initModels;
module.exports.default = initModels;
