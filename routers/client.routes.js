const express = require("express");
const { CONSTANTS } = require("../utils/constants");
const { CONTROLLERS } = require("../controllers/controllers.index");
const {
    verifyToken,
    verifyAdminToken,
    verifyForgotPasswordToken,
} = require("../middlewares/validation/tokenValidation");
const { uploads } = require("../middlewares/s3bucket/s3bucket");
const { isSuperAdmin } = require("../utils/common");
const { client_validation } = require("../middlewares/validation/clientValidations");
const router = express.Router();

//vehicle types
router.post(
    CONSTANTS.API_END_POINTS.CLIENTS.CREATE_VEHICLE_TYPE,
    client_validation.createVehicleTypeValidation,
    verifyAdminToken,
    isSuperAdmin,
    CONTROLLERS.CLIENT_CONTROLLERS.createVehicleType
);
router.put(
    CONSTANTS.API_END_POINTS.CLIENTS.UPDATE_VEHICLE_TYPE,
    client_validation.updateVehicleTypeValidation,
    verifyAdminToken,
    isSuperAdmin,
    CONTROLLERS.CLIENT_CONTROLLERS.updateType
);
router.get(
    CONSTANTS.API_END_POINTS.CLIENTS.GET_VEHICLE_TYPE_LIST,
    verifyAdminToken,
    isSuperAdmin,
    CONTROLLERS.CLIENT_CONTROLLERS.getVehicleTypeList
);
router.delete(
    CONSTANTS.API_END_POINTS.CLIENTS.DELETE_VEHICLE_TYPE_BY_ID,
    client_validation.vehicleTypeCategoryIdValidation,
    verifyAdminToken,
    isSuperAdmin,
    CONTROLLERS.CLIENT_CONTROLLERS.deleteVehicleType
);

// vehicle category
router.post(
    CONSTANTS.API_END_POINTS.CLIENTS.CREATE_VEHICLE_CATEGORY,
    client_validation.createVehicleTypeValidation,
    verifyAdminToken,
    isSuperAdmin,
    CONTROLLERS.CLIENT_CONTROLLERS.createVehicalCategory
);
router.put(
    CONSTANTS.API_END_POINTS.CLIENTS.UPDATE_VEHICLE_CATEGORY,
    client_validation.updateVehicleTypeValidation,
    verifyAdminToken,
    isSuperAdmin,
    CONTROLLERS.CLIENT_CONTROLLERS.updateCategory
);
router.get(
    CONSTANTS.API_END_POINTS.CLIENTS.GET_VEHICLE_CATEGORY_LIST,
    verifyAdminToken,
    isSuperAdmin,
    CONTROLLERS.CLIENT_CONTROLLERS.getVehicleCategoryList
);
router.delete(
    CONSTANTS.API_END_POINTS.CLIENTS.DELETE_VEHICLE_CATEGORY_BY_ID,
    client_validation.vehicleTypeCategoryIdValidation,
    verifyAdminToken,
    isSuperAdmin,
    CONTROLLERS.CLIENT_CONTROLLERS.deleteVehicleCategory
);

// client
router.post(
    CONSTANTS.API_END_POINTS.CLIENTS.CREATE_CLIENT,
    client_validation.createClientValidation,
    verifyAdminToken,
    isSuperAdmin,
    CONTROLLERS.CLIENT_CONTROLLERS.createClient
);
router.put(
    CONSTANTS.API_END_POINTS.CLIENTS.UPDATE_CLIENT,
    client_validation.updateClientValidation,
    verifyAdminToken,
    isSuperAdmin,
    CONTROLLERS.CLIENT_CONTROLLERS.updateClientDetailsByAdmin
);
router.get(
    CONSTANTS.API_END_POINTS.CLIENTS.GET_CLIENT_LIST,
    verifyAdminToken,
    isSuperAdmin,
    CONTROLLERS.CLIENT_CONTROLLERS.getClientList
);
router.delete(
    CONSTANTS.API_END_POINTS.CLIENTS.DEACTIVATE_CLIENT_BY_ID,
    client_validation.clientIdValidation,
    verifyAdminToken,
    isSuperAdmin,
    CONTROLLERS.CLIENT_CONTROLLERS.deactivateClient
);
router.put(
    CONSTANTS.API_END_POINTS.CLIENTS.ACTIVATE_CLIENT_BY_ID,
    client_validation.clientIdValidation,
    verifyAdminToken,
    isSuperAdmin,
    CONTROLLERS.CLIENT_CONTROLLERS.activateClient
);

module.exports = router;
