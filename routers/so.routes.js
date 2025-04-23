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

router.post(
    CONSTANTS.API_END_POINTS.SO.CREATE_SO,
    so_validation.createsoValidation,
    verifyToken,
    isSuperAdmin,   
    CONTROLLERS.SO_CONTROLLERS.createso
);

router.put(
    CONSTANTS.API_END_POINTS.SO.UPDATE_SO,
    so_validation.createsoValidation,
    verifyToken,
    CONTROLLERS.SO_CONTROLLERS.updateso
);

module.exports = router;
