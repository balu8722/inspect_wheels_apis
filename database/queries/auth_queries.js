const { CONSTANTS } = require("../../utils/constants");

const authQueries = {
  // signin query for the admin portal based on roles
  isPresent_admins_so_client: `SELECT id,name,email,contact_no,roleId,username,password, '${CONSTANTS.DATA_TABLES.ADMINS}' AS source_table
  FROM ${CONSTANTS.DATA_TABLES.ADMINS}
  WHERE username = ? AND status=1
  UNION ALL
  SELECT id,name,email,contact_no,NULL AS roleId,username,password, '${CONSTANTS.DATA_TABLES.CLIENT}' AS source_table
  FROM ${CONSTANTS.DATA_TABLES.CLIENT}
  WHERE username = ? AND status=1
  UNION ALL
  SELECT id,name,email,contact_no,NULL AS roleId,username,password, '${CONSTANTS.DATA_TABLES.SO}' AS source_table
  FROM ${CONSTANTS.DATA_TABLES.SO}
  WHERE username = ? AND status=1`,

  // checking the duplicates for username, email and contact number
  isExist_admins_so_client_valuator: `SELECT id,name,email,contact_no,roleId,username, '${CONSTANTS.DATA_TABLES.ADMINS}' AS source_table
  FROM ${CONSTANTS.DATA_TABLES.ADMINS}
  WHERE username = ? OR email=? OR contact_no=?
  UNION ALL
  SELECT id,name,email,contact_no,NULL AS roleId,username, '${CONSTANTS.DATA_TABLES.CLIENT}' AS source_table
  FROM ${CONSTANTS.DATA_TABLES.CLIENT}
  WHERE username = ? OR email=? OR contact_no=?
  UNION ALL
  SELECT id,name,email,contact_no,NULL AS roleId,username, '${CONSTANTS.DATA_TABLES.SO}' AS source_table
  FROM ${CONSTANTS.DATA_TABLES.SO}
  WHERE username = ? OR email=? OR contact_no=?
  UNION ALL
  SELECT id,name,email,contact_no,NULL AS roleId,username, '${CONSTANTS.DATA_TABLES.VALUATOR}' AS source_table
  FROM ${CONSTANTS.DATA_TABLES.VALUATOR}
  WHERE username = ? OR email=? OR contact_no=?`,


  // to check the duplicate email or contact number in all tables
  isExist_email_contact_no:(tableName)=> `SELECT id,name,email,contact_no,roleId,username, '${CONSTANTS.DATA_TABLES.ADMINS}' AS source_table
  FROM ${CONSTANTS.DATA_TABLES.ADMINS}
  WHERE (email=? OR contact_no=?) ${tableName === CONSTANTS.DATA_TABLES.ADMINS ? ' AND id <> ?' : ''}
  UNION ALL
  SELECT id,name,email,contact_no,NULL AS roleId,username, '${CONSTANTS.DATA_TABLES.CLIENT}' AS source_table
  FROM ${CONSTANTS.DATA_TABLES.CLIENT}
  WHERE (email=? OR contact_no=?) ${tableName === CONSTANTS.DATA_TABLES.CLIENT ? ' AND id <> ?' : ''}
  UNION ALL
  SELECT id,name,email,contact_no,NULL AS roleId,username, '${CONSTANTS.DATA_TABLES.SO}' AS source_table
  FROM ${CONSTANTS.DATA_TABLES.SO}
  WHERE (email=? OR contact_no=?) ${tableName === CONSTANTS.DATA_TABLES.SO ? ' AND id <> ?' : ''}
  UNION ALL
  SELECT id,name,email,contact_no,NULL AS roleId,username, '${CONSTANTS.DATA_TABLES.VALUATOR}' AS source_table
  FROM ${CONSTANTS.DATA_TABLES.VALUATOR}
  WHERE (email=? OR contact_no=?) ${tableName === CONSTANTS.DATA_TABLES.VALUATOR ? ' AND id <> ?' : ''}`,

  // signup query
  adminSignUpQuery: `INSERT INTO ${CONSTANTS.DATA_TABLES.ADMINS} (name,email,contact_no,username,password,roleId,gender,address,city,state,country,pincode,dob,createdBy) VALUES (?)`,
 
// admins list from database
adminListQuery: `SELECT a.*,r.featurePermissions,r.name AS roleName
         FROM ${CONSTANTS.DATA_TABLES.ADMINS} a
        LEFT JOIN ${CONSTANTS.DATA_TABLES.ROLE} r ON r.id=a.roleId
        WHERE a.id<>1 AND a.status=1`,
        
adminListQueryById: `SELECT a.*,r.featurePermissions,r.name AS roleName
         FROM ${CONSTANTS.DATA_TABLES.ADMINS} a
        LEFT JOIN ${CONSTANTS.DATA_TABLES.ROLE} r ON r.id=a.roleId
        WHERE a.id=? AND a.status=1`,

  // user exist or not
  isAdminPresent: (tableName) =>{
    if(tableName === CONSTANTS.DATA_TABLES.ADMINS){
      return `SELECT a.*,r.featurePermissions,r.name AS roleName
         FROM ${tableName} a
        LEFT JOIN ${CONSTANTS.DATA_TABLES.ROLE} r ON r.id=a.roleId
        WHERE a.id = ? AND a.status=1`;
    }else {
      return `SELECT * FROM ${tableName} WHERE id = ? AND status=1`;
    }
  },
  getAdminEmail: `SELECT email,username FROM ${CONSTANTS.DATA_TABLES.ADMINS} WHERE id=? AND status=1`,
  // is admin user exist or not
  isAdminuserPresent: `SELECT a.*,r.featurePermissions,r.name AS roleName
         FROM ${CONSTANTS.DATA_TABLES.ADMINS} a
        LEFT JOIN ${CONSTANTS.DATA_TABLES.ROLE} r ON r.id=a.roleId
        WHERE a.id = ? AND a.status=1`,

  // is email or phonenumber present in hospital,admin,lab tables
  isEmailExistsQuery: `SELECT id,email,contact_no,emp_id,name,roleId,username,"${CONSTANTS.DATA_TABLES.ADMINS}" as source_table FROM ${CONSTANTS.DATA_TABLES.ADMINS}
        WHERE email = ? AND status=1
        UNION ALL
        SELECT id,email,contact_no,emp_id,name,NULL AS roleId,username,"${CONSTANTS.DATA_TABLES.SO}" as source_table FROM ${CONSTANTS.DATA_TABLES.SO}
        WHERE email = ? AND status=1
        UNION ALL
        SELECT id,email,contact_no,emp_id,name,NULL AS roleId,username,"${CONSTANTS.DATA_TABLES.CLIENT}" as source_table FROM ${CONSTANTS.DATA_TABLES.CLIENT}
        WHERE email = ? AND status=1
        UNION ALL
        SELECT id,email,contact_no,emp_id,name,NULL AS roleId,username,"${CONSTANTS.DATA_TABLES.VALUATOR}" as source_table FROM ${CONSTANTS.DATA_TABLES.VALUATOR}
        WHERE email = ? AND status=1`,

  // update forgot password status for users
  updateForgotPasswordStatus:(tableName)=> `UPDATE ${tableName} SET isforgotpassword=1 WHERE email = ? AND status=1`,

  // update the password for admins
  updateAdminPasswordQuery: (tablename) =>
    `UPDATE ${tablename} SET password=?, lastPasswordUpdated=?,updatedBy=? WHERE id = ? AND status=1`,

 // updated user details by admin only
  updateUserDetailByAdminQuery: `UPDATE ${CONSTANTS.DATA_TABLES.ADMINS} SET name=?,email=?,contact_no=?,roleId=?,gender=?,
  address=?,city=?,state=?,country=?,pincode=?,dob=?,updatedBy=?,updatedAt=? WHERE id=? AND status=1`,

  //update admin details by users
  updateAdminDetailQuery: `UPDATE ${CONSTANTS.DATA_TABLES.ADMINS} SET name=?, address=?,city=?,state=?,country=?,pincode=?,
    gender=?,dob=?,updatedBy=?,updatedAt=? WHERE id=? AND status=1`,


 

  // delete user or admin
  deleteAdmin_User: (table) =>
    `UPDATE ${table} SET status=0, updatedAt=?,updatedBy=? WHERE id=? AND status=1`,
  // delete user or admin
  activate_Admin_User: (table) =>
    `UPDATE ${table} SET status=1, updatedAt=?,updatedBy=? WHERE id=? AND status=0`,

  // cretae user role
  create_Role: `INSERT INTO ${CONSTANTS.DATA_TABLES.ROLE} (name,featurePermissions,createdBy) VALUES(?,?,?)`,

  // update role
  update_Role: `UPDATE ${CONSTANTS.DATA_TABLES.ROLE} SET name=?, featurePermissions=?, updatedBy=?, updatedAt=? WHERE id=? AND status=1`,

  // get roles list
  GET_ROLELIST: `SELECT * FROM ${CONSTANTS.DATA_TABLES.ROLE} WHERE status=1`,
  // get roles list by id
  GET_ROLELIST_BY_ID: `SELECT featurePermissions,name FROM ${CONSTANTS.DATA_TABLES.ROLE} WHERE id=? AND status=1`,

  // delete roles
  DELETE_ROLE: `UPDATE ${CONSTANTS.DATA_TABLES.ROLE} SET status=0, updatedBy=?, updatedAt=? WHERE id=? AND status=1`,

  // after deleting role, remove the roleIds to admins
  REMOVE_ROLE_ID: `UPDATE ${CONSTANTS.DATA_TABLES.ADMINS} SET roleId=NULL WHERE roleId=?`,
  // if role name exists query
  isRoleName_Exists: `SELECT * FROM ${CONSTANTS.DATA_TABLES.ROLE} WHERE roleName=? AND status=0`,
  // if role name exists query
  _isRoleName_Exists: `SELECT name,id,status FROM ${CONSTANTS.DATA_TABLES.ROLE}`,
  _isRole_Exists: `SELECT name,id,status FROM ${CONSTANTS.DATA_TABLES.ROLE} WHERE status=1 AND id=?`,
  // if update role name exists query
  _isUpdateRoleName_Exists: `SELECT name,status FROM ${CONSTANTS.DATA_TABLES.ROLE} WHERE status=1 AND id<>?`,

  // reactivate rolename
  reactivate_Rolename: `UPDATE ${CONSTANTS.DATA_TABLES.ROLE} SET name=?, status=1,featurePermissions=?, updatedBy=?, updatedAt=? WHERE id=?`,

  import_user: `INSERT INTO ${CONSTANTS.DATA_TABLES.USERS} SET ?`,

  // check parameter id exists or not
  isUser_exists: `SELECT count(*) as count,email,phoneNumber FROM ${CONSTANTS.DATA_TABLES.USERS} WHERE email IN (?) || phoneNumber IN (?)`,
  isUserExist: `SELECT COUNT(*) AS count FROM ${CONSTANTS.DATA_TABLES.USERS} WHERE id <> ? AND (name IN (?) OR email IN (?) OR phoneNumber = ?)`,


  
  // update admin profile picture
  adminImageupdtaeQuery: `UPDATE ${CONSTANTS.DATA_TABLES.ADMINS} SET profileImage=? WHERE id=? AND status=1`,
  // update hospital profile picture
  hospitalImageupdtaeQuery: `UPDATE ${CONSTANTS.DATA_TABLES.HOSPITAL} SET hospitalImage=? WHERE id=? AND status=1`,
  // update lab profile picture
  labImageupdateQuery: `UPDATE ${CONSTANTS.DATA_TABLES.LAB} SET labImage=? WHERE id=? AND status=1`,

  // update customer profike picture
  customerImageUpdateQuery: `UPDATE ${CONSTANTS.DATA_TABLES.USERS} SET profileImage=? WHERE id=? AND status=1`,

  // fcp token update for users
  updateFCMtoken: `UPDATE ${CONSTANTS.DATA_TABLES.USERS} SET fcm_token=? WHERE id=? AND status=1`,

};

module.exports = { authQueries };
