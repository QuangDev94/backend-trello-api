import { StatusCodes } from "http-status-codes"
import Joi from "joi"
import ApiError from "~/utils/ApiError"
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from "~/utils/validators"

const createNew = async (req, res, next) => {
  // Check the request is valid
  // generate a schema object that matches an object data type
  const correctCondition = Joi.object({
    title: Joi.string().required().min(3).max(50).trim().strict(),
    boardId: Joi.string()
      .required()
      .pattern(OBJECT_ID_RULE)
      .message(OBJECT_ID_RULE_MESSAGE),
  })

  try {
    await correctCondition.validateAsync(req.body, { abortEarly: true })
    next()
  } catch (error) {
    const messageError = new Error(error).message
    const customError = new ApiError(
      StatusCodes.UNPROCESSABLE_ENTITY,
      messageError,
    )
    next(customError)
  }
}

export const columnValidation = { createNew }
