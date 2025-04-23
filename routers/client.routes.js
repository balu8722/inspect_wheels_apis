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


module.exports = router;
