import e, { NextFunction, Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import usersService from '~/services/users.services'
import {
  ForgotPasswordReqBody,
  GetProfileReqParams,
  LoginReqBody,
  LogoutReqBody,
  RegisterReqBody,
  ResetPasswordReqBody,
  TokenPayload,
  UpdateMeReqBody,
  VerifyEmailReqBody,
  VerifyForgotPasswordReqBody
} from '~/models/requests/User.requests'
import { ObjectId } from 'mongodb'
import User from '~/models/schemas/User.schema'
import { USERS_MESSAGES } from '~/constants/message'
import databaseService from '~/services/database.services'
import { UserVerifyStatus } from '~/constants/enum'
import HTTP_STATUS from '~/constants/httpStatus'
/**
 * Login user
 * @param {Request} req - Request object containing user information
 * @param {Response} res - Response object
 *
 * @description
 * Logs in a user by generating and returning access and refresh tokens.
 * If login is successful, returns 200 status with message LOGIN_SUCCESS and tokens.
 */
export const loginController = async (req: Request<ParamsDictionary, any, LoginReqBody>, res: Response) => {
  const user = req.user as User
  const user_id = user._id as ObjectId
  const result = await usersService.login({ user_id: user_id.toString(), verify: user.verify })
  return res.json({
    message: USERS_MESSAGES.LOGIN_SUCCESS,
    result
  })
}
/**
 * Register new user
 * @param {Request} req - Request object with body containing user register data
 * @param {Response} res - Response object
 * @param {NextFunction} next - Next function
 *
 * @description
 * Register new user with given user data. If user already exist, return 400 status with message is EMAIL_ALREADY_EXIST.
 * If password is invalid, return 400 status with message is PASSWORD_IS_INVALID.
 * If register success, return 200 status with message is REGISTER_SUCCESS and result is access token and refresh token.
 */
export const registerController = async (
  req: Request<ParamsDictionary, any, RegisterReqBody>,
  res: Response,
  next: NextFunction
) => {
  // throw new Error('Test error')
  const result = await usersService.register(req.body)
  return res.json({
    message: USERS_MESSAGES.REGISTER_SUCCESS,
    result
  })
}

/**
 * Logout user
 * @param {Request} req - Request object
 * @param {Response} res - Response object
 *
 * @description
 * Logout user with given refresh token. If user not found, return 404 status with message is USER_NOT_FOUND.
 * If refresh token is invalid, return 400 status with message is REFRESH_TOKEN_IS_INVALID.
 * If user refresh token or not exist, return 400 status with message is USER_REFRESH_TOKEN_OR_NOT_EXIST.
 * If logout success, return 200 status with message is LOGOUT_SUCCESS.
 */
export const logoutController = async (req: Request<ParamsDictionary, any, LogoutReqBody>, res: Response) => {
  const { refresh_token } = req.body
  const result = await usersService.logout(refresh_token)
  return res.json(result)
}
/**
 * Validate email verify token
 * @param {Request} req - Request object
 * @param {Response} res - Response object
 * @param {NextFunction} next - Next function
 *
 * @description
 * Validate email verify token, if user not found, return 404 status with message is USER_NOT_FOUND.
 * If email has been verified, return 200 status with message is EMAIL_ALREADY_VERIFIED.
 * If email is not verified, verify email and return 200 status with message is EMAIL_VERIFY_SUCCESS.
 */
export const emailVerifyValidator = async (req: Request, res: Response, next: NextFunction) => {
  const { user_id } = req.decoded_email_verify_token as TokenPayload
  const user = await databaseService.users.findOne({ _id: new ObjectId(user_id) })

  // Nếu không tìm thấy user
  if (!user) {
    return res.status(404).json({ message: USERS_MESSAGES.USER_NOT_FOUND })
  }
  // Đã vẻify rồi thì sẽ không báo lỗi
  // Mà sẽ trả về status OK với message là đã vẻify trước đó  rồi
  if (user.email_verify_token === '') {
    return res.json({ message: USERS_MESSAGES.EMAIL_ALREADY_VERIFIED })
  }
  const result = await usersService.verifyEmail(user_id)
  return res.json({
    message: USERS_MESSAGES.EMAIL_VERIFY_SUCCESS,
    result
  })
}

/**
 * Resend verify email
 * @param {Request} req - Request object
 * @param {Response} res - Response object
 *
 * @description
 * Resend verify email to user. If user not found, return 404 status with message is USER_NOT_FOUND.
 * If user has been verified, return 200 status with message is EMAIL_ALREADY_VERIFIED_BEFORE.
 * If resend verify email success, return 200 status with message is RESEND_VERIFY_EMAIL_SUCCESS.
 */
export const verifyEmailController = async (
  req: Request<ParamsDictionary, any, VerifyEmailReqBody>,
  res: Response,
  next: NextFunction
) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const user = await databaseService.users.findOne({ _id: new ObjectId(user_id) })
  if (!user) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({ message: USERS_MESSAGES.USER_NOT_FOUND })
  }
  if (user.verify === UserVerifyStatus.Verified) {
    return res.json({ message: USERS_MESSAGES.EMAIL_ALREADY_VERIFIED_BEFORE })
  }
  const result = await usersService.resendVerifyEmail(user_id)
  return res.json(result)
}
export const forgotPasswordController = async (
  req: Request<ParamsDictionary, any, ForgotPasswordReqBody>,
  res: Response,
  next: NextFunction
) => {
  const { _id, verify } = req.user as User
  const result = await usersService.forgotPassword({ user_id: (_id as ObjectId).toString(), verify })
  return res.json(result)
}
export const verifyForgotPasswordController = async (
  req: Request<ParamsDictionary, any, VerifyForgotPasswordReqBody>,
  res: Response,
  next: NextFunction
) => {
  return res.json({
    message: USERS_MESSAGES.VERIFY_FORGOT_PASSWORD_SUCCESS
  })
}

export const resetPasswordController = async (
  req: Request<ParamsDictionary, any, ResetPasswordReqBody>,
  res: Response,
  next: NextFunction
) => {
  const { user_id } = req.decoded_forgot_password_token as TokenPayload
  const { password } = req.body
  const result = await usersService.resetPassword(user_id, password)
  return res.json(result)
}

export const getMeController = async (req: Request, res: Response, next: NextFunction) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const user = await usersService.getMe(user_id)
  return res.json({
    message: USERS_MESSAGES.GET_ME_SUCCESS,
    result: user
  })
}
export const updateMeController = async (
  req: Request<ParamsDictionary, any, UpdateMeReqBody>,
  res: Response,
  next: NextFunction
) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const { body } = req
  console.log('body', body)
  const user = await usersService.updateMe(user_id, body)
  return res.json({
    message: USERS_MESSAGES.UPDATE_ME_SUCCESS,
    result: user
  })
}
export const getProfileController = async (req: Request<GetProfileReqParams>, res: Response, next: NextFunction) => {
  const { username } = req.params
  const user = await usersService.getProfile(username)
  return res.json({
    message: USERS_MESSAGES.GET_PROFILE_SUCCESS,
    result: user
  })
}
