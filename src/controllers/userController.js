import { StatusCodes } from "http-status-codes"
import ms from "ms"
import { userService } from "~/services/userService"
import ApiError from "~/utils/ApiError"

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
      maxAge: ms("1 days"),
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

const logout = async (req, res, next) => {
  try {
    res.clearCookie("accessToken")
    res.clearCookie("refreshToken")
    res.status(StatusCodes.OK).json({ loggedOut: true })
  } catch (error) {
    next(error)
  }
}

const refreshToken = async (req, res, next) => {
  try {
    const result = await userService.refreshToken(req.cookies?.refreshToken)
    res.cookie("accessToken", result.accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: ms("14 days"),
    })
    res.status(StatusCodes.OK).json(result)
  } catch (error) {
    next(
      new ApiError(
        StatusCodes.FORBIDDEN,
        "Please Sign in! (Error from refresh Token)",
      ),
    )
  }
}

const update = async (req, res, next) => {
  try {
    const userId = req.jwtDecoded._id
    const updatedUser = await userService.update(userId, req.body)
    console.log("updatedUser: ", updatedUser)
    res.status(StatusCodes.OK).json(updatedUser)
  } catch (error) {
    next(error)
  }
}

export const userController = {
  createNew,
  verify,
  login,
  logout,
  refreshToken,
  update,
}
