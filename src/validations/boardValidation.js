/**
 * Updated by trungquandev.com's author on August 17 2023
 * YouTube: https://youtube.com/@trungquandev
 * "A bit of fragrance clings to the hand that gives flowers!"
 */
import Joi from "joi"
import { StatusCodes } from "http-status-codes"

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
  })
  try {
    console.log("req.body: ", req.body)
    // abortEarly: check all fields invalid
    await correctCondition.validateAsync(req.body, { abortEarly: false })
    //     next()
    res.status(StatusCodes.CREATED).json({
      message: "NOTE: API create new board",
    })
  } catch (error) {
    console.log("error:", error)
    res
      .status(StatusCodes.UNPROCESSABLE_ENTITY)
      .json({ errors: new Error(error).message })
  }
}
export const boardValidation = { createNew }
