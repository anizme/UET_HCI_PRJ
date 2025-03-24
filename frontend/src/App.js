import React, { useState } from 'react';
import './App.css';

const App = () => {
  const [message, setMessage] = useState('Nhấn nút để xem thông báo!');

  const handleClick = () => {
    setMessage('Bạn đã nhấn nút)');
  }
}