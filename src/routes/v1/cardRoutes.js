import express from "express"
import { cardController } from "~/controllers/cardController"
import { authMiddleware } from "~/middlewares/authMiddleware"
import { multerUploadMiddleware } from "~/middlewares/multerUploadMiddleware"
import { cardValidation } from "~/validations/cardValidation"

const Router = express.Router()

Router.use(authMiddleware.isAuthorized)

Router.route("/").post(cardValidation.createNew, cardController.createNew)
Router.route("/:id").put(
  multerUploadMiddleware.upload.single("cardCover"),
  cardValidation.update,
  cardController.update,
)

export const cardRoutes = Router
