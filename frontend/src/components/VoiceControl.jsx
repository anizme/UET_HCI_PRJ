import { useState, useEffect } from 'react'
import { startListening, stopListening } from '../services/voiceRecognition'
import { speak } from '../services/speechSynthesis'
import './VoiceControl.css'

export default function VoiceControl({ isListening, setIsListening, onNavigate }) {
  const [voiceCommand, setVoiceCommand] = useState('')

  // Helper function to try clicking a button using multiple selector strategies
  const clickButtonUsingMultipleSelectors = (selectors, buttonTextToFind) => {
    console.log(`Looking for button with text: ${buttonTextToFind}`)
    
    // First try direct selectors
    for (const selector of selectors) {
      try {
        const button = document.querySelector(selector);
        if (button) {
          console.log(`Found button using selector: ${selector}`)
          button.click();
          return true;
        }
      } catch (error) {
        console.log(`Error with selector ${selector}:`, error)
      }
    }
    
    // If direct selectors fail, try text content matching
    try {
      const allButtons = Array.from(document.querySelectorAll('button'));
      console.log(`Found ${allButtons.length} total buttons on page`)
      
      // Log all button texts for debugging
      allButtons.forEach((btn, i) => {
        console.log(`Button ${i}: "${btn.textContent.trim()}"`)
      });
      
      const buttonByText = allButtons.find(btn => 
        btn.textContent.toLowerCase().includes(buttonTextToFind.toLowerCase())
      );
      
      if (buttonByText) {
        console.log(`Found button by text content: "${buttonByText.textContent}"`)
        buttonByText.click();
        return true;
      }
    } catch (error) {
      console.log('Error finding button by text:', error)
    }
    
    console.log(`Failed to find button: ${buttonTextToFind}`)
    return false;
  }

  // Handle navigation commands
  const handleNavigationCommands = (normalizedCommand, currentPath) => {
    if (normalizedCommand.includes('trang chủ')) {
      onNavigate('home')
      return true
    } else if (normalizedCommand.includes('nhận diện văn bản') && !currentPath.includes('ocr')) {
      onNavigate('ocr')
      return true
    } else if (normalizedCommand.includes('nhận diện vật thể') && !currentPath.includes('object-recognition')) {
      onNavigate('object')
      return true
    } else if (normalizedCommand.includes('tin tức')) {
      onNavigate('news')
      return true
    } else if (normalizedCommand.includes('dừng') || normalizedCommand.includes('rừng') || normalizedCommand.includes('tạm dừng') || normalizedCommand.includes('tạm rrừng')) {
      setIsListening(false)
      return true
    }
    return false
  }

  // Handle accessibility commands
  const handleAccessibilityCommands = (normalizedCommand) => {
    if (normalizedCommand.includes('tăng chữ') || normalizedCommand.includes('tăng trữ')) {
      document.querySelector('.accessibility-tools button[aria-label="Tăng cỡ chữ"]')?.click()
      return true
    } else if (normalizedCommand.includes('giảm chữ') || normalizedCommand.includes('giảm trữ')) {
      document.querySelector('.accessibility-tools button[aria-label="Giảm cỡ chữ"]')?.click()
      return true
    } else if (normalizedCommand.includes('chế độ tương phản') || normalizedCommand.includes('tương phản cao')) {
      document.querySelector('.accessibility-tools button[aria-label*="Chế độ tương phản cao"]')?.click()
      return true
    } else if (normalizedCommand.includes('chế độ tối') || normalizedCommand.includes('ban đêm') || normalizedCommand.includes('chế độ sáng')) {
      document.querySelector('.accessibility-tools button[aria-label*="Chế độ tối"]')?.click()
      return true
    }
    return false
  }

  // Handle camera/upload mode commands
  const handleModeSwitchCommands = (normalizedCommand) => {
    if (normalizedCommand.includes('camera') || normalizedCommand.includes('máy ảnh')) {
      document.querySelector('.recognition-tabs button:nth-child(2)')?.click()
      return true
    } else if (normalizedCommand.includes('tải lên') || normalizedCommand.includes('upload')) {
      document.querySelector('.recognition-tabs button:nth-child(1)')?.click()
      return true
    }
    return false
  }

  // Handle object recognition page commands
  const handleObjectRecognitionCommands = (normalizedCommand, currentPath) => {
    if (!currentPath.includes('object-recognition')) return false
    
    if (normalizedCommand.includes('bật cam')||normalizedCommand.includes('bật camera')) {
      console.log('Attempting to start camera on object recognition page')
      return clickButtonUsingMultipleSelectors([
        '.camera-controls button.camera-button[aria-label="Bật camera"]',
        '.camera-controls button:contains("Bật camera")',
        '.camera-controls button'
      ], 'Bật camera')
    } 
    else if (normalizedCommand.includes('chụp ảnh')) {
      return clickButtonUsingMultipleSelectors([
        '.camera-controls button.camera-button[aria-label="Chụp ảnh"]',
        '.camera-controls button:contains("Chụp ảnh")',
      ], 'Chụp ảnh')
    } 
    else if (normalizedCommand.includes('bật nhận diện thời gian thực') || 
              normalizedCommand.includes('nhận diện thời gian thực') ) {
      console.log('Attempting to enable realtime mode')
      // First try to find inactive realtime button
      const buttons = Array.from(document.querySelectorAll('.camera-controls button'));
      console.log('Found buttons:', buttons.length)
      
      // Find the button for realtime toggle
      const realtimeButton = buttons.find(btn => 
        btn.textContent.includes('nhận diện thời gian thực') && 
        !btn.textContent.toLowerCase().includes('tắt')
      );
      
      if (realtimeButton) {
        console.log('Found realtime button:', realtimeButton.textContent)
        realtimeButton.click();
        return true
      } else {
        console.log('Could not find realtime button')
        return false
      }
    } 
    else if (normalizedCommand.includes('tắt nhận diện thời gian thực') || normalizedCommand.includes('tắt nhận diện')) {
      console.log('Attempting to disable realtime mode')
      const buttons = Array.from(document.querySelectorAll('.camera-controls button'));
      console.log('Found buttons:', buttons.length)
      
      // Find button based on multiple criteria
      // 1. Find active button related to realtime recognition
      const activeRealtimeButton = buttons.find(btn => 
        btn.classList.contains('active') && 
        btn.textContent.toLowerCase().includes('nhận diện thời gian thực')
      );
      
      if (activeRealtimeButton) {
        console.log('Found active realtime button:', activeRealtimeButton.textContent)
        activeRealtimeButton.click();
        return true;
      }
      
      // 2. Find button with aria-label
      const ariaLabelButton = buttons.find(btn => 
        btn.getAttribute('aria-label') === 'Tắt nhận diện thời gian thực'
      );
      
      if (ariaLabelButton) {
        console.log('Found button by aria-label:', ariaLabelButton.getAttribute('aria-label'))
        ariaLabelButton.click();
        return true;
      }
      
      // 3. Find button with text 
      const textButton = buttons.find(btn => 
        btn.textContent.includes('Tắt nhận diện thời gian thực')
      );
      
      if (textButton) {
        console.log('Found button by text content:', textButton.textContent)
        textButton.click();
        return true;
      }
      
      console.log('Could not find disable realtime button')
      return false
    } 
    else if (normalizedCommand.includes('tắt cam')||normalizedCommand.includes('tắt camera')) {
      console.log('Attempting to stop camera')
      return clickButtonUsingMultipleSelectors([
        '.camera-controls button.camera-button[aria-label="Tắt camera"]',
        '.camera-controls button:contains("Tắt camera")',
      ], 'Tắt camera')
    } 
    else if (normalizedCommand.includes('nhận diện vật thể') && !normalizedCommand.includes('trang')) {
      return clickButtonUsingMultipleSelectors([
        '.captured-preview button.process-button[aria-label="Nhận diện vật thể"]',
        '.captured-preview button:contains("Nhận diện vật thể")',
      ], 'Nhận diện vật thể')
    }
    
    return false
  }

  // Handle OCR page commands
  const handleOCRCommands = (normalizedCommand, currentPath) => {
    if (!currentPath.includes('ocr')) return false
    
    if (normalizedCommand.includes('bật cam')) {
      return clickButtonUsingMultipleSelectors([
        '.camera-controls button.camera-button[aria-label="Bật camera"]',
        '.camera-controls button:contains("Bật camera")',
        '.camera-controls button',
      ], 'Bật camera')
    } 
    else if (normalizedCommand.includes('chụp ảnh')) {
      return clickButtonUsingMultipleSelectors([
        '.camera-controls button.camera-button[aria-label="Chụp ảnh"]',
        '.camera-controls button:contains("Chụp ảnh")',
      ], 'Chụp ảnh')
    } 
    else if (normalizedCommand.includes('tắt cam')) {
      return clickButtonUsingMultipleSelectors([
        '.camera-controls button.camera-button[aria-label="Tắt camera"]',
        '.camera-controls button:contains("Tắt camera")',
      ], 'Tắt camera')
    } 
    else if (normalizedCommand.includes('nhận diện văn bản') && !normalizedCommand.includes('trang')) {
      return clickButtonUsingMultipleSelectors([
        '.captured-preview button.process-button[aria-label="Nhận diện văn bản"]',
        '.captured-preview button:contains("Nhận diện văn bản")',
      ], 'Nhận diện văn bản')
    }
    else if (normalizedCommand.includes('đọc kết quả')) {
      return clickButtonUsingMultipleSelectors([
        '.text-actions button.text-action-button[aria-label="Đọc kết quả"]',
        '.text-actions button:contains("Đọc kết quả")',
      ], 'Đọc kết quả')
    }
    
    return false
  }

  const handleNewsCommand = (normalizedCommand, currentPath) => {
    if (!currentPath.includes('news')) return false

    if (normalizedCommand.includes("chọn chủ đề ")) {
      const rawTopic = normalizedCommand.replace("chọn chủ đề", "").trim()
      const topic = rawTopic.charAt(0).toUpperCase() + rawTopic.slice(1)
      return clickButtonUsingMultipleSelectors([
        `button[aria-label="${topic}"]`
      ], topic)
    }

    if (normalizedCommand.includes("chọn bài viết số")) {
      const words = normalizedCommand.split(" ")
      const index = parseInt(words[words.length - 1], 10)
      if (!isNaN(index)) {
        const newsButtons = Array.from(document.querySelectorAll('.news-list button'))
        const newsString = newsButtons[index - 1].innerHTML
        return clickButtonUsingMultipleSelectors([
          `button[aria-label="Tin số ${index}"]`
        ], newsString)
      }
    }

    if (normalizedCommand.includes("đọc bài viết")) {
      return clickButtonUsingMultipleSelectors([
        `button[aria-label="Đọc bài viết"]`
      ], "Đọc bài viết")
    }

    if (normalizedCommand.includes("chuyển trang trước") || normalizedCommand.includes("chuyển trang sau")) {
      const words = normalizedCommand.split(" ")
      let targetString = "Trang " + words[words.length - 1]
      return clickButtonUsingMultipleSelectors([
        `button[aria-label="${targetString}"]`
      ], targetString)
    }

    return false;
  };

  // Main handler for voice commands
  const handleVoiceCommand = (command) => {
    setVoiceCommand(command)
    console.log('Voice command received:', command)
    
    const normalizedCommand = command.toLowerCase()
    const currentPath = window.location.pathname
    console.log('Current path:', currentPath)
    
    if (handleNavigationCommands(normalizedCommand, currentPath)) return
    if (handleAccessibilityCommands(normalizedCommand)) return
    if (handleModeSwitchCommands(normalizedCommand)) return
    if (handleObjectRecognitionCommands(normalizedCommand, currentPath)) return
    if (handleOCRCommands(normalizedCommand, currentPath)) return
    if (handleNewsCommand(normalizedCommand, currentPath)) return
    
    console.log('No matching command found for:', normalizedCommand)
    speak('Không hiểu lệnh. Vui lòng thử lại.')
  }

  useEffect(() => {
    if (isListening) {
      speak('Đang lắng nghe...')
      startListening(handleVoiceCommand)
    } else {
      speak('Đã dừng lắng nghe.')
      stopListening()
    }

    return () => {
      stopListening()
    }
  }, [isListening])

  return (
    <div className="voice-control">
      <button 
        onClick={() => setIsListening(!isListening)}
        aria-label={isListening ? 'Dừng nhận diện giọng nói' : 'Bắt đầu nhận diện giọng nói'}
      >
        {isListening ? 'Dừng' : 'Bắt đầu'}
      </button>
      {voiceCommand && <p className="voice-command">Lệnh: {voiceCommand}</p>}
    </div>
  )  
}