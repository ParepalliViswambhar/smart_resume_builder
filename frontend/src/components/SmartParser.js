import React, { useState } from 'react';
import './SmartParser.css';
import { Sparkles, ArrowRight, Loader, AlertCircle, CheckCircle } from 'lucide-react';
import API_URL from '../config';
import API_URL from '../config';

function SmartParser({ template, onComplete, onBack }) {
  const [content, setContent] = useState('');
  const [parsing, setParsing] = useState(false);
  const [parsedData, setParsedData] = useState(null);
  const [error, setError] = useState('');

  const handleParse = async () => {
    if (content.trim().length < 50) {
      setError('Please provide at least 50 characters of content');
      return;
    }

    setParsing(true);
    setError('');

    try {
      const response = await fetch(`${API_URL}/api/ai/parse-resume`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content })
      });

      const data = await response.json();

      if (response.ok) {
        setParsedData(data);
      } else {
        setError(data.error || 'Failed to parse content');
      }
    } catch (err) {
      setError('Failed to connect to AI service. Make sure the backend is running.');
    }

    setParsing(false);
  };

  const handleAccept = () => {
    const resumeData = {
      template: template,
      personalInfo: parsedData.personalInfo,
      summary: parsedData.summary,
      education: parsedData.education.map((edu, idx) => ({ ...edu, id: idx + 1 })),
      experience: parsedData.experience.map((exp, idx) => ({ ...exp, id: idx + 1 })),
      projects: parsedData.projects.map((proj, idx) => ({ ...proj, id: idx + 1 })),
      skills: parsedData.skills,
      customSections: []
    };

    onComplete(resumeData, parsedData.suggestions);
  };

  return (
    <div className="smart-parser-container">
      <div className="parser-card">
        <div className="parser-header">
          <div className="header-icon">
            <Sparkles size={32} />
          </div>
          <h1>AI-Powered Resume Parser</h1>
          <p>Paste your resume content, and AI will organize it into sections with suggestions</p>
        </div>

        {!parsedData ? (
          <div className="parser-input-section">
            <label>Paste Your Resume Content</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Paste your resume text here... Include your name, contact info, education, work experience, projects, skills, etc.

Example:
John Doe
john@example.com | (555) 123-4567 | San Francisco, CA

Education:
Bachelor of Science in Computer Science, Stanford University, 2018-2022, GPA: 3.8

Experience:
Software Engineer at Google, 2022-Present
- Built scalable web applications
- Improved performance by 40%

Skills: JavaScript, React, Python, Node.js"
              rows="15"
            />
            <small>{content.length} characters (minimum 50 required)</small>

            {error && (
              <div className="error-message">
                <AlertCircle size={16} />
                {error}
              </div>
            )}

            <div className="parser-actions">
              <button className="btn-secondary" onClick={onBack}>
                Back
              </button>
              <button 
                className="btn-primary" 
                onClick={handleParse}
                disabled={parsing || content.trim().length < 50}
              >
                {parsing ? (
                  <>
                    <Loader className="spinner" size={20} />
                    Parsing with AI...
                  </>
                ) : (
                  <>
                    <Sparkles size={20} />
                    Parse with AI
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          <div className="parser-results">
            <div className="success-banner">
              <CheckCircle size={24} />
              <div>
                <h3>Content Parsed Successfully!</h3>
                <p>Review the extracted information and AI suggestions below</p>
              </div>
            </div>

            <div className="parsed-sections">
              <div className="parsed-section">
                <h3>Personal Information</h3>
                <div className="info-grid">
                  <div><strong>Name:</strong> {parsedData.personalInfo.name}</div>
                  <div><strong>Email:</strong> {parsedData.personalInfo.email || 'Not found'}</div>
                  <div><strong>Phone:</strong> {parsedData.personalInfo.phone || 'Not found'}</div>
                  <div><strong>Location:</strong> {parsedData.personalInfo.location || 'Not found'}</div>
                </div>
              </div>

              <div className="parsed-section">
                <h3>Professional Summary</h3>
                <p>{parsedData.summary}</p>
                {parsedData.suggestions?.summary && (
                  <div className="suggestion-box">
                    <Sparkles size={16} />
                    <span><strong>AI Suggestion:</strong> {parsedData.suggestions.summary}</span>
                  </div>
                )}
              </div>

              <div className="parsed-section">
                <h3>Education ({parsedData.education.length})</h3>
                {parsedData.education.map((edu, idx) => (
                  <div key={idx} className="item-preview">
                    <strong>{edu.degree}</strong> - {edu.school}
                  </div>
                ))}
              </div>

              <div className="parsed-section">
                <h3>Experience ({parsedData.experience.length})</h3>
                {parsedData.experience.map((exp, idx) => (
                  <div key={idx} className="item-preview">
                    <strong>{exp.title}</strong> at {exp.company}
                    <ul>
                      {exp.bullets.slice(0, 2).map((bullet, bIdx) => (
                        <li key={bIdx}>{bullet}</li>
                      ))}
                    </ul>
                  </div>
                ))}
                {parsedData.suggestions?.experience && parsedData.suggestions.experience.length > 0 && (
                  <div className="suggestion-box">
                    <Sparkles size={16} />
                    <span><strong>AI Suggestions:</strong> {parsedData.suggestions.experience.join('; ')}</span>
                  </div>
                )}
              </div>

              <div className="parsed-section">
                <h3>Skills</h3>
                <div className="skills-preview">
                  <div><strong>Technical:</strong> {parsedData.skills.technical.join(', ')}</div>
                  <div><strong>Soft Skills:</strong> {parsedData.skills.soft.join(', ')}</div>
                </div>
                {parsedData.suggestions?.skills && parsedData.suggestions.skills.length > 0 && (
                  <div className="suggestion-box">
                    <Sparkles size={16} />
                    <span><strong>Suggested Skills:</strong> {parsedData.suggestions.skills.join(', ')}</span>
                  </div>
                )}
              </div>

              {parsedData.suggestions?.overall && (
                <div className="overall-feedback">
                  <h3>Overall Feedback</h3>
                  <p>{parsedData.suggestions.overall}</p>
                </div>
              )}
            </div>

            <div className="parser-actions">
              <button className="btn-secondary" onClick={() => setParsedData(null)}>
                Re-parse
              </button>
              <button className="btn-primary" onClick={handleAccept}>
                <CheckCircle size={20} />
                Use This Content
                <ArrowRight size={20} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default SmartParser;
