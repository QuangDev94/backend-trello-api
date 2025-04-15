import { StatusCodes } from "http-status-codes"
import { columnService } from "~/services/columnService"

const createNew = async (req, res, next) => {
  try {
    const createdColumn = await columnService.createNew(req.body)
    res.status(StatusCodes.CREATED).json(createdColumn)
  } catch (error) {
    next(error)
  }
}

const update = async (req, res, next) => {
  try {
    const updatedColumn = await columnService.update(req.params.id, req.body)
    res.status(StatusCodes.CREATED).json(updatedColumn)
  } catch (error) {
    next(error)
  }
}

const deleteColumn = async (req, res, next) => {
  try {
    const result = await columnService.deleteColumn(req.params.id)
    res.status(StatusCodes.CREATED).json(result)
  } catch (error) {
    next(error)
  }
}
export const columnController = { createNew, update, deleteColumn }
