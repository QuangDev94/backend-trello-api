/* eslint-disable no-console */
// Code always run this file first (see Event loop)
import express from "express"
import cors from "cors"
import { corsOptions } from "./config/cors"
import AsyncExitHook from "async-exit-hook"
import { CONNECT_DB, CLOSE_DB } from "~/config/mongodb"
import { env } from "./config/environment"
import { APIs_V1 } from "~/routes/v1"
import { errorHandlingMiddleware } from "./middlewares/errorHandlingMiddleware"

const START_SERVER = () => {
  const app = express()
  app.use(cors(corsOptions))
  // enable req.body json data
  app.use(express.json())
  // Use APIs v1
  app.use("/v1", APIs_V1)
  // Middleware xử lý lỗi
  app.use(errorHandlingMiddleware)
  // Run on production enviroment (render.com)
  if (env.BUILD_MODE === "prod") {
    app.listen(process.env.PORT, () => {
      console.log(
        `Hello ${env.AUTHOR}, Back-end server is running successfully at Port: ${process.env.PORT}`,
      )
    })
  } else {
    // Run on local
    app.listen(env.LOCAL_DEV_APP_PORT, env.APP_HOST, () => {
      console.log(
        `Hello ${env.AUTHOR}, I am running at http://${env.LOCAL_DEV_APP_HOST}:${env.LOCAL_DEV_APP_PORT}/`,
      )
    })
  }
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
