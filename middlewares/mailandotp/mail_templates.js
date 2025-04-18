// mail template
module.exports.MAIL_HTML_TEMPLATES = {
  /** signup */
  SIGNUP_TEMPLATE: (email, password, isUser = false) => {
    return `<div>
                    <h4>Welcome to Medylifeline Portal</h4>
                    <p>You are successfully registered to the portal, Your Account credentials listed below,</p>
                    <p className="mb-1">Email: ${email}</p>
                    <p>Password: ${password}</p>
                    ${!isUser
        ? '<p>Click the link to login: <a href="http://localhost:3000/login">http://localhost:3000/login</a></p>'
        : "Please Download Medylifeline App for Medical related services"
      }
                </div> `;
  },

  /* login otp  */
  SIGNUP_OTP: (otp, to) => {
    return {
      to,
      subject: "Phone number verification for sign up",
      html: `<div>
                    <h4>Welcome to Medylifeline Portal</h4>
                    <p>To verify your phone number, Enter OTP: ${otp}</p>
                </div> `,
    };
  },
  /* login otp  */
  LOGIN_OTP: (otp, to) => {
    return {
      to,
      subject: "Login by OTP",
      html: `<p> To login to your Medylifeline portal account, Enter OTP: ${otp}</p> `,
    };
  },

  /* otp  */
  OTP: (otp, to) => {
    return {
      to,
      subject: "Forgot password OTP",
      html: `<p> To reset your password, verify your account.OTP : ${otp}</p> `,
    };
  },
  /* foegot password */
  FORGOT_PASSWORD_ADMIN: (url, linkExpiry, to) => {
    return {
      to,
      subject: "Reset password",
      html: ` <div>
            <p>Click the link to rest the password: - <a href=${url}>Click here</a></p>
                <p> This link will expire after ${linkExpiry}</p>
                </div>
            `,
    };
  },

  /* hospital signup template   */
  HOSPITAL_SIGNUP_TEMPLATE: (email, password) => {
    return `<div>
                    <h4>Welcome to Medylifeline Portal</h4>
                    <p>Hospital successfully registered to the portal, Your Hospital Account credentials are listed below,</p>
                    <p className="mb-1">Email: ${email}</p>
                    <p>Password: ${password}</p>
                    <p>Click the link to login: <a href="http://localhost:3000/login">http://localhost:3000/login</a></p>
                </div>`;
  },

  /* hospital signup template   */
  HOSPITAL_UPDATE_TEMPLATE: (email, password) => {
    return `<div>
                    <h4>Welcome to Medylifeline Portal</h4>
                    <p>Your email updated, Your Hospital Account updated credentials are listed below,</p>
                    <p className="mb-1">Email: ${email}</p>
                    <p>Click the link to login: <a href="http://localhost:3000/login">http://localhost:3000/login</a></p>
                </div>`;
  }
};
