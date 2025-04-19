/* eslint-disable no-useless-catch */
import { StatusCodes } from "http-status-codes"
import { userModel } from "~/models/userModel"
import ApiError from "~/utils/ApiError"
import bcrypt from "bcryptjs"
import { v4 as uuidv4 } from "uuid"
import { pickUser } from "~/utils/formatters"

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

    // return data to controller
    return pickUser(getNewUser)
  } catch (error) {
    throw error
  }
}

export const userService = { createNew }
