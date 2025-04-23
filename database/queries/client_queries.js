const { CONSTANTS } = require("../../utils/constants");

const clientQueries = {
 // create type or category
 create_type_category:(tableName)=> `INSERT INTO ${tableName} (name,description,createdBy) VALUES(?)`,

 // update type or category
 update_Role:(tableName)=> `UPDATE ${tableName} SET name=?, description=?, updatedBy=?, updatedAt=? WHERE id=? AND status=1`,

 // get type or category list
 GET_LIST:(tableName)=> `SELECT * FROM ${tableName} WHERE status=1`,
 // get type or category list by id
 GET_LIST_BY_ID:(tableName)=> `SELECT * FROM ${tableName} WHERE id=? AND status=1`,

 // delete type or category
 DELETE_ROLE:(tableName)=> `UPDATE ${tableName} SET status=0, updatedBy=?, updatedAt=? WHERE id=? AND status=1`,

 // if type or category name exists query
 isName_Exists:(tableName)=> `SELECT name,id,status FROM ${tableName}`,

 is_TYPE_CATEGORY_Exists:(tableName)=> `SELECT name,id,status FROM ${tableName} WHERE status=1 AND id=?`,
 // if update role name exists query
 _isUpdateRoleName_Exists: `SELECT name,status FROM ${CONSTANTS.DATA_TABLES.ROLE} WHERE status=1 AND id<>?`,


};

module.exports = { clientQueries };
