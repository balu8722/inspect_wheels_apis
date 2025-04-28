const express = require("express");
const { CONSTANTS } = require("../utils/constants");
const { CONTROLLERS } = require("../controllers/controllers.index");
const {
    auth_validation,
} = require("../middlewares/validation/authvalidations");
const {
    endPointDetectMiddleware,
} = require("../middlewares/validation/endpointDetect");
const {
    verifyToken,
    verifyAdminToken,
} = require("../middlewares/validation/tokenValidation");
const { uploads } = require("../middlewares/s3bucket/s3bucket");
const { valuator_validation } = require("../middlewares/validation/valuatorvalidations");
const { isSuperAdmin } = require("../utils/common");
const router = express.Router();

// CREATE VALUATOR
router.post(
    CONSTANTS.API_END_POINTS.VALUATOR.CREATE_VALUATOR,
    valuator_validation.create_valuator_Validation,
    verifyToken,
    isSuperAdmin,   
    CONTROLLERS.VALUATOR_CONTROLLERS.createvaluator
);

// UPDATE VALUATOR
router.put(
    CONSTANTS.API_END_POINTS.VALUATOR.UPDATE_VALUATOR,
    valuator_validation.update_valuator_Validation,
    verifyToken,
    isSuperAdmin, 
    CONTROLLERS.VALUATOR_CONTROLLERS.updatevaluator
);

// UPDATE VALUATOR BY THEMSELVES

router.put(
    CONSTANTS.API_END_POINTS.VALUATOR.UPDATE_VALUATOR_THEMSELVES,
    verifyToken,
    CONTROLLERS.VALUATOR_CONTROLLERS.updatethemselves
);


// GET GET VALUATOR LIST
router.get(
    CONSTANTS.API_END_POINTS.VALUATOR.GET_VALUATOR_LIST,
    verifyToken,
    CONTROLLERS.VALUATOR_CONTROLLERS.getValuatorList
);

// GET GET SO BY ID
router.get(
    CONSTANTS.API_END_POINTS.VALUATOR.GET_VALUATOR_BY_ID,
    verifyToken,
    CONTROLLERS.VALUATOR_CONTROLLERS.getValuatorById
);

// DELETE VALUATOR BY ID

router.delete(
    CONSTANTS.API_END_POINTS.VALUATOR.DELETE_VALUATOR_BY_ID,
    verifyToken,
    CONTROLLERS.VALUATOR_CONTROLLERS.deleteValuatorById
);


// ACTIVATE THE VALUATOR

router.put(
    CONSTANTS.API_END_POINTS.VALUATOR.ACTIVATE_VALUATOR_BY_ID,
    verifyToken,
    CONTROLLERS.VALUATOR_CONTROLLERS.activateValuator
);

module.exports = router;
