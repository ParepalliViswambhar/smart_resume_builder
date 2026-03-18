import React, { useState } from 'react';
import './ResumeEditor.css';
import ModernTemplate from './templates/ModernTemplate';
import ProfessionalTemplate from './templates/ProfessionalTemplate';
import MinimalTemplate from './templates/MinimalTemplate';
import AIAssistant from './AIAssistant';
import AIChat from './AIChat';

function ResumeEditor({ resumeData, setResumeData }) {
  const [showAI, setShowAI] = useState(false);
  const [aiContext, setAiContext] = useState(null);

  // Ensure all required arrays exist
  React.useEffect(() => {
    if (resumeData) {
      const updatedData = { ...resumeData };
      let needsUpdate = false;

      if (!updatedData.projects || !Array.isArray(updatedData.projects)) {
        updatedData.projects = [{
          id: Date.now(),
          name: 'Project Name',
          tech: 'Technologies Used',
          date: new Date().getFullYear().toString(),
          bullets: ['Describe what you built and the impact']
        }];
        needsUpdate = true;
      }

      if (!updatedData.achievements || !Array.isArray(updatedData.achievements)) {
        updatedData.achievements = [];
        needsUpdate = true;
      }

      if (!updatedData.education || !Array.isArray(updatedData.education)) {
        updatedData.education = [{
          id: Date.now(),
          degree: 'Bachelor of Science',
          school: 'University Name',
          location: 'City, State',
          date: '2020 - 2024',
          gpa: '3.8/4.0'
        }];
        needsUpdate = true;
      }

      if (!updatedData.experience || !Array.isArray(updatedData.experience)) {
        updatedData.experience = [{
          id: Date.now(),
          title: 'Job Title',
          company: 'Company Name',
          location: 'City, State',
          date: 'Month Year - Month Year',
          bullets: ['Add your achievements and responsibilities here']
        }];
        needsUpdate = true;
      }

      if (needsUpdate) {
        console.log('Initializing missing arrays:', updatedData);
        setResumeData(updatedData);
      }
    }
  }, []);

  const handleContentChange = (path, value) => {
    const keys = path.split('.');
    const newData = { ...resumeData };
    let current = newData;
    
    for (let i = 0; i < keys.length - 1; i++) {
      current = current[keys[i]];
    }
    current[keys[keys.length - 1]] = value;
    
    setResumeData(newData);
  };

  const handleArrayChange = (arrayPath, index, field, value) => {
    const newData = { ...resumeData };
    const array = arrayPath.split('.').reduce((obj, key) => obj[key], newData);
    array[index][field] = value;
    setResumeData(newData);
  };

  const addItem = (arrayPath, newItem) => {
    const newData = { ...resumeData };
    const array = arrayPath.split('.').reduce((obj, key) => obj[key], newData);
    array.push({ ...newItem, id: Date.now() });
    setResumeData(newData);
  };

  const removeItem = (arrayPath, id) => {
    const newData = { ...resumeData };
    const keys = arrayPath.split('.');
    let current = newData;
    for (let i = 0; i < keys.length - 1; i++) {
      current = current[keys[i]];
    }
    current[keys[keys.length - 1]] = current[keys[keys.length - 1]].filter(item => item.id !== id);
    setResumeData(newData);
  };

  const openAI = (content, type) => {
    setAiContext({ content, type });
    setShowAI(true);
  };

  const applyAISuggestion = (suggestion) => {
    if (!suggestion || suggestion.includes('Error:') || suggestion.includes('Failed')) {
      alert('Cannot apply invalid suggestion');
      return;
    }
    // Apply AI suggestion based on context
    console.log('Applying suggestion:', suggestion);
    // You can implement actual content replacement here based on aiContext
    setShowAI(false);
  };

  const templateProps = {
    resumeData,
    handleContentChange,
    handleArrayChange,
    addItem,
    removeItem,
    openAI
  };

  const renderTemplate = () => {
    switch (resumeData.template) {
      case 'modern':
        return <ModernTemplate {...templateProps} />;
      case 'professional':
        return <ProfessionalTemplate {...templateProps} />;
      case 'minimal':
        return <MinimalTemplate {...templateProps} />;
      default:
        return <ModernTemplate {...templateProps} />;
    }
  };

  return (
    <div className="resume-editor">
      <div className="editor-container" id="resume-content">
        {renderTemplate()}
      </div>
      
      {showAI && (
        <AIAssistant
          context={aiContext}
          onApply={applyAISuggestion}
          onClose={() => setShowAI(false)}
        />
      )}

      <AIChat
        resumeData={resumeData}
        onUpdateResume={setResumeData}
      />
    </div>
  );
}

export default ResumeEditor;
