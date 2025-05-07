import { useState, useEffect } from 'react'
import { speak } from '../services/speechSynthesis'
import { fetchHeadlines, fetchNews } from '../services/api'
import './News.css'

export default function News() {
  const [news, setNews] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('tin-moi-nhat')
  const [selectedArticle, setSelectedArticle] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isArticleLoading, setIsArticleLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const categories = [
    { id: 'tin-moi-nhat', name: 'Tin mới nhất' },
    { id: 'the-gioi', name: 'Thế giới' },
    { id: 'thoi-su', name: 'Thời sự' },
    { id: 'the-thao', name: 'Thể thao' },
    { id: 'cong-nghe', name: 'Công nghệ' },
    { id: 'giai-tri', name: 'Giải trí' },
    { id: 'oto-xe-may', name: 'Xe' }
  ]

  useEffect(() => {
    loadNews(selectedCategory)
  }, [selectedCategory])

  const getCategoryName = (categoryId) => {
    const category = categories.find(cat => cat.id === categoryId)
    return category ? category.name : ''
  }

  const loadNews = async (category) => {
    setIsLoading(true)
    setCurrentPage(1)
    speak(`Đang tải tin tức về ${getCategoryName(category)}...`)

    try {
      const newsData = await fetchHeadlines(category)
      setNews(newsData)
      let newsList = `Đã tải xong ${newsData.length} tin tức. `
      newsData.slice(0, itemsPerPage).forEach((item, idx) => {
        newsList += `Tin ${idx + 1}: ${item.title}. `
      })
      speak(newsList)
    } catch (error) {
      speak('Có lỗi xảy ra khi tải tin tức.')
      console.error('News error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCategoryChange = (category) => {
    setSelectedCategory(category)
    setSelectedArticle(null)
  }

  const handleArticleSelect = async (article) => {
    setSelectedArticle(article)
    setIsArticleLoading(true)

    try {
      const fetchedArticle = await fetchNews(article)
      if (fetchedArticle) {
        setSelectedArticle(fetchedArticle)
      } else {
        setSelectedArticle({ ...article, content: "Có lỗi xảy ra khi tải tin tức" })
      }
    } catch (error) {
      speak('Có lỗi xảy ra khi tải tin tức.')
      console.error('News error:', error)
    } finally {
      setIsArticleLoading(false)
    }

    speak(`Đã chọn bài viết: ${article.title}. Nhấn nút đọc để nghe nội dung.`)
  }

  const readArticle = () => {
    if (selectedArticle) {
      const tempDiv = document.createElement('div')
      tempDiv.innerHTML = selectedArticle.content
      const content = tempDiv.textContent
      speak(`${selectedArticle.title}. ${content}`)
    } else {
      speak('Vui lòng chọn một bài viết trước.')
    }
  }

  // Phân trang
  const totalPages = Math.ceil(news.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedNews = news.slice(startIndex, endIndex)

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1)
      const nextPageNews = news.slice((currentPage) * itemsPerPage, (currentPage + 1) * itemsPerPage)
      let newsList = `Chuyển sang trang ${currentPage + 1}. `
      nextPageNews.forEach((item, idx) => {
        newsList += `Tin ${idx + 1}: ${item.title}. `
      })
      speak(newsList)
    }
  }

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1)
      let newsList = `Quay lại trang ${currentPage - 1}`
      const prevPageNews = news.slice((currentPage - 2) * itemsPerPage, (currentPage - 1) * itemsPerPage)
      prevPageNews.forEach((item, idx) => {
        newsList += `Tin ${idx + 1}: ${item.title}. `
      })
      speak(newsList)

    }
  }

  return (
    <div className="news-page">
      <h2>Tin tức</h2>
      
      <div className="category-selector">
        <h3>Danh mục:</h3>
        <div className="category-buttons">
          {categories.map(category => (
            <button
              key={category.id}
              className={selectedCategory === category.id ? 'active' : ''}
              onClick={() => handleCategoryChange(category.id)}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      <div className="news-content">
        {isLoading ? (
          <p>Đang tải tin tức...</p>
        ) : (
          <>
            <div className="news-list">
              <h3>Tin tức:</h3>
              <ul>
                {paginatedNews.map((item, index) => (
                  <li key={index}>
                    <button
                      onClick={() => handleArticleSelect(item)}
                      className={selectedArticle === item ? 'selected' : ''}
                    >
                      {item.title}
                    </button>
                  </li>
                ))}
              </ul>

              {news.length > itemsPerPage && (
                <div className="pagination-controls">
                  <button onClick={handlePrevPage} disabled={currentPage === 1}>
                    Trang trước
                  </button>
                  <span>Trang {currentPage} / {totalPages}</span>
                  <button onClick={handleNextPage} disabled={currentPage === totalPages}>
                    Trang sau
                  </button>
                </div>
              )}
            </div>

            <div className="article-view">
              {selectedArticle && (
                <>
                  <h3>{selectedArticle.title}</h3>
                  {isArticleLoading ? (
                    <p>Đang tải tin tức...</p>
                  ) : (
                    <div dangerouslySetInnerHTML={{ __html: selectedArticle.content }}></div>
                  )}
                  <button className="readBtn" onClick={readArticle}>Đọc bài viết</button>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
