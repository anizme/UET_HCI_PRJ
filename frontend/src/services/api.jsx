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
  // In a real app, this would call your backend API
  // For now, we'll mock some data
  return new Promise((resolve) => {
    setTimeout(async () => {
      const response = await fetch(`${API_BASE_URL}/fetch-news/${category}`, {
        method: "GET",
        headers: {
          'Content-Type': 'application/json',
        },
      })
      const newsList = (await response.json())["news"]
      console.log(newsList)
      resolve(newsList || [])
    }, 1000)
  })
}

export const fetchNews = async (news) => {
  return new Promise((resolve) => {
    setTimeout(async () => {
      const response = await fetch(`${API_BASE_URL}/fetch-news/`, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          "news": news
        }),
      })
      const newsContent = await response.json()
      resolve(newsContent || null)
    }, 1000)
  })
}