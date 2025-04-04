/**
 * Updated by trungquandev.com's author on August 17 2023
 * YouTube: https://youtube.com/@trungquandev
 * "A bit of fragrance clings to the hand that gives flowers!"
 */
// Controller là tầng xử lý điều phối request: body,query,params,files,cookies,jwtDecoded

import { StatusCodes } from "http-status-codes"
import { boardService } from "~/services/boardService"

const createNew = async (req, res, next) => {
  try {
    //     Điều hướng dữ liệu sang tầng service
    const createdBoard = await boardService.createNew(req.body)
    //     Có kết quả sẽ trả về phía client tại tầng controller
    res.status(StatusCodes.CREATED).json(createdBoard)
  } catch (error) {
    next(error)
    // res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
    //   errors: error.message,
    // })
  }
}

export const boardController = {
  createNew,
}
