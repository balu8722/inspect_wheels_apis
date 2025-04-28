module.exports.CONSTANTS = {
  // api end points
  API_END_POINTS: {
    AUTH: {
      SIGNUP: "/signup",
      SIGNIN: "/signin",
      VERIFY_SIGNUP_OTP: "/verifysignupotp",
      VERIFY_LOGIN_OTP: "/verifyloginotp",
      VERIFY_FORGOT_OTP: "/verifyforgototp",
      FORGOT_PASSWORD: "/forgotpassword/:email",
      RESET_PASSWORD: "/resetpassword/:token",
      CHANGE_PASSWORD: "/changepassword",
      CHANGE_USERS_PASSWORD: "/changeuserspassword",
      REFRESH_TOKEN: "/refreshtoken/:refreshtoken",
      USER_DETAILS:"/userdata",
      ADMINS_LIST: "/adminslist",
      ADMINS_DETAILS_BY_ID: "/adminlist/:id",
      DELETE_USER: "/delete/:userId",
      UPDATE_USER: "/updateDetailbyid/:userId",
      UPDATE_USER_BY_ADMIN: "/updateDetailbyAdmin/:userId",


      // roles
      CREATE_ROLE: "/role/create",
      UPDATE_ROLE: "/role/update/:roleId",
      GET_ROLE: "/role/list",
      DELETE_ROLE: "/role/delete/:roleId",
    },
    SO: {
      CREATE_SO: "/create",
      UPDATE_SO: "/update/:id",
      UPDATE_SO_THEMSELVES: "/updatethemselves/:id",
      GET_SO_LIST: "/list",
      GET_SO_BY_ID: "/list/:id",
      DELETE_SO_BY_ID: "/delete/:id"
    },
    CLIENTS: {
      CREATE_CLIENT: "/create",
      UPDATE_CLIENT: "/update/:clientId",
      GET_CLIENT_LIST: "/list/:rowsPerPage/:pageNo",
      GET_CLIENT_BY_ID: "/list/:clientId",
      DEACTIVATE_CLIENT_BY_ID: "/deactivate/:clientId",
      ACTIVATE_CLIENT_BY_ID: "/activate/:clientId",

      // vehicle types 
      CREATE_VEHICLE_TYPE: "/createVehicleType",
      UPDATE_VEHICLE_TYPE: "/updateVehicleType/:typeId",
      GET_VEHICLE_TYPE_LIST: "/listVehicleType",
      GET_VEHICLE_TYPE_BY_ID: "/listVehicleType/:typeId",
      DELETE_VEHICLE_TYPE_BY_ID: "/deleteVehicleType/:typeId",

      // vehicle category
      CREATE_VEHICLE_CATEGORY: "/createVehicleCategory",
      UPDATE_VEHICLE_CATEGORY: "/updateVehicleCategory/:categoryId",
      GET_VEHICLE_CATEGORY_LIST: "/listVehicleCategory",
      GET_VEHICLE_CATEGORY_BY_ID: "/listVehicleCategory/:categoryId",
      DELETE_VEHICLE_CATEGORY_BY_ID: "/deleteVehicleCategory/:categoryId",
    },
    VALUATOR: {
      CREATE_VALUATOR: "/create",
      UPDATE_VALUATOR: "/update/:id",
      UPDATE_VALUATOR_THEMSELVES: "/updatethemselves/:id",
      GET_VALUATOR_LIST: "/list",
      GET_VALUATOR_BY_ID: "/list/:id",
      DELETE_VALUATOR_BY_ID: "/delete/:id"
    },
  },

  //  api payloads
  API_PAYLOADS: {},

  // show messages
  STATUS_MSG: {
    SUCCESS: {
      LOGIN: "Login successful!",
      DATADDED: "Data added successfully",
      DATA_UPDATED: "Data updated successfully",
      DATA_FOUND: "data found",
      DATA_NOT_FOUND: "data not found",
      DATA_DELETED: "data deleted",
      SO_REGISTERED:"Sub Officer created successfully.",
      SO_UPDATED:"Sub Officer updated successfully.",
      SO_LIST: "Sub Officer list fetched successfully.",
      SO_DETAILS: "Sub Officer details fetched successfully.",
      VALUATOR_REGISTERED: "Valuator created successfully.",
      VALUATOR_UPDATED: "Valuator updated successfully.",
      VALUATOR_LIST: "Valuator list fetched successfully.",
      VALUATOR_DETAILS: "Valuator details fetched successfully.",
      ADMIN_REGISTERED:
        "User registered successfully, Account Credentials sent to the user through Email",
      USER_REGISTERED: "User registered successfully",
      FORGET_TOKEN_GENERATED:
        "Reset password token sent to your Email, please check your Email",
        FORGOT_PASSWORD_REQUEST:
        "Reset password request sent to the Admin, After Changing password you will notify through Email",
      RESET_PASS: "Password Resetted successfully",
      PASSWORD_CHANGED: "Password Changed successfully",
      LOGIN_OTP_EMAIL_SENT: "Login OTP sent to your email",
      SIGNUP_OTP_EMAIL_SENT:
        "An OTP has been sent to your registered email address for verification",
      FORGOT_OTP_MAIL: "Please check your registered email,Link for resetting password is sent to your Email",
      OTP_VERIFIED: "OTP verified successfully",
      USER_DELETED: "User deleted successfully",
      ADMIN_DELETED: "Admin deleted successfully",
      TOKEN_GENERATED: "Token regenerated",
      ROLE_CREATED: "Role created successfully",
      ROLE_UPDATED: "Role updated successfully",
      ROLE_DELETED: "Role deleted successfully",
      CATEGORY_CREATED: "Hospital category created",
      CATEGORY_UPDATED: "Hospital category updated",
      CATEGORY_DELETED: "Hospital category deleted successfully",
      SPECIALIZATION_CREATED: "Hospital specialization created",
      SPECIALIZATION_UPDATED: "Hospital specialization updated",
      SPECIALIZATION_DELETED: "Hospital specialization deleted successfully",
      HOSPITAL_CREATED:
        "Hospital added suceessfully and credentials sent registered mail",
      HOSPITAL_UPDATED: "Hospital updated suceessfully",
      HOSPITAL_UPDATED_EMAIL:
        "Hospital updated suceessfully and new credentials sent registered mail",
      HOSPITAL_DELETED: "Hospital deleted suceessfully",
      HOSPITAL_OFFER_CREATED: "new offer created",
      HOSPITAL_OFFER_UPDATED: "hospital offer updated",
      HOSPITAL_OFFER_DELETED: "hospital offer deleted",
      LAB_PARAMETER_CREATED: "Lab test created successfully",
      LAB_PARAMETER_UPDATED: "Lab test updated successfully",
      LAB_PARAMETER_DELETED: "Lab test deleted successfully",
      LAB_PACKAGE_CREATED: "Lab package created",
      LAB_PACKAGE_UPDATED: "Lab package updated",
      LAB_PACKAGE_DELETED: "Lab package deleted",
      LAB_CREATED:
        "LAB added suceessfully and credentials sent registered mail",
      LAB_UPDATED: "LAB updated suceessfully",
      LAB_UPDATED_EMAIL:
        "LAB updated suceessfully and new credentials sent registered mail",
      LAB_DELETED: "LAB deleted suceessfully",
      USER_CREATED: "User created",
      USERS_CREATED: "Users created successfully",
      ORG_CREATED: "Organization created",
      ORG_UPDATED: "Organization updated",
      ORG_DELETED: "Organization deleted",
      CART_ADDED: "Item added to the cart.",
      CART_ITEM_DELETED: "Cart item deleted",
      // j378 start
      ORDER_CREATED: "Your order created successfuly.",
      // j378 ends

      REVIEW_ADDED: "review added successfully",
      REVIEW_UPDATED: "review updated successfully",
      REVIEW_DELETED: "review deleted successfully",
      STATUS_UPDATED: "Status updated successfuly.",
      LAB_ASSISTENT_CREATED: "Lab assistent created.",
      LAB_ASSISTENT_UPDATED: "Lab assistent updated.",
      LAB_ASSISTENT_DELETED: "Lab assistent deleted.",
      TEST_READINGS_ADDED: "Test results added",
      PROFILE_IMG_UPLOADED: "Profile updated successfully",
      LAB_ASSIGNED: "Lab assigned for order successfuly",
      TRANSACTION_UPDATED: "Transaction status updated",

      FAQ_ADDED: "Faq added successfully",
      FAQ_UPDATED: "Faq updated successfully",
      FAQ_DELETED: "Faq deleted successfully",

      HEALTHCARD_CREATED: "Healthcard created successfully",
      HEALTHCARD_UPDATED: "Healthcard updated successfully",

      HEALTH_CARD_USER_CREATED_PENDING:
        "Healthcard created,Pending for Payment",
      HEALTH_CARD_USER_CREATED: "Payment details are updated",
      PHONE_NUMBER_VALIDATION: "Healthcard is not created on this PhoneNumber",
      CARD_SHIFTED: "Healthcard shifted successfully",

      RAZOR_ID_CREATED: "razorpaymentid created for the renewal",
      HEALTHCARD_RENEWED: "helathcard renew payments updated",

      REDEEM_DETAILS_UPDATED: "Redeem points details updated",

      ADS_CREATED: "Ads created sucessfully",
      ADS_UPDATED: "Ads updated sucessfully",
      ADS_DELETED: "Ads deleted sucessfully",

      FCM_UPDATED: "FCM token updated",
      NOTIFICATION_CREATED: "Notification created sucessfully",
      NOTIFICATION_UPDATED: "Notification updated sucessfully",

      CLIENT_DEACTIVATED: "Client deactivated successfully",
      CLIENT_ACTIVATED: "Client activated successfully",
    },
    ERROR: {
      LOGIN: "sign-in failed",
      SERVER: "Internal server error",
      USER_NOT_FOUND: "User not Found",
      ADMIN_NOT_FOUND: "Admin not Found",
      INVALID_PASSWORD: "Password entered is Invalid",
      NO_DATA_FOUND: "No data found",
      ENTER_VALID_ID: "Enter Valid data Id",
      ROLE_NAME_EXISTS: "The role name already exists",
      ROLE_NAME_REQUIRED: "Role name Required",
      UNAUTHORIZED: "Unauthorized",
      TOKEN_EXPIRED: "Token expired",
      // autherrors
      GENDER_ERROR: "Gendre should be male or female or Other",
      VALID_PHONE: "Enter valid Phone Number",
      USERNAME_EXISTS: "Username already exists",
      EMAIL_EXISTS: "Email Address already exists",
      PHONE_NO_EXISTS: "Contact number already exists",
      VALID_EMAIL: "Please enter valid email",
      NEW_AND_CONFIRM: "New password and Confirm password should be same",
      RESET_TOKEN_EXPIRED: "Reset Token expired",
      INVALID_CURRENT_PASS: "Invalid Current Password",
      INVALID_OTP: "Entered OTP is Invalid",
      OTP_EXPIRED: "OTP has expired",
      OLD_NEW_PASSWORD: "New password is same as old password",
      INVALID_CURRENT_PASSWORD: "Invalid current password",
      IS_TRUE_FALSE: "Provide boolean values for isAdmin",
      PASSWORD_INVALID:
        "password must contain minimum of 8 characters,1 uppercase, 1 lowercase,1 number and a special character",
      NAME_FIELD: "Please enter only letters for the Name",
      NUMBERS_ONLY: "Numbers only",
      ROLENAME_EXISTS: "Role name already exists",
      ROLE_NOT_FUND: "Role not found",
      ID_NUMBER_ONLY: "id must be number only",
      ITEM_NOT_FOUND: "item not found",
      NOT_AUTHORIZED: "Not authorized to remove this data",
      NAME_EXISTS:"Name already exists",
      SHORT_CODE_EXISTS:"Short code already exists",
      NO_SO_FOUND: "The requested Sub Officer could not be found",
      NO_VALUATOR_FOUND: "The requested Valuator could not be found",
      SO_DELETED: "Sub Officer deleted successfully",
      VALUATOR_DELETED: "Valuator deleted successfully",

      CLIENT_NOT_FOUND: "Client not found",
      VEHICLE_TYPES_NOT_FOUND:"Some Vehicle types are invalid"
      
    },
  },

  // data table names
  DATA_TABLES: {
    ROLE: "role",
    ADMINS: "admins",
    SO: "subofficers",
    CLIENT:"clients",
    VALUATOR:"valuators",
    VEHICLE_TYPE:"vehicletype",
    VEHICLE_CATEGORY:"vehiclecategory",
  },
};
