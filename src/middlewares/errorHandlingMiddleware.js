/**
 * Updated by trungquandev.com's author on August 17 2023
 * YouTube: https://youtube.com/@trungquandev
 * "A bit of fragrance clings to the hand that gives flowers!"
 */
import { StatusCodes } from "http-status-codes"
import { env } from "~/config/environment"
// Middleware xử lý lỗi tập trung trong ứng dụng BE Nodejs(ExpressJs)
export const errorHandlingMiddleware = (err, req, res, next) => {
  // Nếu dev ko cẩn thận thiếu status code thì mặc định để là 500
  if (!err.statusCode) err.statusCode = StatusCodes.INTERNAL_SERVER_ERROR

  //   Tạo ra 1 biến responseError để kiểm soát nhưng gì muốn trả về
  const responseError = {
    statusCode: err.statusCode,
    //     Nếu lỗi ko có mesage thì lấy ReasonPhrases chuẩn theo mã status code
    message: err.message || StatusCodes[err.statusCode],
    stack: err.stack,
  }
  // console.log("BUILD_MODE: ", env.BUILD_MODE)
  // Chỉ khi môi trường là DEV thì mới trả về Stack Trace để debug dễ dàng hơn, còn ko thì xóa đi
  if (env.BUILD_MODE !== "dev") delete responseError.stack
  //   trả responseError cho FE
  res.status(responseError.statusCode).json(responseError)
}
