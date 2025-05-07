const API_BASE_URL = 'https://localhost:5173/api'

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

export const fetchHeadlines = async (category) => {
  try {
    const response = await fetch(`${API_BASE_URL}/fetch-news/${category}`, {
      method: "GET",
      headers: {
        'Content-Type': 'application/json',
      },
    })
    if (!response.ok) {
      throw new Error(`Failed to fetch headlines: ${response.statusText}`)
    }
    const newsList = (await response.json())["news"]
    return newsList || []
  } catch (error) {
    console.error('Error fetching headlines:', error)
    return { content: "Có lỗi xảy ra khi tải tin tức." }
  }
}

export const fetchNews = async (news) => {
  try {
    const response = await fetch(`${API_BASE_URL}/fetch-news/`, {
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        "news": news
      }),
    })
    if (!response.ok) {
      throw new Error(`Failed to fetch news content: ${response.statusText}`)
    }
    const newsContent = await response.json()
    return newsContent || null
  } catch (error) {
    console.error('Error fetching news content:', error)
    return { content: "Có lỗi xảy ra khi tải nội dung bài viết." }
  }
}