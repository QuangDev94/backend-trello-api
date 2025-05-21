/* eslint-disable no-useless-catch */
import { StatusCodes } from "http-status-codes"
import { boardModel } from "~/models/boardModel"
import { invitationModel } from "~/models/invitationModel"
import { userModel } from "~/models/userModel"
import ApiError from "~/utils/ApiError"
import { BOARD_INVITATION_STATUS, INVITATION_TYPES } from "~/utils/constants"
import { pickUser } from "~/utils/formatters"

const createNewBoardInvitation = async (reqBody, inviterId) => {
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

const getInvitations = async (userId) => {
  try {
    const getInvitations = await invitationModel.findByUser(userId)
    // Vì dữ liệu inviter, invitee, board đang là giá trị mảng 1 phần tử nên phải thay đổi thành jsonObject trước khi trả về cho FE
    const resInvitations = getInvitations.map((i) => {
      return {
        ...i,
        inviter: i.inviter[0] || {},
        invitee: i.invitee[0] || {},
        board: i.board[0] || {},
      }
    })
    return resInvitations
  } catch (error) {
    throw error
  }
}

const updateBoardInvitation = async (userId, invitationId, status) => {
  try {
    // find the invitation document by invitationId
    const getInvitation = await invitationModel.findOneById(invitationId)
    if (!getInvitation)
      throw new ApiError(StatusCodes.NOT_FOUND, "Invitation not found!")
    // find the board document after have the invitation
    const boardId = getInvitation.boardInvitation.boardId
    const getBoard = await boardModel.findOneById(boardId)
    if (!getBoard) throw new ApiError(StatusCodes.NOT_FOUND, "Board not found!")
    // Kiểm tra nếu status là ACCEPT mà userId thuộc owner hoặc member của board rồi thì trả về lỗi
    const boardOwnderAndMemberIds = [
      ...getBoard.memberIds,
      ...getBoard.ownerIds,
    ].toString()

    if (
      status === BOARD_INVITATION_STATUS.ACCEPTED &&
      boardOwnderAndMemberIds.includes(userId)
    ) {
      throw new ApiError(
        StatusCodes.NOT_ACCEPTABLE,
        "you are already a member of this board",
      )
    }
    // tạo dữ liệu để update bản ghi invitaion
    const updateData = {
      boardInvitation: {
        ...getInvitation.boardInvitation,
        status: status,
      },
    }
    // B1: Cập nhật status trong bản ghi invitation
    const updatedInvitation = await invitationModel.update(
      invitationId,
      updateData,
    )
    // B2: Nếu lời mời thành công thì thêm userId vào bản ghi memberIds trong collection board
    if (
      updatedInvitation.value.boardInvitation.status ===
      BOARD_INVITATION_STATUS.ACCEPTED
    ) {
      await boardModel.pushUserIdIntoMembers(boardId, userId)
    }

    return updatedInvitation.value
  } catch (error) {
    throw error
  }
}

export const invitationService = {
  createNewBoardInvitation,
  getInvitations,
  updateBoardInvitation,
}
