/* eslint-disable no-console */
/**
 * Updated by trungquandev.com's author on August 17 2023
 * YouTube: https://youtube.com/@trungquandev
 * "A bit of fragrance clings to the hand that gives flowers!"
 */

import { MongoClient, ServerApiVersion } from "mongodb"
import { env } from "./environment"

// Khởi tạo 1 đối tượng trelloDatabaseInstance là null (vì chưa kết nối)
let trelloDatabaseInstance = null
// Khởi tạo 1 đối tượng mongodbClientInstance để kết nối với MongoDB
const mongodbClientInstance = new MongoClient(env.MONGODB_URI, {
  // serverApi có từ phiên bản MongoDB 5.0.0 trở lên, có thể k cần dùng, ý nghĩa của nó là chỉ định 1 Stable API version của MongoDB
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
})
export const CONNECT_DB = async () => {
  await mongodbClientInstance.connect()

  // Nếu kết nối thành công thì gán database của mongodb vào trelloDatabaseInstance
  trelloDatabaseInstance = mongodbClientInstance.db(env.DATABASE_NAME)
}

// FC này có nhiệm vụ export trelloDatabaseInstance sau khi đã connect thành công để chúng ta sử dụng ở nhiều nơi
export const GET_DB = () => {
  if (!trelloDatabaseInstance)
    throw new Error("Have to connect to Database first!")
  return trelloDatabaseInstance
}

export const CLOSE_DB = async () => {
  console.log("Start Close")
  await mongodbClientInstance.close()
  console.log("Close Done")
}
