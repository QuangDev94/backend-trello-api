import JWT from "jsonwebtoken"

// FC tạo mới token cần 3 tham số đầu vào
// userInfor: Những thông tin muốn đính kèm vào token
// secretSignature: Chữ kí bí mật (dạng 1 chuỗi string ngẫu nhiên) trên doc là privateKey
// tokenLife: thời gian sống của token
const generateToken = async (userInfor, secretSignature, tokenLife) => {
  try {
    return JWT.sign(userInfor, secretSignature, {
      algorithm: "HS256",
      expiresIn: tokenLife,
    })
  } catch (error) {
    throw new Error(error)
  }
}

// FC kiểm tra 1 token có hợp lệ ko
// Token được tạo ra có đúng với chữ kí bí mật secretSignature trong dự án ko
const verifyToken = async (token, secretSignature) => {
  try {
    return JWT.verify(token,secretSignature)
  } catch (error) {
    throw new Error(error)
  }
}

export const JwtProvider = {
  generateToken,
  verifyToken,
}
