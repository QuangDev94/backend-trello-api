/* eslint-disable no-useless-catch */
import { StatusCodes } from "http-status-codes"
import { userModel } from "~/models/userModel"
import ApiError from "~/utils/ApiError"
import bcrypt from "bcryptjs"
import { v4 as uuidv4 } from "uuid"
import { pickUser } from "~/utils/formatters"
import { WEBSITE_DOMAIN } from "~/utils/constants"
import { BrevoProvider } from "~/providers/BrevoProvider"
import { JwtProvider } from "~/providers/JwtProvider"
import { env } from "~/config/environment"

const createNew = async (reqBody) => {
  try {
    // Check the email is existed in data base
    const existUser = await userModel.findOneByEmail(reqBody.email)
    if (existUser) {
      throw new ApiError(StatusCodes.CONFLICT, "The email is existed!")
    }
    // Create new user
    const namFromEmail = reqBody.email.split("@")[0]
    const newUser = {
      email: reqBody.email,
      password: bcrypt.hashSync(reqBody.password, 8),
      username: namFromEmail,
      displayName: namFromEmail,
      verifyToken: uuidv4(),
    }
    // Save in database
    const createdUser = await userModel.createNew(newUser)
    const getNewUser = await userModel.findOneById(createdUser.insertedId)
    // Send message to the user email to verify
    const verificationLink = `${WEBSITE_DOMAIN}/account/verificaion?email=${getNewUser.email}&token=${getNewUser.verifyToken}`
    // const customSubject =
    //   "Trello MERN Stack Advance: Please verify your email before using our services!"
    // const htmlContent = `
    //   <h3>Here is your verification link: </h3>
    //   <h3>${verificationLink}</h3>
    //   <h3>Sincerely,<br/> - QuangNguyenDev</h3>
    // `
    // // Gọi tới Provider gửi mail
    // await BrevoProvider.sendEmail(getNewUser.email, customSubject, htmlContent)
    // return data to controller
    return { verificationLink, email: getNewUser.email }
  } catch (error) {
    throw error
  }
}

const verify = async (reqBody) => {
  try {
    // Query user in database
    const existUser = await userModel.findOneByEmail(reqBody.email)
    // Check case invalid
    if (!existUser)
      throw new ApiError(StatusCodes.NOT_FOUND, "Account not found!")
    if (existUser.isActive)
      throw new ApiError(
        StatusCodes.NOT_ACCEPTABLE,
        "Your account is already active!",
      )
    if (reqBody.token !== existUser.verifyToken)
      throw new ApiError(StatusCodes.NOT_ACCEPTABLE, "Token is invalid!")
    // Update information of user to verify account in dataBase
    const updateData = {
      isActive: true,
      verifyToken: null,
    }
    const updatedUser = await userModel.update(existUser._id, updateData)

    return pickUser(updatedUser)
  } catch (error) {
    throw error
  }
}

const login = async (reqBody) => {
  try {
    // Query user in database
    const existUser = await userModel.findOneByEmail(reqBody.email)
    // Check case invalid
    if (!existUser)
      throw new ApiError(StatusCodes.NOT_FOUND, "Account not found!")
    if (!existUser.isActive)
      throw new ApiError(
        StatusCodes.NOT_ACCEPTABLE,
        "Your account is not active, check your email to active!",
      )
    if (!bcrypt.compareSync(reqBody.password, existUser.password))
      throw new ApiError(
        StatusCodes.NOT_ACCEPTABLE,
        "Your password is incorrect!",
      )
    // Nếu mọi thứ OK thì bắt đầu tạo Tokens đăng nhập để trả về cho FE
    // Tạo thông tin để đính kèm trong JWT token : bao gồm _id và email của user
    const userInfor = {
      _id: existUser._id,
      email: existUser.email,
    }
    // Tạo ra 2 loại token (accessToken và refreshToken) để trả về cho FE
    const accessToken = await JwtProvider.generateToken(
      userInfor,
      env.ACCESS_TOKEN_SECRET_SIGNATURE,
      env.ACCESS_TOKEN_LIFE,
    )
    const refreshToken = await JwtProvider.generateToken(
      userInfor,
      env.REFRESH_TOKEN_SECRET_SIGNATURE,
      env.REFRESH_TOKEN_LIFE,
    )
    // Trả về thông tin của user kèm theo 2 token vừa tạo
    return {
      accessToken,
      refreshToken,
      ...pickUser(existUser),
    }
  } catch (error) {
    throw error
  }
}

const refreshToken = async (clientRefreshToken) => {
  try {
    // verify refreshToken có hợp lệ ko
    const refreshTokenDecoded = await JwtProvider.verifyToken(
      clientRefreshToken,
      env.REFRESH_TOKEN_SECRET_SIGNATURE,
    )

    // Lấy thông tin của user
    const userInfor = {
      _id: refreshTokenDecoded._id,
      email: refreshTokenDecoded.email,
    }

    // Tạo accessToken mới
    const accessToken = await JwtProvider.generateToken(
      userInfor,
      env.ACCESS_TOKEN_SECRET_SIGNATURE,
      env.ACCESS_TOKEN_LIFE,
    )

    return { accessToken }
  } catch (error) {
    throw error
  }
}

export const userService = { createNew, verify, login, refreshToken }
