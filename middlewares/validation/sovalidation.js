const { returnError } = require("../../utils/common");
const { auth_Schema } = require("./schemas/authvalidation_schema");
const { so_Schema } = require("./schemas/sovalidation_schema");


const so_validation = {
    // create roles validation
    createsoValidation: async (req, res, next) => {
        try {
            let data = { ...req.body }
            await so_Schema.createso_schema.validate(data)
            next()
        } catch (err) {
            returnError(res, err)
        }
    },

    









};
module.exports = { so_validation };
