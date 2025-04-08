import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom' // Thêm dòng này
import './styles/index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter> {/* Bao bọc App bằng BrowserRouter */}
      <App />
    </BrowserRouter>
  </StrictMode>
)