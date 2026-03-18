import React, { useState, useEffect } from 'react';
import './AIAssistant.css';
import { X, Sparkles, Loader } from 'lucide-react';
import API_URL from '../config';

function AIAssistant({ context, onApply, onClose }) {
  const [suggestion, setSuggestion] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSuggestion();
  }, [context]);

  const fetchSuggestion = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/ai/improve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: context.content,
          type: context.type
        })
      });
      const data = await response.json();
      if (data.error) {
        setSuggestion(`Error: ${data.error}. Please check your Gemini API key in backend/.env`);
      } else {
        setSuggestion(data.suggestion);
      }
    } catch (error) {
      setSuggestion('Failed to connect to AI service. Make sure the backend is running.');
    }
    setLoading(false);
  };

  return (
    <div className="ai-assistant-overlay">
      <div className="ai-assistant">
        <div className="ai-header">
          <div className="ai-title">
            <Sparkles size={20} />
            <h3>AI Suggestion</h3>
          </div>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="ai-content">
          <div className="original-content">
            <label>Original:</label>
            <p>{context.content}</p>
          </div>

          <div className="suggestion-content">
            <label>Suggestion:</label>
            {loading ? (
              <div className="loading">
                <Loader className="spinner" size={24} />
                <p>Generating suggestion...</p>
              </div>
            ) : (
              <p>{suggestion}</p>
            )}
          </div>
        </div>

        <div className="ai-actions">
          <button className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button 
            className="btn-primary" 
            onClick={() => onApply(suggestion)}
            disabled={loading}
          >
            Apply Suggestion
          </button>
        </div>
      </div>
    </div>
  );
}

export default AIAssistant;
