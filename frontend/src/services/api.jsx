const API_BASE_URL = '/api'

const fetchWithCertificate = async (url, options) => {
  try {
    const response = await fetch(url, {
      ...options,
      // In development, we need to accept self-signed certificates
      mode: 'cors',
      credentials: 'omit'
    })
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    return response
  } catch (error) {
    console.error('API request failed:', error)
    throw error
  }
}

export const performOCR = async (imageData) => {
  const response = await fetchWithCertificate(`${API_BASE_URL}/ocr`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ image: imageData.split(',')[1] }) // Remove data URL prefix
  })
  return response.json()
}

export const performObjectRecognition = async (imageData) => {
  const response = await fetchWithCertificate(`${API_BASE_URL}/object-recognition`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ image: imageData.split(',')[1] }) // Remove data URL prefix
  })
  return response.json()
}

export const fetchNews = async (category) => {
  // In a real app, this would call your backend API
  // For now, we'll mock some data
  return new Promise((resolve) => {
    setTimeout(() => {
      const mockNews = {
        general: [
          {
            title: 'Tin tổng hợp 1',
            content: 'Nội dung tin tổng hợp số 1. Đây là nội dung mẫu cho tin tức tổng hợp.'
          },
          {
            title: 'Tin tổng hợp 2',
            content: 'Nội dung tin tổng hợp số 2. Đây là nội dung mẫu cho tin tức tổng hợp.'
          }
        ],
        technology: [
          {
            title: 'Công nghệ mới',
            content: 'Một công nghệ mới vừa được phát minh có thể thay đổi thế giới.'
          }
        ],
        sports: [
          {
            title: 'Kết quả bóng đá',
            content: 'Đội tuyển Việt Nam giành chiến thắng trong trận đấu vừa qua.'
          }
        ],
        health: [
          {
            title: 'Sức khỏe cộng đồng',
            content: 'Các chuyên gia khuyến cáo về việc giữ gìn sức khỏe trong mùa dịch.'
          }
        ]
      }
      resolve(mockNews[category] || [])
    }, 1000)
  })
}