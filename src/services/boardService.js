/* eslint-disable no-useless-catch */
import { boardModel } from "~/models/boardModel"
import ApiError from "~/utils/ApiError"

/**
 * Updated by trungquandev.com's author on August 17 2023
 * YouTube: https://youtube.com/@trungquandev
 * "A bit of fragrance clings to the hand that gives flowers!"
 */
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
    // Làm thêm các xử lý logic khác với các Collection khác tùy đặc thù dự án
    return getNewBoard
  } catch (error) {
    throw error
  }
}

export const boardService = {
  createNew,
}
