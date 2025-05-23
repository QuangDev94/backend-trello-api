import Joi from "joi"
import { ObjectId } from "mongodb"
import { GET_DB } from "~/config/mongodb"
import { CARD_MEMBER_ACTIONS } from "~/utils/constants"
import {
  EMAIL_RULE,
  EMAIL_RULE_MESSAGE,
  OBJECT_ID_RULE,
  OBJECT_ID_RULE_MESSAGE,
} from "~/utils/validators"

// Define Collection (name & schema)
const CARD_COLLECTION_NAME = "cards"
const CARD_COLLECTION_SCHEMA = Joi.object({
  boardId: Joi.string()
    .required()
    .pattern(OBJECT_ID_RULE)
    .message(OBJECT_ID_RULE_MESSAGE),
  columnId: Joi.string()
    .required()
    .pattern(OBJECT_ID_RULE)
    .message(OBJECT_ID_RULE_MESSAGE),

  title: Joi.string().required().min(3).max(50).trim().strict(),
  description: Joi.string().optional(),

  cover: Joi.string().default(null),
  memberIds: Joi.array()
    .items(Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE))
    .default([]),
  // Dữ liệu comments của Card chúng ta sẽ học cách nhúng - embedded vào bản ghi card luôn như dưới đây:
  comments: Joi.array().items({
    userId: Joi.string()
      .pattern(OBJECT_ID_RULE)
      .message(OBJECT_ID_RULE_MESSAGE),
    userEmail: Joi.string().pattern(EMAIL_RULE).message(EMAIL_RULE_MESSAGE),
    userAvatar: Joi.string(),
    userDisplayName: Joi.string(),
    content: Joi.string(),
    commentedAt: Joi.date().timestamp(),
  }),
  createdAt: Joi.date().timestamp("javascript").default(Date.now),
  updatedAt: Joi.date().timestamp("javascript").default(null),
  _destroy: Joi.boolean().default(false),
})
const INVALID_UPDATE_FIELD = ["_id", "createdAt", "boardId"]
const validateBeforeCreate = async (data) => {
  return await CARD_COLLECTION_SCHEMA.validateAsync(data, { abortEarly: false })
}
const createNew = async (data) => {
  try {
    const validData = await validateBeforeCreate(data)
    const exactValidData = {
      ...validData,
      boardId: new ObjectId(validData.boardId),
      columnId: new ObjectId(validData.columnId),
    }
    const createCard = await GET_DB()
      .collection(CARD_COLLECTION_NAME)
      .insertOne(exactValidData)

    return createCard
  } catch (error) {
    throw new Error(error)
  }
}

const findOneById = async (id) => {
  try {
    const result = await GET_DB()
      .collection(CARD_COLLECTION_NAME)
      .findOne({
        _id: new ObjectId(id),
      })

    return result
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

  if (updateData.columnId)
    updateData.columnId = new ObjectId(updateData.columnId)
  try {
    const result = await GET_DB()
      .collection(CARD_COLLECTION_NAME)
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

const deleteManyByColumnId = async (columnId) => {
  try {
    const result = await GET_DB()
      .collection(CARD_COLLECTION_NAME)
      .deleteMany({
        columnId: new ObjectId(columnId),
      })
    return result
  } catch (error) {
    throw new Error(error)
  }
}

/**
 * Đẩy 1 comment vào đầu mảng comments
 * - trong Js thì unshift là thêm phần tử vào đầu mảng (push là thêm vào cuối mảng)
 * - trong mongoDb hiện tại chỉ có $push - mặc định đẩy phần tử vào cuối
 * Vẫn dùng $push, nhưng bọc data vào Array để trong $each và chỉ định $position: 0
 */
const unshiftNewComment = async (cardId, commentData) => {
  try {
    const result = await GET_DB()
      .collection(CARD_COLLECTION_NAME)
      .findOneAndUpdate(
        {
          _id: new ObjectId(cardId),
        },
        {
          $push: { comments: { $each: [commentData], $position: 0 } },
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

const updateMembers = async (cardId, incomingMemberInfo) => {
  try {
    let updateCondition = {}
    if (incomingMemberInfo.action === CARD_MEMBER_ACTIONS.ADD) {
      updateCondition = {
        $push: { memberIds: new ObjectId(incomingMemberInfo.userId) },
      }
    }
    if (incomingMemberInfo.action === CARD_MEMBER_ACTIONS.REMOVE) {
      updateCondition = {
        $pull: { memberIds: new ObjectId(incomingMemberInfo.userId) },
      }
    }

    const result = await GET_DB()
      .collection(CARD_COLLECTION_NAME)
      .findOneAndUpdate({ _id: new ObjectId(cardId) }, updateCondition, {
        returnDocument: "after",
      })

    return result
  } catch (error) {
    throw new Error(error)
  }
}
export const cardModel = {
  CARD_COLLECTION_NAME,
  CARD_COLLECTION_SCHEMA,
  createNew,
  findOneById,
  update,
  deleteManyByColumnId,
  unshiftNewComment,
  updateMembers,
}
