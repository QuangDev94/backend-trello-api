import { boardModel } from "~/models/boardModel"
import { columnModel } from "~/models/columnModel"
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

export const columnService = { createNew }
