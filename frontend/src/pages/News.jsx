import { useState, useEffect } from 'react'
import { speak } from '../services/speechSynthesis'
import { fetchNews } from '../services/api'

export default function News() {
  const [news, setNews] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('general')
  const [selectedArticle, setSelectedArticle] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  const categories = [
    { id: 'general', name: 'Tin tổng hợp' },
    { id: 'technology', name: 'Công nghệ' },
    { id: 'sports', name: 'Thể thao' },
    { id: 'health', name: 'Sức khỏe' }
  ]

  useEffect(() => {
    speak('Trang tin tức. Bạn có thể chọn danh mục tin tức bạn quan tâm.')
    loadNews(selectedCategory)
  }, [])

  const loadNews = async (category) => {
    setIsLoading(true)
    speak(`Đang tải tin tức về ${getCategoryName(category)}...`)

    try {
      const newsData = await fetchNews(category)
      setNews(newsData)
      speak(`Đã tải xong ${newsData.length} tin tức.`)
    } catch (error) {
      speak('Có lỗi xảy ra khi tải tin tức.')
      console.error('News error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getCategoryName = (categoryId) => {
    const category = categories.find(cat => cat.id === categoryId)
    return category ? category.name : ''
  }

  const handleCategoryChange = (category) => {
    setSelectedCategory(category)
    setSelectedArticle(null)
    loadNews(category)
  }

  const handleArticleSelect = (article) => {
    setSelectedArticle(article)
    speak(`Đã chọn bài viết: ${article.title}. Nhấn nút đọc để nghe nội dung.`)
  }

  const readArticle = () => {
    if (selectedArticle) {
      speak(`${selectedArticle.title}. ${selectedArticle.content}`)
    } else {
      speak('Vui lòng chọn một bài viết trước.')
    }
  }

  return (
    <div className="news-page">
      <h2>Tin tức</h2>
      
      <div className="category-selector">
        <h3>Chọn danh mục:</h3>
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
              <h3>Danh sách tin tức:</h3>
              <ul>
                {news.map((item, index) => (
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
            </div>

            <div className="article-view">
              {selectedArticle && (
                <>
                  <h3>{selectedArticle.title}</h3>
                  <p>{selectedArticle.content}</p>
                  <button onClick={readArticle}>Đọc bài viết</button>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}