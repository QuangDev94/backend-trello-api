import { StatusCodes } from "http-status-codes"
import ms from "ms"
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
    // Xử lý trả về http only cookie cho phía trình duyệt
    // thời gian sống maxAge của cookie khác với thời gian sống của token
    res.cookie("accessToken", loginUser.accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: ms("14 days"),
    })
    res.cookie("refreshToken", loginUser.refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: ms("14 days"),
    })
    res.status(StatusCodes.CREATED).json(loginUser)
  } catch (error) {
    next(error)
  }
}

export const userController = { createNew, verify, login }
