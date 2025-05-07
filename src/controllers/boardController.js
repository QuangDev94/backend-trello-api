import { StatusCodes } from "http-status-codes"
import { boardService } from "~/services/boardService"

const createNew = async (req, res, next) => {
  try {
    const userId = req.jwtDecoded._id

    //     Điều hướng dữ liệu sang tầng service
    const createdBoard = await boardService.createNew(userId, req.body)
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
    const userId = req.jwtDecoded._id
    const detailsBoard = await boardService.getDetails(userId, req.params.id)
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

const moveCardBetweenDifferentColumns = async (req, res, next) => {
  try {
    const result = await boardService.moveCardBetweenDifferentColumns(req.body)
    res.status(StatusCodes.OK).json(result)
  } catch (error) {
    next(error)
  }
}

const getBoards = async (req, res, next) => {
  try {
    const userId = req.jwtDecoded._id
    // Page và itemsPerPage được truyền vào trong query url từ phía FE nên BE sẽ lấy thông qua req.query
    const { page, itemsPerPage } = req.query
    const result = await boardService.getBoards(userId, page, itemsPerPage)

    res.status(StatusCodes.OK).json(result)
  } catch (error) {
    next(error)
  }
}
export const boardController = {
  createNew,
  getDetails,
  update,
  moveCardBetweenDifferentColumns,
  getBoards,
}
