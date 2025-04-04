// Định nghĩa riêng 1 Class ApiError kế thừa từ class Error trong Nodejs

class ApiError extends Error {
  // Gọi hàm khởi tạo constructor của class Error (class cha) để dùng được this (kiến thức OOP)
  constructor(statusCode, message) {
    // Vì Class cha Error có property message rồi nên gọi nó luôn trong supper cho gọn
    super(message)
    // Custom property name mới, nếu ko set thì mặc định n sẽ kế thừa là Error
    this.name = "ApiError"
    // Tạo 1 property mới là statusCode
    this.statusCode = statusCode
    // Ghi lại Stack Trace (dấu vết ngăn xếp) để thuận tiện cho Debug
    Error.captureStackTrace(this, this.constructor)
  }
}

export default ApiError
