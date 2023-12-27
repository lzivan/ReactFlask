import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

const App = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [reportUrl, setReportUrl] = useState(''); 


  const sendMessage = async () => {
    const userMessage = {
      text: inputMessage,
      sender: 'user',
    };
  
    // extract the person name and linkedin url from the input
    const personMatch = inputMessage.match(/\[PERSON: (.*?)\]/);
    const linkedinUrlMatch = inputMessage.match(/\[LINKEDINURL: (.*?)\]/);
  
    const personName = personMatch ? personMatch[1] : null;
    const linkedinUrl = linkedinUrlMatch ? linkedinUrlMatch[1] : null;
  
    let aiMessage;
  
    try {
      // send the message to the server and wait for the response
      const response = await axios.post('/generate_report', {
        person: personName,
        linkedin_url: linkedinUrl,
      });
      aiMessage = {
        text: response.data.message,
        sender: 'ai',
      };
      // store the report url in state
      setReportUrl(response.data.report_url);
    } catch (error) {
      console.error('Error sending message:', error);
      aiMessage = {
        text: 'Error: Could not retrieve the report.',
        sender: 'ai',
      };
    }
  
    // show the messages on the screen for both user and ai
    setMessages(prevMessages => [...prevMessages, userMessage, aiMessage]);
  
    
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