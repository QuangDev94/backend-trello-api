import { cardModel } from "~/models/cardModel"
import { columnModel } from "~/models/columnModel"
import { CloudinaryProvider } from "~/providers/CloudinaryProvider"

/* eslint-disable no-useless-catch */
const createNew = async (reqBody) => {
  try {
    const createdCard = await cardModel.createNew(reqBody)
    const getNewCard = await cardModel.findOneById(createdCard.insertedId)
    if (getNewCard) {
      await columnModel.pushCardOrderIds(getNewCard)
    }
    return getNewCard
  } catch (error) {
    throw error
  }
}

const update = async (cardId, reqBody, cardCoverFile, userInfo) => {
  try {
    const updateData = {
      ...reqBody,
      updateAt: Date.now(),
    }

    let updatedCard = {}

    if (cardCoverFile) {
      const uploadResult = await CloudinaryProvider.streamUpload(
        cardCoverFile.buffer,
        "card-covers",
      )
      updatedCard = await cardModel.update(cardId, {
        cover: uploadResult.secure_url,
      })
    } else if (updateData.commentToAdd) {
      // Tạo dữ liệu comment để thêm vào database, cần bổ sung thêm những field cần thiết
      const commentData = {
        ...updateData.commentToAdd,
        commentedAt: Date.now(),
        userId: userInfo._id,
        userEmail: userInfo.email,
      }
      updatedCard = await cardModel.unshiftNewComment(cardId, commentData)
    } else {
      // case update common: title,description
      updatedCard = await cardModel.update(cardId, updateData)
    }

    return updatedCard
  } catch (error) {
    throw error
  }
}
export const cardService = { createNew, update }
