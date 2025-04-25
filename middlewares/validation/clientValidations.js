const { returnError } = require("../../utils/common");
const { client_Vaidation_Schema } = require("./schemas/clientvalidation_schema");

const client_validation = {
  // vehicle type validtaion
  createVehicleTypeValidation: async (req, res, next) => {
    try {
      await client_Vaidation_Schema.createVehicleTypeValidation.validate(req.body)
      // if the schema values are correct
      next()
    } catch (err) {
      returnError(res, err)
    }
  },
  updateVehicleTypeValidation: async (req, res, next) => {
    try {
      const {typeId,categoryId}=req.params
      let validation=typeId?client_Vaidation_Schema.updateVehicleTypeValidation:client_Vaidation_Schema.updateVehicleCategoryValidation
      await validation.validate({...req.body,...req.params})
      // if the schema values are correct
      next()
    } catch (err) {
      returnError(res, err)
    }
  },
  vehicleTypeCategoryIdValidation: async (req, res, next) => {
    try {
      const {typeId,categoryId}=req.params
      let validation=typeId?client_Vaidation_Schema.typeIdValidation:client_Vaidation_Schema.categoryIdValidation
      await validation.validate({...req.params})
      // if the schema values are correct
      next()
    } catch (err) {
      returnError(res, err)
    }
  },

  // clients
  createClientValidation: async (req, res, next) => {
    try {
      await client_Vaidation_Schema.createClient_Schema.validate(req.body)
      // if the schema values are correct
      next()
    } catch (err) {
      returnError(res, err)
    }
  },
  updateClientValidation: async (req, res, next) => {
    try {
      await client_Vaidation_Schema.updateClient_Schema.validate({...req.body,...req.params})
      // if the schema values are correct
      next()
    } catch (err) {
      returnError(res, err)
    }
  },
  clientIdValidation: async (req, res, next) => {
    try {
      await client_Vaidation_Schema.clientIdValidation.validate({...req.params})
      // if the schema values are correct
      next()
    } catch (err) {
      returnError(res, err)
    }
  },
  
};
module.exports = { client_validation };
