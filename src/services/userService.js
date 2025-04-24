/* eslint-disable no-useless-catch */
import { StatusCodes } from "http-status-codes"
import { userModel } from "~/models/userModel"
import ApiError from "~/utils/ApiError"
import bcrypt from "bcryptjs"
import { v4 as uuidv4 } from "uuid"
import { pickUser } from "~/utils/formatters"
import { WEBSITE_DOMAIN } from "~/utils/constants"
import { BrevoProvider } from "~/providers/BrevoProvider"

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

export const userService = { createNew }
