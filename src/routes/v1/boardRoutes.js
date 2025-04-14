import express from "express"
import { StatusCodes } from "http-status-codes"
import { boardValidation } from "~/validations/boardValidation"
import { boardController } from "~/controllers/boardController"

const Router = express.Router()

Router.route("/")
  .get((req, res) => {
    res.status(StatusCodes.OK).json({
      message: "NOTE: API get list boards",
    })
  })
  .post(boardValidation.createNew, boardController.createNew)

Router.route("/:id")
  .get(boardController.getDetails)
  .put(boardValidation.updateColumnIdsInBoard, boardController.update)

// API hỗ trợ việc di chuyển card giữa các column khác nhau trong 1 board
Router.route("/supports/moving_card").put(
  boardValidation.moveCardBetweenDifferentColumns,
  boardController.moveCardBetweenDifferentColumns,
)

export const boardRoutes = Router
