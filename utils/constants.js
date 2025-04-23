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
      GET_RO_LIST: "/list",
      GET_RO_BY_ID: "/list/:id",
      DELETE_RO_BY_ID: "/delete/:id/:updatedBy"
    },
    CLIENTS: {
      CREATE_CLIENT: "/create",
      UPDATE_CLIENT: "/update/:id",
      GET_CLIENT_LIST: "/list",
      GET_CLIENT_BY_ID: "/list/:id",
      DELETE_CLIENT_BY_ID: "/delete/:id",

      // vehicle types 
      CREATE_VEHICLE_TYPE: "/createVehicleType",
      UPDATE_VEHICLE_TYPE: "/updateVehicleType/:id",
      GET_VEHICLE_TYPE_LIST: "/listVehicleType",
      GET_VEHICLE_TYPE_BY_ID: "/listVehicleType/:id",
      DELETE_VEHICLE_TYPE_BY_ID: "/deleteVehicleType/:id",

      // vehicle category
      CREATE_VEHICLE_CATEGORY: "/createVehicleCategory",
      UPDATE_VEHICLE_CATEGORY: "/updateVehicleCategory/:id",
      GET_VEHICLE_CATEGORY_LIST: "/listVehicleCategory",
      GET_VEHICLE_CATEGORY_BY_ID: "/listVehicleCategory/:id",
      DELETE_VEHICLE_CATEGORY_BY_ID: "/deleteVehicleCategory/:id",
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
      SO_REGISTERED:"Service Officer created successfully.",
      SO_UPDATED:"Service Officer updated successfully.",
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
      FORGOT_OTP_MAIL: "OTP for reset password is sent to your Email",
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
      NOTIFICATION_DELETED: "Notification deleted sucessfully",
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

      
    },
  },

  // data table names
  DATA_TABLES: {
    ROLE: "role",
    ADMINS: "admins",
    SO: "so",
    CLIENT:"clients",
    VALUATOR:"valuators",
    VEHICLE_TYPE:"vehicle_type",
    VEHICLE_CATEGORY:"vehicle_category",
  },
};
