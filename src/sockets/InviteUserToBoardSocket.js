export const inviteUserToBoardSocket = (socket) => {
  socket.on("FE_USER_INVITED_TO_BOARD", (invitation) => {
    // Emit ngược lại sự kiện này cho các client khác trừ thằng gửi/emit lên
    socket.broadcast.emit("BE_USER_INVITED_TO_BOARD", invitation)
  })
}
