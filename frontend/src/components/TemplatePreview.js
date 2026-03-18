import React from 'react';
import './TemplatePreview.css';
import { X, Check } from 'lucide-react';
import ModernTemplate from './templates/ModernTemplate';
import ProfessionalTemplate from './templates/ProfessionalTemplate';
import MinimalTemplate from './templates/MinimalTemplate';

const sampleData = {
  personalInfo: {
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+1 (555) 123-4567',
    location: 'San Francisco, CA',
    linkedin: 'linkedin.com/in/johndoe',
    github: 'github.com/johndoe',
    website: 'johndoe.com'
  },
  summary: 'Results-driven software engineer with 3+ years of experience building scalable web applications. Passionate about clean code and user experience.',
  education: [
    {
      id: 1,
      degree: 'Bachelor of Science in Computer Science',
      school: 'Stanford University',
      location: 'Stanford, CA',
      date: '2018 - 2022',
      gpa: '3.8/4.0'
    }
  ],
  experience: [
    {
      id: 1,
      title: 'Software Engineer',
      company: 'Tech Company',
      location: 'San Francisco, CA',
      date: 'Jun 2022 - Present',
      bullets: [
        'Developed and maintained web applications using React and Node.js',
        'Improved application performance by 40% through code optimization',
        'Collaborated with cross-functional teams to deliver features on time'
      ]
    }
  ],
  projects: [
    {
      id: 1,
      name: 'E-commerce Platform',
      tech: 'React, Node.js, MongoDB',
      date: '2023',
      bullets: [
        'Built a full-stack e-commerce platform with payment integration',
        'Implemented user authentication and authorization'
      ]
    }
  ],
  skills: {
    technical: ['JavaScript', 'React', 'Node.js', 'Python', 'SQL', 'Git'],
    soft: ['Communication', 'Problem Solving', 'Team Collaboration']
  }
};

function TemplatePreview({ template, onClose, onSelect }) {
  const renderTemplate = () => {
    const dummyProps = {
      resumeData: { ...sampleData, template },
      handleContentChange: () => {},
      handleArrayChange: () => {},
      addItem: () => {},
      removeItem: () => {},
      openAI: () => {}
    };

    switch (template) {
      case 'modern':
        return <ModernTemplate {...dummyProps} />;
      case 'professional':
        return <ProfessionalTemplate {...dummyProps} />;
      case 'minimal':
        return <MinimalTemplate {...dummyProps} />;
      default:
        return <ModernTemplate {...dummyProps} />;
    }
  };

  return (
    <div className="template-preview-overlay">
      <div className="template-preview-container">
        <div className="preview-header">
          <h2>{template.charAt(0).toUpperCase() + template.slice(1)} Template Preview</h2>
          <button className="close-preview-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="preview-content">
          <div className="preview-notice">
            <p>This is a preview with sample data. Your actual resume will have your information.</p>
          </div>
          
          <div className="preview-resume" id="template-preview">
            {renderTemplate()}
          </div>
        </div>

        <div className="preview-actions">
          <button className="btn-secondary" onClick={onClose}>
            Close Preview
          </button>
          <button className="btn-primary" onClick={() => onSelect(template)}>
            <Check size={20} />
            Use This Template
          </button>
        </div>
      </div>
    </div>
  );
}

export default TemplatePreview;
