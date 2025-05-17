import { StatusCodes } from "http-status-codes"
import { boardModel } from "~/models/boardModel"
import { invitationModel } from "~/models/invitationModel"
import { userModel } from "~/models/userModel"
import ApiError from "~/utils/ApiError"
import { BOARD_INVITATION_STATUS, INVITATION_TYPES } from "~/utils/constants"
import { pickUser } from "~/utils/formatters"

const createNewBoardInvitation = async (reqBody, inviterId) => {
  // eslint-disable-next-line no-useless-catch
  try {
    const inviter = await userModel.findOneById(inviterId)
    const invitee = await userModel.findOneByEmail(reqBody.inviteeEmail)
    const board = await boardModel.findOneById(reqBody.boardId)

    // Nếu ko tồn tại 1 trong 3 biến trên cứ thẳng tay reject
    if (!inviter || !invitee || !board) {
      throw new ApiError(
        StatusCodes.NOT_FOUND,
        "Inviter, Invitee or Board not found",
      )
    }
    // Tạo data cần thiết để lưu vào trong DB
    const newInvidationData = {
      inviterId,
      inviteeId: invitee._id.toString(),
      type: INVITATION_TYPES.BOARD_INVITATION,
      boardInvitation: {
        boardId: board._id.toString(),
        status: BOARD_INVITATION_STATUS.PENDING,
      },
    }
    const createdInvitation = await invitationModel.createNewBoardInvitation(
      newInvidationData,
    )

    const getInvitation = await invitationModel.findOneById(
      createdInvitation.insertedId,
    )

    const resInvitation = {
      ...getInvitation,
      board,
      inviter: pickUser(inviter),
      invitee: pickUser(invitee),
    }

    return resInvitation
  } catch (error) {
    throw error
  }
}

export const invitationService = {
  createNewBoardInvitation,
}
