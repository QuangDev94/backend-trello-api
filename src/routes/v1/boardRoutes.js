import express from "express"
import { StatusCodes } from "http-status-codes"
import { boardValidation } from "~/validations/boardValidation"
import { boardController } from "~/controllers/boardController"
import { authMiddleware } from "~/middlewares/authMiddleware"

const Router = express.Router()

Router.use(authMiddleware.isAuthorized)

Router.route("/")
  .get(boardController.getBoards)
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
