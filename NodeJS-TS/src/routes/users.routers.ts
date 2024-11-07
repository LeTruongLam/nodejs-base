import { Router } from 'express'
import {
  accessTokenValidator,
  emailVerifyTokenValidator,
  forgotPasswordValidator,
  loginValidator,
  refreshTokenValidator,
  registerValidator,
  verifyForgotPasswordTokenValidator
} from '~/middlewares/users.middlewares'
import {
  emailVerifyValidator,
  forgotPasswordController,
  loginController,
  logoutController,
  registerController,
  verifyEmailController,
  verifyForgotPasswordController
} from '~/controllers/users.controllers'
import { wrapRequestHandler } from '~/utils/handlers'
const usersRouter = Router()
/**
 * Description : Login a new user
 * Path: /login
 * Method: POST
 * Body: {email:string, password: string}
 */
usersRouter.post('/login', loginValidator, wrapRequestHandler(loginController))
/**
 * Description : Register a new user
 * Path: /register
 * Method: POST
 * Body: {name:string, email:string, password: string, confirm_password: string, date_of_birth: ISO8601}
 */

usersRouter.post('/register', registerValidator, wrapRequestHandler(registerController))

/**
 * Description :Logout a  user
 * Path: /logout
 * Method: POST
 * Header: {Authorization: Bearer <access_token>}
 * Body: {refresh_token: string}
 */

usersRouter.post('/logout', accessTokenValidator, refreshTokenValidator, wrapRequestHandler(logoutController))

/**
 * Description :Verify email when user click on link in email
 * Path: /verify-email
 * Method: POST
 * Body: {email_verify_token: string}
 */

usersRouter.post('/verify-email', emailVerifyTokenValidator, wrapRequestHandler(emailVerifyValidator))

/**
 * Description : Resend verify email
 * Path: /resend-verify-email
 * Method: POST
 * Header: {Authorization: Bearer <access_token>}
 * Body: {}
 */

usersRouter.post('/resend-verify-email', accessTokenValidator, wrapRequestHandler(verifyEmailController))

/**
 * Description : Forgot password
 * Path: /forgot-password
 * Method: POST
 * Body: { email: string }
 */
usersRouter.post('/forgot-password', forgotPasswordValidator, wrapRequestHandler(forgotPasswordController))

/**
 * Description : Verify forgot password
 * Path: /verify-forgot-password
 * Method: POST
 * Body: { forgot_password_token: string }
 */
usersRouter.post(
  '/verify-forgot-password',
  verifyForgotPasswordTokenValidator,
  wrapRequestHandler(verifyForgotPasswordController)
)

export default usersRouter
