/* eslint-disable no-useless-catch */
import { StatusCodes } from "http-status-codes"
import { boardModel } from "~/models/boardModel"
import ApiError from "~/utils/ApiError"
import { cloneDeep } from "lodash"
import { slugify } from "~/utils/formatters"
import { columnModel } from "~/models/columnModel"
import { cardModel } from "~/models/cardModel"
import { DEFAULT_ITEMS_PER_PAGE, DEFAULT_PAGE } from "~/utils/constants"

const createNew = async (reqBody) => {
  try {
    const newBoard = {
      ...reqBody,
      slug: slugify(reqBody.title),
    }
    // Gọi tới tầng Model để xử lý lưu bản ghi newBoard vào database
    const createdBoard = await boardModel.createNew(newBoard)
    // Lấy bản ghi board sau khi gọi
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

const update = async (reqParamId, reqBody) => {
  try {
    const updateData = {
      ...reqBody,
      updatedAt: Date.now(),
    }
    const updatedboard = await boardModel.update(reqParamId, updateData)

    return updatedboard
  } catch (error) {
    throw error
  }
}

const moveCardBetweenDifferentColumns = async (reqBody) => {
  try {
    // B1: Cập nhật mảng cardOrderIds của Column ban đầu chứa card được kéo (xóa _id trong mảng cardOrderIds)
    await columnModel.update(reqBody.prevColumnId, {
      cardOrderIds: reqBody.prevCardOrderIdsUpdated,
      updatedAt: Date.now(),
    })
    // B2: Cập nhật mảng cardOrderIds của Column tiếp theo (thêm _id trong mảng cardOrderIds)
    await columnModel.update(reqBody.nextColumnId, {
      cardOrderIds: reqBody.nextCardOrderIdsUpdated,
      updatedAt: Date.now(),
    })
    // B3: Cập nhật lại columnId của card được kéo
    await cardModel.update(reqBody.currentCardId, {
      columnId: reqBody.nextColumnId,
      updatedAt: Date.now(),
    })

    return { updateResult: "Successfully!" }
  } catch (error) {
    throw error
  }
}

const getBoards = async (userId, page, itemsPerPage) => {
  try {
    // Nếu ko tồn tại page và itemsPerPage từ phía FE thì BE sẽ cần phải luôn gán giá trị mặc định
    if (!page) page = DEFAULT_PAGE
    if (!itemsPerPage) itemsPerPage = DEFAULT_ITEMS_PER_PAGE
    const result = await boardModel.getBoards(
      userId,
      parseInt(page, 10),
      parseInt(itemsPerPage, 10),
    )
    return result
  } catch (error) {
    throw error
  }
}

export const boardService = {
  createNew,
  getDetails,
  update,
  moveCardBetweenDifferentColumns,
  getBoards,
}
