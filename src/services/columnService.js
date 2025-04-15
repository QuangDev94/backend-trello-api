import { StatusCodes } from "http-status-codes"
import { boardModel } from "~/models/boardModel"
import { cardModel } from "~/models/cardModel"
import { columnModel } from "~/models/columnModel"
import ApiError from "~/utils/ApiError"
import { slugify } from "~/utils/formatters"

/* eslint-disable no-useless-catch */
const createNew = async (reqBody) => {
  try {
    const newColumn = {
      ...reqBody,
      slug: slugify(reqBody.title),
    }
    const createColumn = await columnModel.createNew(newColumn)

    const getNewColumn = await columnModel.findOneById(createColumn.insertedId)

    if (getNewColumn) {
      // Xử lý dữ liệu sau khi lấy ra được từ db và trả về cho FE
      getNewColumn.cards = []
      // Cập nhật mảng columnOrderIds trong collection board trong mongodb
      await boardModel.pushColumnOrderIds(getNewColumn)
    }
    return getNewColumn
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
    const updatedColumn = await columnModel.update(reqParamId, updateData)

    return updatedColumn
  } catch (error) {
    throw error
  }
}

const deleteColumn = async (reqParamId) => {
  try {
    // Find column
    const targetColumn = await columnModel.findOneById(reqParamId)

    if (!targetColumn) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Column not found!")
    }
    // Delete column
    await columnModel.deleteOneById(reqParamId)
    // Delete Cards in column
    await cardModel.deleteManyByColumnId(reqParamId)
    // Delete ColumnId in columnOrderIds in board
    await boardModel.pullColumnOrderIds(targetColumn)

    return { deleteResult: "Column and its cards deleted successfully!" }
  } catch (error) {
    throw error
  }
}
export const columnService = { createNew, update, deleteColumn }
