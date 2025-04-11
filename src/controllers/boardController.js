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

const getDetails = async (req, res, next) => {
  try {
    const detailsBoard = await boardService.getDetails(req.params.id)
    res.status(StatusCodes.OK).json(detailsBoard)
  } catch (error) {
    next(error)
  }
}

const update = async (req, res, next) => {
  try {
    const updatedBoard = await boardService.update(req.params.id, req.body)
    res.status(StatusCodes.OK).json(updatedBoard)
  } catch (error) {
    next(error)
  }
}
export const boardController = {
  createNew,
  getDetails,
  update,
}
