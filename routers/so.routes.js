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
const { so_validation } = require("../middlewares/validation/sovalidation");
const { isSuperAdmin } = require("../utils/common");
const router = express.Router();

// CREATE SO
router.post(
    CONSTANTS.API_END_POINTS.SO.CREATE_SO,
    so_validation.createsoValidation,
    verifyToken,
    isSuperAdmin,   
    CONTROLLERS.SO_CONTROLLERS.createso
);

// UPDATE SO
router.put(
    CONSTANTS.API_END_POINTS.SO.UPDATE_SO,
    so_validation.updatesoValidation,
    verifyToken,
    isSuperAdmin, 
    CONTROLLERS.SO_CONTROLLERS.updateso
);

// UPDATE SO BY THEMSELVES

router.put(
    CONSTANTS.API_END_POINTS.SO.UPDATE_SO_THEMSELVES,
    verifyToken,
    CONTROLLERS.SO_CONTROLLERS.updatethemselves
);


// GET GET SO LIST
router.get(
    CONSTANTS.API_END_POINTS.SO.GET_SO_LIST,
    verifyToken,
    CONTROLLERS.SO_CONTROLLERS.getROList
);

// GET GET SO BY ID
router.get(
    CONSTANTS.API_END_POINTS.SO.GET_SO_BY_ID,
    verifyToken,
    CONTROLLERS.SO_CONTROLLERS.getSOById
);

// DELETE SO BY ID

router.delete(
    CONSTANTS.API_END_POINTS.SO.DELETE_SO_BY_ID,
    verifyToken,
    CONTROLLERS.SO_CONTROLLERS.deleteSOById
);

module.exports = router;
