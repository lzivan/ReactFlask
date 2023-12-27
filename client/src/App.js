import React, { useState } from 'react';
import axios from 'axios';
import './App.css'; // 假设你的CSS文件名是ChatInterface.css

const App = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [reportUrl, setReportUrl] = useState(''); // 新状态来保存报告的URL


  const sendMessage = async () => {
    const userMessage = {
      text: inputMessage,
      sender: 'user',
    };
  
    // 尝试解析用户消息中的人名和LinkedIn URL
    const personMatch = inputMessage.match(/\[PERSON: (.*?)\]/);
    const linkedinUrlMatch = inputMessage.match(/\[LINKEDINURL: (.*?)\]/);
  
    const personName = personMatch ? personMatch[1] : null;
    const linkedinUrl = linkedinUrlMatch ? linkedinUrlMatch[1] : null;
  
    // 只定义aiMessage，不要立即添加到状态中
    let aiMessage;
  
    try {
      // 发送消息到后端并等待响应
      const response = await axios.post('/generate_report', {
        person: personName,
        linkedin_url: linkedinUrl,
      });
      aiMessage = {
        text: response.data.message,
        sender: 'ai',
      };
      // 存储报告的URL
      setReportUrl(response.data.report_url);
    } catch (error) {
      console.error('Error sending message:', error);
      aiMessage = {
        text: 'Error: Could not retrieve the report.',
        sender: 'ai',
      };
    }
  
    // 一次性更新状态以包括用户消息和AI响应
    setMessages(prevMessages => [...prevMessages, userMessage, aiMessage]);
  
    // 清空输入区域
    setInputMessage('');
  };
  
  

  return (
    <div className="chat-interface">
      <div className="messages-list">
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.sender}`}>
            {msg.text}
          </div>
        ))}
        {/* 如果有报告的URL，则显示下载按钮 */}
        {reportUrl && (
          <div className="report-download">
            <a href={reportUrl} download target="_blank" rel="noopener noreferrer">Download Report</a>
          </div>
        )}
      </div>
      <div className="input-area">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
};

export default App;