import Joi from "joi"
import { GET_DB } from "~/config/mongodb"
import { ObjectId } from "mongodb"
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from "~/utils/validators"
import { BOARD_TYPES } from "~/utils/constants"
import { columnModel } from "./columnModel"
import { cardModel } from "./cardModel"
import { pagingSkipValue } from "~/utils/algorithms"
import { userModel } from "./userModel"

// Define Collection (Name & Schema)
const BOARD_COLLECTION_NAME = "boards"
const BOARD_COLLECTION_SCHEMA = Joi.object({
  title: Joi.string().required().min(3).max(50).trim().strict(),
  slug: Joi.string().required().min(3).trim().strict(),
  description: Joi.string().required().min(3).max(256).trim().strict(),
  type: Joi.string().valid(BOARD_TYPES.PUBLIC, BOARD_TYPES.PRIVATE).required(),
  columnOrderIds: Joi.array()
    .items(Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE))
    .default([]),
  ownerIds: Joi.array()
    .items(Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE))
    .default([]),
  memberIds: Joi.array()
    .items(Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE))
    .default([]),
  createdAt: Joi.date().timestamp("javascript").default(Date.now()),
  updatedAt: Joi.date().timestamp("javascript").default(null),
  _destroy: Joi.boolean().default(false),
})
const INVALID_UPDATE_FIELD = ["_id", "createdAt"]

const validateBeforeCreate = async (data) => {
  return await BOARD_COLLECTION_SCHEMA.validateAsync(data, {
    abortEarly: false,
  })
}

const createNew = async (userId, data) => {
  try {
    const validData = await validateBeforeCreate(data)
    const newBoardToAdd = {
      ...validData,
      ownerIds: [new ObjectId(userId)],
    }

    const createdBoard = await GET_DB()
      .collection(BOARD_COLLECTION_NAME)
      .insertOne(newBoardToAdd)

    return createdBoard
  } catch (error) {
    throw new Error(error)
  }
}

const update = async (reqParamId, updateData) => {
  // Ko cho phép cập nhật các trường trong INVALID_UPDATE_FIELD
  Object.keys(updateData).forEach((fieldName) => {
    if (INVALID_UPDATE_FIELD.includes(fieldName)) {
      delete updateData[fieldName]
    }
  })
  if (updateData.columnOrderIds) {
    updateData.columnOrderIds = updateData.columnOrderIds.map(
      (c) => new ObjectId(c),
    )
  }
  try {
    const result = await GET_DB()
      .collection(BOARD_COLLECTION_NAME)
      .findOneAndUpdate(
        {
          _id: new ObjectId(reqParamId),
        },
        {
          $set: updateData,
        },
        {
          returnDocument: "after",
        },
      )
    return result
  } catch (error) {
    throw new Error(error)
  }
}

const findOneById = async (id) => {
  try {
    const result = await GET_DB()
      .collection(BOARD_COLLECTION_NAME)
      .findOne({
        _id: new ObjectId(id),
      })

    return result
  } catch (error) {
    throw new Error(error)
  }
}

// query tổng hợp (aggregate) để lấy toàn bộ Columns và Card thuộc về Board
const getDetails = async (userId, boardId) => {
  try {
    const queryConditions = [
      {
        _id: new ObjectId(boardId),
      },
      {
        _destroy: false,
      },
      {
        $or: [
          { ownerIds: { $all: [new ObjectId(userId)] } },
          { memberIds: { $all: [new ObjectId(userId)] } },
        ],
      },
    ]
    const result = await GET_DB()
      .collection(BOARD_COLLECTION_NAME)
      .aggregate([
        { $match: { $and: queryConditions } },
        {
          $lookup: {
            from: columnModel.COLUMN_COLLECTION_NAME,
            localField: "_id",
            foreignField: "boardId",
            as: "columns",
          },
        },
        {
          $lookup: {
            from: cardModel.CARD_COLLECTION_NAME,
            localField: "_id",
            foreignField: "boardId",
            as: "cards",
          },
        },
        {
          $lookup: {
            from: userModel.USER_COLLECTION_NAME,
            localField: "ownerIds",
            foreignField: "_id",
            // định nghĩa tên trường trả về cho FE
            as: "owners",
            // pipeline trong lookup là để xử lý 1 hoặc nhiều luồng cần thiết
            // $project để chỉ vài field ko muốn lấy về bằng cách gán nó giá trị 0
            pipeline: [{ $project: { password: 0, verifyToken: 0 } }],
          },
        },
        {
          $lookup: {
            from: userModel.USER_COLLECTION_NAME,
            localField: "memberIds",
            foreignField: "_id",
            as: "members",
            pipeline: [{ $project: { password: 0, verifyToken: 0 } }],
          },
        },
      ])
      .toArray()
    return result[0] || null
  } catch (error) {
    throw new Error(error)
  }
}

const pushColumnOrderIds = async (column) => {
  try {
    const result = await GET_DB()
      .collection(BOARD_COLLECTION_NAME)
      .findOneAndUpdate(
        { _id: new ObjectId(column.boardId) },
        { $push: { columnOrderIds: new ObjectId(column._id) } },
        { returnDocument: "after" },
      )

    return result
  } catch (error) {
    throw new Error(error)
  }
}

const pushUserIdIntoMembers = async (boardId, userId) => {
  try {
    const result = await GET_DB()
      .collection(BOARD_COLLECTION_NAME)
      .findOneAndUpdate(
        { _id: new ObjectId(boardId) },
        { $push: { memberIds: new ObjectId(userId) } },
        { returnDocument: "after" },
      )

    return result
  } catch (error) {
    throw new Error(error)
  }
}
const pullColumnOrderIds = async (column) => {
  try {
    const result = await GET_DB()
      .collection(BOARD_COLLECTION_NAME)
      .findOneAndUpdate(
        { _id: new ObjectId(column.boardId) },
        { $pull: { columnOrderIds: new ObjectId(column._id) } },
        { returnDocument: "after" },
      )

    return result
  } catch (error) {
    throw new Error(error)
  }
}

const getBoards = async (userId, page, itemsPerPage) => {
  try {
    const queryConditions = [
      // Điều kiện 1: board chưa bị xóa
      {
        _destroy: false,
      },
      // điều kiện 2: userId đang thực hiện request phải thuộc 1 trong 2 mảng ownerIds hoặc memberIds của "Boards", sử dụng toán tử $all của mongodb
      {
        $or: [
          { ownerIds: { $all: [new ObjectId(userId)] } },
          { memberIds: { $all: [new ObjectId(userId)] } },
        ],
      },
    ]
    const query = await GET_DB()
      .collection(BOARD_COLLECTION_NAME)
      .aggregate(
        [
          { $match: { $and: queryConditions } },
          // $sort title của board theo a-z(mặc định chữ B sẽ đứng trước a thường theo chuẩn bảng mã ASCII)
          { $sort: { title: 1 } },
          // $facet để xử lý nhiều luồng trong 1 query
          {
            $facet: {
              // luồng 1: query boards
              queryBoards: [
                {
                  $skip: pagingSkipValue(page, itemsPerPage),
                },
                { $limit: itemsPerPage },
              ],
              // luồng 2: query đếm tổng tất cả số lượng bản ghi boards trong DB và trả về vào biến countedAllBoards
              queryTotalBoards: [{ $count: "countedAllBoards" }],
            },
          },
        ],
        // Khai báo thêm thuộc tính collation locale 'en' để fix chữ B hoa đứng trước a thường ở trên
        {
          collation: { locale: "en" },
        },
      )
      .toArray()

    return {
      boards: query[0]?.queryBoards || [],
      totalBoards: query[0]?.queryTotalBoards[0]?.countedAllBoards || 0,
    }
  } catch (error) {
    throw new Error(error)
  }
}

export const boardModel = {
  BOARD_COLLECTION_NAME,
  BOARD_COLLECTION_SCHEMA,
  createNew,
  findOneById,
  getDetails,
  pushColumnOrderIds,
  pushUserIdIntoMembers,
  update,
  pullColumnOrderIds,
  getBoards,
}
