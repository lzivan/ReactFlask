import React, { useState } from 'react';
import axios from 'axios';
import './App.css'; // 假设你的CSS文件名是ChatInterface.css

const App = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [reportUrl, setReportUrl] = useState(''); // 新状态来保存报告的URL
  const [jobSearchResults, setJobSearchResults] = useState([]);
  const [emailTemplate, setEmailTemplate] = useState('');


  const sendMessage = async () => {
    const userMessage = {
      text: inputMessage,
      sender: 'user',
    };
  
    // 解析用户消息中的角色、行业和地点
    const roleMatch = inputMessage.match(/\[ROLE: (.*?)\]/);
    const industryMatch = inputMessage.match(/\[Industry: (.*?)\]/);
    const locationMatch = inputMessage.match(/\[LOCATION: (.*?)\]/);
  
    const role = roleMatch ? roleMatch[1] : null;
    const industry = industryMatch ? industryMatch[1] : null;
    const location = locationMatch ? locationMatch[1] : null;
  
    // 定义AI的回复消息
    let aiMessage;
  
    // 检查是否所有所需信息都已提取
    if (role && industry && location) {
      try {
        // 这里发送请求到您的后端
        const response = await axios.post('/search_jobs', { role, industry, location });
        aiMessage = {
          text: response.data.ai_message,
          sender: 'ai',
        };
        setJobSearchResults(response.data.jobs_data);  // 存储工作搜索结果
      } catch (error) {
        console.error('Error sending message:', error);
        aiMessage = {
          text: 'Error: Could not process your request.',
          sender: 'ai',
        };
      }
    } else {
      aiMessage = {
        text: 'Please provide role, industry, and location in the specified format.',
        sender: 'ai',
      };
    }
  
    // 更新消息列表以包括用户的消息和AI的响应
    setMessages(prevMessages => [...prevMessages, userMessage, aiMessage]);
  
    // 清空输入区域
    setInputMessage('');
  };
  
  const handleCreateEmails = async () => {
    const designers = ['John Smith', 'Jane Doe', 'Bob Johnson', 'Mary Jane', 'James Bond']
    try {
      const response = await axios.post('/create_emails', { email_template: emailTemplate, designers: designers });
      setReportUrl(response.data.report_url);  // 假设后端返回的是PDF下载链接
    } catch (error) {
      console.error('Error creating emails:', error);
    }
  };
  
  

  return (
    <div className="chat-interface">
      <div className="messages-list">
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.sender}`}>
            {msg.text}
          </div>
        ))}
        
        
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
      <ul className="job-search-results">
        {jobSearchResults.map((job, index) => (
          <li key={index}>
            <div>Role: {job.title}</div>
            <div>Company: {job.company}</div>
            <div>Industry: {job.industry}</div>
            <div>City: {job.city}</div>
            <div>Website: <a href={job.website} target="_blank" rel="noopener noreferrer">{job.website}</a></div>
            <div>Designers: {job.designers.join(', ')}</div>
          </li>
        ))}
      </ul>
      // 在JSX中
      <textarea
        value={emailTemplate}
        onChange={(e) => setEmailTemplate(e.target.value)}
        placeholder="Enter email template here..."
      />
      <button onClick={handleCreateEmails}>Create Emails</button>

      {reportUrl && (
        <div className="report-download">
          <a href={reportUrl} download>Download Emails PDF</a>
        </div>
      )}


    </div>
  );
};

export default App;