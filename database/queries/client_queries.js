const { CONSTANTS } = require("../../utils/constants");

const clientQueries = {
 // create type or category
 create_type_category:(tableName)=> `INSERT INTO ${tableName} (name,short_code,description,createdBy) VALUES(?)`,

 // update type or category
 update_type_category:(tableName)=> `UPDATE ${tableName} SET name=?, description=?, updatedBy=?, updatedAt=? WHERE id=? AND status=1`,

 // get type or category list
 GET_LIST:(tableName)=> `SELECT * FROM ${tableName} WHERE status=1`,
 // get type or category list by id
 GET_LIST_BY_ID:(tableName)=> `SELECT * FROM ${tableName} WHERE id=? AND status=1`,

 // delete type or category
 DELETE_Type_Category:(tableName)=> `UPDATE ${tableName} SET status=0, updatedBy=?, updatedAt=? WHERE id=? AND status=1`,

 Reactivate_Type_Category:(tableName)=> `UPDATE ${tableName} SET status=1,name=?,description=?, updatedBy=?, updatedAt=? WHERE id=? AND status=0`,

 // if type or category name exists query
 isName_Exists:(tableName)=> `SELECT name,id,status,short_code FROM ${tableName}`,

 is_Type_Category_Exists:(tableName)=> `SELECT name,id,status FROM ${tableName} WHERE status=1 AND id=?`,
 // if update type or category name exists query
 _isUpdateTypeCategoryName_Exists:(tableName)=> `SELECT name,id,status,short_code FROM ${tableName} WHERE status=1 AND id<>?`,

isVehicleTypesExist:`SELECT * FROM ${CONSTANTS.DATA_TABLES.VEHICLE_TYPE} WHERE id IN (?) AND status=1`,
 // create client query
  createClientQuery: `INSERT INTO ${CONSTANTS.DATA_TABLES.CLIENT} (contact_person_name,email,contact_no,username,password,address,city,area,state,pincode,secondary_contact_no,vehicletypes,createdBy,company_name) VALUES (?)`,
 
  // is client exists query
  isClientExistsQuery: `SELECT * FROM ${CONSTANTS.DATA_TABLES.CLIENT} WHERE id=? AND status=1`,

  // updated client details by admin only
  updateClientQuery: `UPDATE ${CONSTANTS.DATA_TABLES.CLIENT} SET contact_person_name=?,email=?,contact_no=?,address=?,city=?,area=?,state=?,pincode=?,secondary_contact_no=?,vehicletypes=?,updatedBy=?,updatedAt=?,company_name=?
   WHERE id=? AND status=1`,
    // get client list
   clientListQuery:(id)=> `SELECT * FROM ${CONSTANTS.DATA_TABLES.CLIENT} ${id ?` WHERE id=? AND status=1`:` ORDER BY createdAt DESC
  LIMIT ? OFFSET ?`}`,

  totalCountQuery:(tablename)=>`SELECT COUNT(*) AS total FROM ${tablename}`
};

module.exports = { clientQueries };
