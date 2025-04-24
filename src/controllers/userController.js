import { StatusCodes } from "http-status-codes"
import { userService } from "~/services/userService"

const createNew = async (req, res, next) => {
  try {
    const createdUser = await userService.createNew(req.body)
    res.status(StatusCodes.CREATED).json(createdUser)
  } catch (error) {
    next(error)
  }
}

const verify = async (req, res, next) => {
  try {
    const verifiedUser = await userService.verify(req.body)
    res.status(StatusCodes.CREATED).json(verifiedUser)
  } catch (error) {
    next(error)
  }
}

const login = async (req, res, next) => {
  try {
    const loginUser = await userService.login(req.body)
    res.status(StatusCodes.CREATED).json(loginUser)
  } catch (error) {
    next(error)
  }
}

export const userController = { createNew, verify, login }
