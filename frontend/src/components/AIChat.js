import React, { useState, useRef, useEffect } from 'react';
import './AIChat.css';
import { MessageCircle, X, Send, User, Sparkles } from 'lucide-react';
import API_URL from '../config';

function AIChat({ resumeData, onUpdateResume }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const suggestions = [
    "Improve my summary",
    "Add a new skill",
    "Rewrite this bullet point",
    "Suggest better action verbs",
    "Make it more concise"
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: input
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await fetch(`${API_URL}/api/ai/chat-assist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: input,
          resumeData: resumeData
        })
      });

      const data = await response.json();

      console.log('AI Chat Response:', data);
      console.log('Updated Resume:', data.updatedResume);

      const aiMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: data.response || 'I can help you improve your resume. What would you like to change?'
      };

      setMessages(prev => [...prev, aiMessage]);

      // If AI suggests changes, apply them automatically
      if (data.updatedResume) {
        console.log('Applying updated resume to state...');
        console.log('Before update - Current resumeData:', resumeData);
        console.log('After update - New resumeData:', data.updatedResume);
        
        // Check projects specifically
        console.log('Current projects:', resumeData?.projects);
        console.log('Updated projects:', data.updatedResume?.projects);
        
        // Check if AGRO-LLM project has links
        const agroProject = data.updatedResume?.projects?.find(p => 
          p.name?.toLowerCase().includes('agro')
        );
        console.log('AGRO-LLM project in updated resume:', agroProject);
        
        // Force a new object reference to trigger React re-render
        const updatedResumeWithNewRef = JSON.parse(JSON.stringify(data.updatedResume));
        console.log('Calling onUpdateResume with:', updatedResumeWithNewRef);
        onUpdateResume(updatedResumeWithNewRef);
        
        // Add a confirmation message
        setTimeout(() => {
          const confirmMessage = {
            id: Date.now() + 2,
            type: 'system',
            content: '✓ Changes applied to your resume!'
          };
          setMessages(prev => [...prev, confirmMessage]);
        }, 100);
      } else {
        console.log('No updatedResume in response');
      }
    } catch (error) {
      const errorMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: 'Sorry, I encountered an error. Please make sure the backend is running.'
      };
      setMessages(prev => [...prev, errorMessage]);
    }

    setIsTyping(false);
  };

  const handleSuggestionClick = (suggestion) => {
    setInput(suggestion);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      <button 
        className={`ai-chat-toggle ${isOpen ? 'active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <MessageCircle size={24} />
      </button>

      <div className={`ai-chat-sidebar ${isOpen ? 'open' : ''}`}>
        <div className="ai-chat-header">
          <div className="ai-chat-header-content">
            <h3>
              <Sparkles size={20} />
              AI Assistant
            </h3>
            <div className="header-subtitle">Ask me to improve your resume</div>
          </div>
          <button className="close-chat-btn" onClick={() => setIsOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <div className="ai-chat-messages">
          {messages.length === 0 ? (
            <div className="welcome-message">
              <Sparkles size={48} style={{ color: '#667eea', margin: '0 auto 16px' }} />
              <h4>Hi! I'm your AI Resume Assistant</h4>
              <p>I can help you improve your resume with natural language commands.</p>
              
              <div className="example-commands">
                <h5>Try asking me to:</h5>
                <ul>
                  <li>Improve my professional summary</li>
                  <li>Add Python to my skills</li>
                  <li>Rewrite my first bullet point to be more impactful</li>
                  <li>Suggest better action verbs for my experience</li>
                  <li>Make my resume more concise</li>
                  <li>Add a new project about machine learning</li>
                </ul>
              </div>
            </div>
          ) : (
            <>
              {messages.map((message) => (
                <div key={message.id} className={`chat-message ${message.type}`}>
                  {message.type !== 'system' && (
                    <div className={`message-avatar ${message.type}`}>
                      {message.type === 'user' ? <User size={20} /> : <Sparkles size={20} />}
                    </div>
                  )}
                  <div className={`message-content ${message.type === 'system' ? 'system-message' : ''}`}>
                    {message.content}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="chat-message ai">
                  <div className="message-avatar ai">
                    <Sparkles size={20} />
                  </div>
                  <div className="message-content">
                    <div className="typing-indicator">
                      <div className="typing-dot"></div>
                      <div className="typing-dot"></div>
                      <div className="typing-dot"></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        <div className="ai-chat-input">
          {messages.length === 0 && (
            <div className="chat-suggestions">
              {suggestions.map((suggestion, idx) => (
                <button
                  key={idx}
                  className="suggestion-chip"
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}
          
          <div className="input-container">
            <textarea
              className="chat-input-field"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me to improve your resume..."
              rows="1"
            />
            <button 
              className="send-btn"
              onClick={handleSend}
              disabled={!input.trim() || isTyping}
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default AIChat;
