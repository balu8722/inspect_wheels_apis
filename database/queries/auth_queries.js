const { CONSTANTS } = require("../../utils/constants");

const authQueries = {
  // is email or phone number present in labs or hospitals
  isPresent_lab_hospital: `SELECT email, phoneNumber, '${CONSTANTS.DATA_TABLES.LAB}' AS source_table
                                FROM ${CONSTANTS.DATA_TABLES.LAB}
                                WHERE email = ? OR phonenumber = ?
                                UNION ALL
                                SELECT email, phoneNumber, '${CONSTANTS.DATA_TABLES.HOSPITAL}' AS source_table
                                FROM ${CONSTANTS.DATA_TABLES.HOSPITAL}
                                WHERE email = ? OR phonenumber = ?`,

  // signup query
  adminSignUpQuery: `INSERT INTO ${CONSTANTS.DATA_TABLES.ADMINS} (name,email,phoneNumber,password,accountId,role,createdAt,status,createdBy,gender) VALUES (?,?,?,?,?,?,?,?,?,?)`,
  // user signup query from admin side only
  usersignUpQuery: `INSERT INTO ${CONSTANTS.DATA_TABLES.USERS} (name,email,phoneNumber,password,createdBy,createdAt,status,organizationId) VALUES (?)`,
  _signUpQuery: `START TRANSACTION;
                    INSERT INTO ${CONSTANTS.DATA_TABLES.USERS} (name,email,phoneNumber,password,refferedBy,createdAt,status) VALUES (?,?,?,?,?,?,?);
                    SELECT * FROM ${CONSTANTS.DATA_TABLES.USERS} WHERE id = LAST_INSERT_ID();
                    COMMIT;`,

  // user exist or not
  isUserPresent: (isAdmin) =>
    `SELECT * FROM ${
      isAdmin ? CONSTANTS.DATA_TABLES.ADMINS : CONSTANTS.DATA_TABLES.USERS
    } WHERE (email = ? || phoneNumber = ?) AND status=1`,
  // user exist or not
  isAdminPresent: (tableName) =>
    `SELECT * FROM ${tableName} WHERE (email = ? || phoneNumber = ?) AND status=1`,
  // is admin user exist or not
  isAdminuserPresent: `SELECT a.*,r.featurePermissions,r.roleName
         FROM ${CONSTANTS.DATA_TABLES.ADMINS} a
        LEFT JOIN ${CONSTANTS.DATA_TABLES.ROLE} r ON r.roleId=a.role
        WHERE (a.email = ? || a.phoneNumber = ?) AND a.status=1`,

  isLabAssistentPresent: `SELECT * FROM ${CONSTANTS.DATA_TABLES.LABASSISTENT} WHERE assistent_email = ? OR assistent_phone = ?`,

  // is email or phonenumber present in hospital,admin,lab tables
  adminPanelSigninQuery: `SELECT id,email,phoneNumber,accountId,password,name,role,profileImage,locationlatlng,buildingno,houseno,pincode,state,District as district,city,location,dob,gender,profileImage,"${CONSTANTS.DATA_TABLES.ADMINS}" as sourcetable FROM ${CONSTANTS.DATA_TABLES.ADMINS}
        WHERE (email = ? || phoneNumber=?) AND status=1
        UNION ALL
        SELECT id,email,phoneNumber,hospitalId as accountId,password,hospitalName as name,contactPerson as role,hospitalImage as profileImage,locationlatlng,addressline1 as buildingno,addressline2 as houseno,pincode,state,District as district,city,location,"" as dob,"" as gender,hospitalImage as profileImage, "${CONSTANTS.DATA_TABLES.HOSPITAL}" as sourcetable FROM ${CONSTANTS.DATA_TABLES.HOSPITAL} 
        WHERE (email = ? || phoneNumber=?) AND status=1
         UNION ALL
        SELECT id,email,phoneNumber,labId as accountId,password,labname as name,contactPerson as role,labImage as profileImage,locationlatlng,addressline1 as buildingno,addressline2 as houseno,pincode,state,District as district,city,location,"" as dob,"" as gender,labImage as profileImage, "${CONSTANTS.DATA_TABLES.LAB}" as sourcetable FROM ${CONSTANTS.DATA_TABLES.LAB} 
        WHERE (email = ? || phoneNumber=?) AND status=1`,

  // customer exist or not
  isCustomerPresent: `SELECT * FROM ${CONSTANTS.DATA_TABLES.USERS} WHERE (email = ? || phoneNumber = ?)`,

  // update the password
  updateUserPasswordQuery: (isAdmin) =>
    `UPDATE ${
      isAdmin ? CONSTANTS.DATA_TABLES.ADMINS : CONSTANTS.DATA_TABLES.USERS
    } SET password=?, updatedAt=? WHERE (email = ? || phoneNumber = ?)`,

  // update the password for admins
  updateAdminPasswordQuery: (tablename) =>
    `UPDATE ${tablename} SET password=?, updatedAt=? WHERE email = ? AND status=1`,

  // updated user details
  updateUserDetailQuery: `UPDATE ${CONSTANTS.DATA_TABLES.USERS} SET name=?,houseno=?,buildingno=?,pincode=?,
    state=?, district=?,city=?,location=?,locationlatlng=?, updatedAt=?,gender=?,dob=?,updatedBy=? WHERE id=? AND status=1`,
  // updated user details by admin only
  updateUserDetailByAdminQuery: `UPDATE ${CONSTANTS.DATA_TABLES.USERS} SET name=?,houseno=?,buildingno=?,pincode=?,
    state=?, district=?,city=?,location=?,locationlatlng=?, updatedAt=?,gender=?,dob=?,updatedBy=?,email=?,phoneNumber=?,organizationId=? WHERE id=? AND status=1`,

  //update admin details
  updateAdminDetailQuery: `UPDATE ${CONSTANTS.DATA_TABLES.ADMINS} SET name=?, role=?,houseno=?,buildingno=?,pincode=?,
    state=?, district=?,city=?,location=?,locationlatlng=?, updatedAt=?,gender=?,dob=?,updatedBy=?,email=?,phoneNumber=? WHERE id=? AND status=1`,

  // user list
  userList: `SELECT id, name,phoneNumber,email,DATE_FORMAT(dob, '%Y-%m-%d') AS dob,accountId,gender,houseno,buildingno,pincode,state,district,city,location,
     locationlatlng,status,profileImage FROM ${CONSTANTS.DATA_TABLES.USERS} WHERE status=1 AND (organizationId="" || organizationId IS NULL)`,

  // user list bu id
  userListById: `SELECT id, name,phoneNumber,DATE_FORMAT(dob, '%Y-%m-%d') AS dob,gender,email,accountId,houseno,buildingno,pincode,state,district,city,location,
     locationlatlng,status,profileImage,fcm_token FROM ${CONSTANTS.DATA_TABLES.USERS} WHERE id=? AND status=1`,

  //admin list
  adminList: `SELECT a.id, a.name,a.phoneNumber,DATE_FORMAT(a.dob, '%Y-%m-%d') AS dob,a.email,a.role,a.gender,a.accountId,a.houseno,a.buildingno,a.pincode,
    a.state,a.district,a.city,a.location,r.roleName, a.locationlatlng,a.status FROM ${CONSTANTS.DATA_TABLES.ADMINS} a
     left join ${CONSTANTS.DATA_TABLES.ROLE} r on r.roleId = a.role
     WHERE a.status=1`,

  //admin list by id
  adminListById: `SELECT a.id, a.name,a.phoneNumber,a.email,DATE_FORMAT(a.dob, '%Y-%m-%d') AS dob,a.gender,a.role,
    a.accountId,a.houseno,a.buildingno,a.pincode,a.state,a.district,a.city,a.location,a.profileImage,
     a.locationlatlng,a.status,r.roleName,r.featurePermissions
      FROM ${CONSTANTS.DATA_TABLES.ADMINS} a
      LEFT JOIN ${CONSTANTS.DATA_TABLES.ROLE} r on r.roleId = a.role
       WHERE a.id=? AND a.status=1`,

  // delete user or admin
  deleteAdmin_User: (table) =>
    `UPDATE ${table} SET status=?, updatedAt=?,updatedBy=? WHERE id=? AND status=1`,

  // cretae user role
  create_Role: `INSERT INTO ${CONSTANTS.DATA_TABLES.ROLE} (roleName,featurePermissions,createdBy,createdAt,status) VALUES(?,?,?,?,?)`,

  // update role
  update_Role: `UPDATE ${CONSTANTS.DATA_TABLES.ROLE} SET roleName=?, featurePermissions=?, updatedBy=?, updatedAt=? WHERE roleId=? AND status=1`,

  // get roles list
  GET_ROLELIST: `SELECT * FROM ${CONSTANTS.DATA_TABLES.ROLE} WHERE status=1`,
  // get roles list by id
  GET_ROLELIST_BY_ID: `SELECT featurePermissions,roleName FROM ${CONSTANTS.DATA_TABLES.ROLE} WHERE roleId=? AND status=1`,

  // delete roles
  DELETE_ROLE: `UPDATE ${CONSTANTS.DATA_TABLES.ROLE} SET status=0, updatedBy=?, updatedAt=? WHERE roleId=? AND status=1`,

  // after deleting role, remove the roleIds to admins
  REMOVE_ROLE_ID: `UPDATE ${CONSTANTS.DATA_TABLES.ADMINS} SET role=NULL WHERE role=?`,
  // if role name exists query
  isRoleName_Exists: `SELECT * FROM ${CONSTANTS.DATA_TABLES.ROLE} WHERE roleName=? AND status=0`,
  // if role name exists query
  _isRoleName_Exists: `SELECT roleName,roleId,status FROM ${CONSTANTS.DATA_TABLES.ROLE}`,
  // if update role name exists query
  _isUpdateRoleName_Exists: `SELECT roleName,status FROM ${CONSTANTS.DATA_TABLES.ROLE} WHERE status=1 AND roleId<>?`,

  // reactivate rolename
  reactivate_Rolename: `UPDATE ${CONSTANTS.DATA_TABLES.ROLE} SET roleName=?, status=1,featurePermissions=?, updatedBy=?, updatedAt=? WHERE roleId=?`,

  import_user: `INSERT INTO ${CONSTANTS.DATA_TABLES.USERS} SET ?`,

  // check parameter id exists or not
  isUser_exists: `SELECT count(*) as count,email,phoneNumber FROM ${CONSTANTS.DATA_TABLES.USERS} WHERE email IN (?) || phoneNumber IN (?)`,
  isUserExist: `SELECT COUNT(*) AS count FROM ${CONSTANTS.DATA_TABLES.USERS} WHERE id <> ? AND (name IN (?) OR email IN (?) OR phoneNumber = ?)`,

  //checkfor organization name
  isOrg_Exists: `SELECT count(*) AS count,paymentstatus,organizationID FROM ${CONSTANTS.DATA_TABLES.ORGANIZATION} WHERE id=? AND status=1`,
  isOrgName_Exists: `SELECT count(*) AS count FROM ${CONSTANTS.DATA_TABLES.ORGANIZATION} WHERE oraganizationName=? AND status=1`,
  isOrgName_Exists_table: `SELECT count(*) AS count FROM ${CONSTANTS.DATA_TABLES.ORGANIZATION} WHERE oraganizationName=? AND id <> ? AND status=1`,

  // create_org: `INSERT INTO ${CONSTANTS.DATA_TABLES.ORGANIZATION} SET ?`,
  create_org: `START TRANSACTION;
                    INSERT INTO ${CONSTANTS.DATA_TABLES.ORGANIZATION} SET ?;
                    SELECT * FROM ${CONSTANTS.DATA_TABLES.ORGANIZATION} WHERE id = LAST_INSERT_ID();
                    COMMIT;`,
  update_org: `UPDATE ${CONSTANTS.DATA_TABLES.ORGANIZATION} SET ? WHERE id = ?`,
  read_all: `SELECT * FROM ? WHERE status = 1`,
  read_all_org: `SELECT * FROM ${CONSTANTS.DATA_TABLES.ORGANIZATION} WHERE status = 1`,
  get_orglist: `SELECT h.*, e.transactionamount, e.expirydate,e.transactionid,e.transactiondate,e.subscriptionstatus
                FROM ${CONSTANTS.DATA_TABLES.ORGANIZATION} h
                LEFT JOIN (
                    SELECT organization_id, transactionamount, expirydate,transactionid,transactiondate,subscriptionstatus
                    FROM ${CONSTANTS.DATA_TABLES.ORGNIZATION_TRANSACTIONS} e1
                    WHERE (e1.organization_id, e1.expirydate) IN (
                        SELECT organization_id, MAX(expirydate)
                        FROM ${CONSTANTS.DATA_TABLES.ORGNIZATION_TRANSACTIONS} e2
                        WHERE paymentstatus ="success"
                        GROUP BY organization_id
                    )
                ) e ON h.organizationID = e.organization_id
                WHERE h.status=1`,
  get_paid_orglist: `SELECT h.*, e.transactionamount, e.expirydate,e.transactionid,e.transactiondate,e.subscriptionstatus
                FROM ${CONSTANTS.DATA_TABLES.ORGANIZATION} h
                LEFT JOIN (
                    SELECT organization_id, transactionamount, expirydate,transactionid,transactiondate,subscriptionstatus
                    FROM ${CONSTANTS.DATA_TABLES.ORGNIZATION_TRANSACTIONS} e1
                    WHERE (e1.organization_id, e1.expirydate) IN (
                        SELECT organization_id, MAX(expirydate)
                        FROM ${CONSTANTS.DATA_TABLES.ORGNIZATION_TRANSACTIONS} e2
                        WHERE paymentstatus ="success"
                        GROUP BY organization_id
                    )
                ) e ON h.organizationID = e.organization_id
                WHERE e.subscriptionstatus = "active" AND h.status=1`,

  // WHERE h.paymentstatus = "success";
  read_all_org_id: `SELECT * FROM ${CONSTANTS.DATA_TABLES.ORGANIZATION} WHERE id = ? AND status = 1`,
  delete_org: `UPDATE ${CONSTANTS.DATA_TABLES.ORGANIZATION} SET status = 0 WHERE id = ?`,

  // update admin profile picture
  adminImageupdtaeQuery: `UPDATE ${CONSTANTS.DATA_TABLES.ADMINS} SET profileImage=? WHERE id=? AND status=1`,
  // update hospital profile picture
  hospitalImageupdtaeQuery: `UPDATE ${CONSTANTS.DATA_TABLES.HOSPITAL} SET hospitalImage=? WHERE id=? AND status=1`,
  // update lab profile picture
  labImageupdateQuery: `UPDATE ${CONSTANTS.DATA_TABLES.LAB} SET labImage=? WHERE id=? AND status=1`,

  // update customer profike picture
  customerImageUpdateQuery: `UPDATE ${CONSTANTS.DATA_TABLES.USERS} SET profileImage=? WHERE id=? AND status=1`,

  // get hospital Details
  hospitalDetailById: `SELECT * FROM ${CONSTANTS.DATA_TABLES.HOSPITAL} WHERE id=?`,
  // get lab Details
  labDetailById: `SELECT * FROM ${CONSTANTS.DATA_TABLES.LAB} WHERE id=?`,

  // fcp token update for users
  updateFCMtoken: `UPDATE ${CONSTANTS.DATA_TABLES.USERS} SET fcm_token=? WHERE id=? AND status=1`,

  // get users list based on the orgid
  getUsersByOrgId: `SELECT u.id, u.name,u.phoneNumber,u.email,DATE_FORMAT(u.dob, '%Y-%m-%d') AS dob,u.accountId,u.gender,u.houseno,u.buildingno,u.pincode,u.state,u.district,u.city,u.location,
     u.locationlatlng,u.status,u.profileImage,ou.oraganizationName,u.organizationId FROM ${CONSTANTS.DATA_TABLES.USERS} u
     LEFT JOIN ${CONSTANTS.DATA_TABLES.ORGANIZATION} ou on u.organizationId=ou.organizationID
     WHERE u.status=1 AND u.organizationId=?`,

  insert_orgcard_transaction: `INSERT INTO ${CONSTANTS.DATA_TABLES.ORGNIZATION_TRANSACTIONS}
     (organization_id,transactionamount,transactiondate,transactionid,startdate,expirydate,subscriptionstatus,paymentstatus,createdBy,isRenewed)
     VALUES(?)`,
};

const deleteUserPermanentQuery = `DELETE FROM ${CONSTANTS.DATA_TABLES.USERS} WHERE id=?`;

module.exports = { authQueries,deleteUserPermanentQuery };
