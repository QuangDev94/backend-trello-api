/* eslint-disable no-useless-catch */
import { StatusCodes } from "http-status-codes"
import { boardModel } from "~/models/boardModel"
import ApiError from "~/utils/ApiError"
import { cloneDeep } from "lodash"
import { slugify } from "~/utils/formatters"

const createNew = async (reqBody) => {
  try {
    const newBoard = {
      ...reqBody,
      slug: slugify(reqBody.title),
    }
    // Gọi tới tầng Model để xử lý lưu bản ghi newBoard vào database
    const createdBoard = await boardModel.createNew(newBoard)
    //     Lấy bản ghi board sau khi gọi
    const getNewBoard = await boardModel.findOneById(createdBoard.insertedId)

    if (getNewBoard) {
      getNewBoard.columns = []
    }
    // Làm thêm các xử lý logic khác với các Collection khác tùy đặc thù dự án
    return getNewBoard
  } catch (error) {
    throw error
  }
}

const getDetails = async (reqParamId) => {
  try {
    const getDetailsBoard = await boardModel.getDetails(reqParamId)
    if (!getDetailsBoard) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Board not found!")
    }
    // deep clone 1 board mới để xử lý để ko ảnh hưởng tới board ban đầu nếu gán trực tiếp
    const resBoard = cloneDeep(getDetailsBoard)
    // Thay đổi cấu trúc dữ liệu (tạo 1 mảng card có chung columnId vào column)
    resBoard.columns.forEach((column) => {
      column.cards = resBoard.cards.filter(
        (card) => card.columnId.toString() === column._id.toString(),
      )
    })

    delete resBoard.cards
    return resBoard
  } catch (error) {
    throw error
  }
}

export const boardService = {
  createNew,
  getDetails,
}
