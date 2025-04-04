/**
 * Updated by trungquandev.com's author on August 17 2023
 * YouTube: https://youtube.com/@trungquandev
 * "A bit of fragrance clings to the hand that gives flowers!"
 */
// Controller là tầng xử lý điều phối request: body,query,params,files,cookies,jwtDecoded

import { StatusCodes } from "http-status-codes"

const createNew = async (req, res, next) => {
  try {
    console.log("req.body: ", req.body)
    //     Điều hướng dữ liệu sang tầng service
    //     Có kết quả sẽ trả về phía client tại tầng controller
    res.status(StatusCodes.CREATED).json({
      message: "NOTE: API create new board controller",
    })
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      errors: error.message,
    })
  }
}

export const boardController = {
  createNew,
}
