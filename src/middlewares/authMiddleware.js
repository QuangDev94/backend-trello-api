// Middleware này sẽ đảm nhiệm việc quan trọng: xác thực JWT accessToken nhận được từ FE có hợp lệ ko

import { StatusCodes } from "http-status-codes"
import { env } from "~/config/environment"
import { JwtProvider } from "~/providers/JwtProvider"
import ApiError from "~/utils/ApiError"

const isAuthorized = async (req, res, next) => {
  // lấy accessToken nằm trong request cookie phía client - withCredentials trong file authorizeAxios
  const clientAccessToken = req.cookies?.accessToken
  if (!clientAccessToken) {
    next(
      new ApiError(StatusCodes.UNAUTHORIZED, "Unauthorized! (token not found)"),
    )
    return
  }
  try {
    // B1: Thực hiện giải mã accessToken xem có hợp lệ hay ko
    const accessTokenDecoded = await JwtProvider.verifyToken(
      clientAccessToken,
      env.ACCESS_TOKEN_SECRET_SIGNATURE,
    )
    // B2: Quan trọng: Nếu như cái token hợp lệ , thì sẽ cần phải lưu thông tin giải mã được vào req.jwtDecoded, để xử lý các phần tiếp theo
    req.jwtDecoded = accessTokenDecoded
    // B3: Cho phép request đi tiếp
    next()
  } catch (error) {
    // Nếu accessToken bị hết hạn (expired) thì cần trả về mã lỗi cho FE biết để gọi api refreshToken
    if (error?.message?.includes("jwt expired")) {
      next(new ApiError(StatusCodes.GONE, "Need to refresh token."))
      return
    }
    // Nếu accessToken ko hợp lệ thì thẳng tay trả về mã 401 cho FE gọi api sign_out
    next(new ApiError(StatusCodes.UNAUTHORIZED, "Unauthorized"))
  }
}

export const authMiddleware = {
  isAuthorized,
}
