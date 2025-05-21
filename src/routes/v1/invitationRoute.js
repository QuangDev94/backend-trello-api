import express from "express"
import { invitationController } from "~/controllers/invitationController"
import { authMiddleware } from "~/middlewares/authMiddleware"
import { invitationValidation } from "~/validations/invitationValidation"

const Router = express.Router()

Router.use(authMiddleware.isAuthorized)

// Get invitations by user
Router.route("/").get(invitationController.getInvitations)

// Add the invitation board
Router.route("/board").post(
  invitationValidation.createNewBoardInvitation,
  invitationController.createNewBoardInvitation,
)

// Update the invitation board
Router.route("/board/:invitationId").put(
  invitationController.updateBoardInvitation,
)

export const invitationRoute = Router
