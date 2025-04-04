/* eslint-disable no-console */
/**
 * Updated by trungquandev.com's author on August 17 2023
 * YouTube: https://youtube.com/@trungquandev
 * "A bit of fragrance clings to the hand that gives flowers!"
 */

// Code always run this file first (see Event loop)
import express from "express"
import AsyncExitHook from "async-exit-hook"
import { CONNECT_DB, CLOSE_DB } from "~/config/mongodb"
import { env } from "./config/environment"
import { APIs_V1 } from "~/routes/v1"
const START_SERVER = () => {
  const app = express()

  app.use("/v1", APIs_V1)

  app.listen(env.APP_PORT, env.APP_HOST, () => {
    console.log(
      `Hello ${env.AUTHOR}, I am running at http://${env.APP_HOST}:${env.APP_PORT}/`,
    )
  })
  AsyncExitHook(() => {
    console.log("disconnecting DB")
    CLOSE_DB()
    console.log("disconnected DB")
  })
}
// Kết nối tới database thành công thì mới start server back-end lên
// Immediately-invoked / Anonymous Async Functions (IIFE)
;(async () => {
  // chỉ cần 1 dòng code trong try bị lỗi sẽ nhảy ngay sang catch và bỏ qua các dòng code dưỡi dòng code lỗi
  try {
    console.log("Connecting to MongoDB clound atlas ...")
    await CONNECT_DB()
    console.log("Connected to MongoDB Clound Atlas")
    START_SERVER()
  } catch (error) {
    console.log("failed")
    console.error(error)
    // Thoát khỏi nodeJs
    process.exit(0)
  }
})()

// CONNECT_DB()
//   .then(() => console.log("Connected to MongoDB Clound Atlas"))
//   .then(() => START_SERVER())
//   .catch((error) => {
//     console.error(error)
//     // Thoát khỏi nodeJs
//     process.exit(0)
//   })
