import express from "express"

const app = express()

const port = 24794

const hostname = "localhost"

app.listen(port, hostname, () => {
  console.log(
    `Hello QuangNguyenDev ,I'm running the server at http://${hostname}:${port}/`,
  )
})

app.get("/", (req, res) => {
  res.send("<h1>Hello World Nodejs QuangNguyenDev</h1>")
})
