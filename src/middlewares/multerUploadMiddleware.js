import multer from "multer"
import { StatusCodes } from "http-status-codes"
import ApiError from "~/utils/ApiError"
import {
  ALLOW_COMMON_FILE_TYPES,
  LIMIT_COMMON_FILE_SIZE,
} from "~/utils/validators"

// Function kiểm tra loại file nào được chấp nhận
const customFileFilter = (req, file, callback) => {
  // Đối với thằng multer, kiểm tra kiểu file thì sử dụng mimeType
  if (!ALLOW_COMMON_FILE_TYPES.includes(file.mimetype)) {
    const errMessage = "File type is invalid. Only accept jpg, jpeg and png"
    return callback(
      new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, errMessage),
      null,
    )
  }
  // Nếu kiểu file hợp lệ :
  return callback(null, true)
}

// Khởi tạo function upload được bọc bởi multer
const upload = multer({
  limits: { fileSize: LIMIT_COMMON_FILE_SIZE },
  fileFilter: customFileFilter,
})

export const multerUploadMiddleware = { upload }
