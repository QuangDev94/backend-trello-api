import express from "express"
import { invitationController } from "~/controllers/invitationController"
import { authMiddleware } from "~/middlewares/authMiddleware"
import { invitationValidation } from "~/validations/invitationValidation"

const Router = express.Router()

Router.use(authMiddleware.isAuthorized)

// Get invitations by user
Router.route("/").get(invitationController.getInvitations)

Router.route("/board").post(
  invitationValidation.createNewBoardInvitation,
  invitationController.createNewBoardInvitation,
)

export const invitationRoute = Router
