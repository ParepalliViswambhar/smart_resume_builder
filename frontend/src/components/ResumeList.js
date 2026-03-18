import React, { useState, useEffect } from 'react';
import './ResumeList.css';
import { FileText, Trash2, Eye, Calendar, ArrowLeft } from 'lucide-react';
import API_URL from '../config';
import API_URL from '../config';

function ResumeList({ onSelect, onBack }) {
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResumes();
  }, []);

  const fetchResumes = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/resumes`);
      const data = await response.json();
      setResumes(data);
    } catch (error) {
      console.error('Failed to fetch resumes:', error);
    }
    setLoading(false);
  };

  const deleteResume = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this resume?')) {
      return;
    }
    
    try {
      await fetch(`${API_URL}/api/resumes/${id}`, {
        method: 'DELETE'
      });
      fetchResumes();
    } catch (error) {
      alert('Failed to delete resume');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="resume-list-container">
        <div className="loading-state">
          <FileText size={48} />
          <p>Loading your resumes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="resume-list-container">
      <div className="resume-list-header">
        <button className="back-btn" onClick={onBack}>
          <ArrowLeft size={20} />
          Back
        </button>
        <h1>My Resumes</h1>
        <p className="subtitle">View and manage your saved resumes</p>
      </div>

      {resumes.length === 0 ? (
        <div className="empty-state">
          <FileText size={64} />
          <h2>No Resumes Yet</h2>
          <p>Create your first resume to get started</p>
          <button className="create-btn" onClick={onBack}>
            Create Resume
          </button>
        </div>
      ) : (
        <div className="resumes-grid">
          {resumes.map((resume) => (
            <div 
              key={resume.id} 
              className="resume-card"
              onClick={() => onSelect(resume)}
            >
              <div className="resume-card-header">
                <FileText size={32} />
                <button 
                  className="delete-btn-card"
                  onClick={(e) => deleteResume(resume.id, e)}
                >
                  <Trash2 size={16} />
                </button>
              </div>
              
              <div className="resume-card-content">
                <h3>{resume.data.personalInfo?.name || 'Untitled Resume'}</h3>
                <p className="resume-template">
                  {resume.data.template?.charAt(0).toUpperCase() + resume.data.template?.slice(1) || 'Template'}
                </p>
                
                <div className="resume-meta">
                  <span className="meta-item">
                    <Calendar size={14} />
                    {formatDate(resume.updated_at)}
                  </span>
                </div>
              </div>

              <div className="resume-card-footer">
                <button className="view-btn">
                  <Eye size={16} />
                  View & Edit
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ResumeList;
