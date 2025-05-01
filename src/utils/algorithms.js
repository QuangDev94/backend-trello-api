// Tính toán giá trị skip phục vụ các tác vụ phân trang
export const pagingSkipValue = (page, itemsPerPage) => {
  // luôn đảm bảo nếu giá trị ko hợp lệ thì return về 0
  if (!page || !itemsPerPage) return 0
  if (page <= 0 || itemsPerPage <= 0) return 0
  /**
   * Giải thích công thức đơn giản
   * case 1: user đứng ở page 1 (page = 1) thì sẽ lấy 1-1*12 = 0, lúc này giá trị skip = 0, nghĩa là 0 skip bản ghi
   * case 2: user đứng ở page 2 (page = 2) thì sẽ lấy 2-1*12 = 12, lúc này giá trị skip = 12, nghĩa là skip 12 bản ghi của page 1 trước đó
   * ... tương tự
   */
  return (page - 1) * itemsPerPage
}
