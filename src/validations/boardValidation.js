/**
 * Updated by trungquandev.com's author on August 17 2023
 * YouTube: https://youtube.com/@trungquandev
 * "A bit of fragrance clings to the hand that gives flowers!"
 */
import Joi from "joi"
import { StatusCodes } from "http-status-codes"
import ApiError from "~/utils/ApiError"
import { BOARD_TYPES } from "~/utils/constants"
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from "~/utils/validators"
import { ObjectId } from "mongodb"

const createNew = async (req, res, next) => {
  const correctCondition = Joi.object({
    title: Joi.string().required().min(3).max(50).trim().strict().messages({
      "any.required": "Title is required",
      "string.empty": "Title is not allowed to be empty",
      "any.min": "Title length must be at least 3 characters long",
      "any.max": "Title length must be less than or equal 50 characters long",
      "any.trim": "Title must not have leading or trailing whitespace",
    }),
    description: Joi.string().required().min(3).max(256).trim().strict(),
    type: Joi.string()
      .valid(BOARD_TYPES.PUBLIC, BOARD_TYPES.PRIVATE)
      .required(),
  })
  try {
    // abortEarly: check all fields invalid
    await correctCondition.validateAsync(req.body, { abortEarly: false })
    // Validation xong sẽ nhảy sang controller
    next()
  } catch (error) {
    const errorMessage = new Error(error).message
    const customError = new ApiError(
      StatusCodes.UNPROCESSABLE_ENTITY,
      errorMessage,
    )
    next(customError)
  }
}

const updateColumnIdsInBoard = async (req, res, next) => {
  // Đối với update ko cần required
  const correctCondition = Joi.object({
    title: Joi.string().min(3).max(50).trim().strict(),
    description: Joi.string().min(3).max(256).trim().strict(),
    type: Joi.string().valid(BOARD_TYPES.PUBLIC, BOARD_TYPES.PRIVATE),
    columnOrderIds: Joi.array().items(
      Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
    ),
  })
  try {
    await correctCondition.validateAsync(req.body, {
      abortEarly: false,
      // đối với trường hợp update có thể đẩy 1 số field chưa định nghĩa ở điều kiện trên (correctCondition) ex: ta đang đẩy trường chưa được định nghĩa columnOrderIds lên
      allowUnknown: true,
    })
    next()
  } catch (error) {
    const errorMessage = new Error(error).message
    const customError = new ApiError(
      StatusCodes.UNPROCESSABLE_ENTITY,
      errorMessage,
    )
    next(customError)
  }
}
export const boardValidation = { createNew, updateColumnIdsInBoard }
