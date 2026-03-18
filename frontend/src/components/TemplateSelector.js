import React, { useState } from 'react';
import './TemplateSelector.css';
import { FileText, Briefcase, Sparkles, FolderOpen, Eye } from 'lucide-react';
import TemplatePreview from './TemplatePreview';

const templates = [
  {
    id: 'modern',
    name: 'Modern',
    description: 'Clean and contemporary design',
    icon: Sparkles,
    color: '#667eea'
  },
  {
    id: 'professional',
    name: 'Professional',
    description: 'Traditional corporate style',
    icon: Briefcase,
    color: '#4c51bf'
  },
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'Simple and elegant',
    icon: FileText,
    color: '#764ba2'
  }
];

function TemplateSelector({ onSelect, onViewResumes }) {
  const [previewTemplate, setPreviewTemplate] = useState(null);

  const handlePreview = (templateId, e) => {
    e.stopPropagation();
    setPreviewTemplate(templateId);
  };

  const handleSelectFromPreview = (templateId) => {
    setPreviewTemplate(null);
    onSelect(templateId);
  };

  return (
    <div className="template-selector">
      <div className="selector-header">
        <h1>Smart Resume Builder</h1>
        <p>Choose a template to get started</p>
        
        <button className="view-resumes-btn" onClick={onViewResumes}>
          <FolderOpen size={20} />
          View My Resumes
        </button>
      </div>
      
      <div className="templates-grid">
        {templates.map((template) => {
          const Icon = template.icon;
          return (
            <div 
              key={template.id}
              className="template-card"
              onClick={() => onSelect(template.id)}
              style={{ '--template-color': template.color }}
            >
              <div className="template-icon">
                <Icon size={48} />
              </div>
              <h3>{template.name}</h3>
              <p>{template.description}</p>
              
              <div className="template-actions">
                <button 
                  className="preview-btn"
                  onClick={(e) => handlePreview(template.id, e)}
                >
                  <Eye size={16} />
                  Preview
                </button>
                <button className="select-btn">
                  Select Template
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {previewTemplate && (
        <TemplatePreview
          template={previewTemplate}
          onClose={() => setPreviewTemplate(null)}
          onSelect={handleSelectFromPreview}
        />
      )}
    </div>
  );
}

export default TemplateSelector;
