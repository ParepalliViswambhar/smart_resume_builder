import React, { useState } from 'react';
import './App.css';
import TemplateSelector from './components/TemplateSelector';
import OnboardingForm from './components/OnboardingForm';
import SmartParser from './components/SmartParser';
import ResumeEditor from './components/ResumeEditor';
import ResumeList from './components/ResumeList';
import Toolbar from './components/Toolbar';

function App() {
  const [view, setView] = useState('home'); // 'home', 'onboarding', 'parser', 'editor', 'list'
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [resumeData, setResumeData] = useState(null);
  const [currentResumeId, setCurrentResumeId] = useState(null);
  const [aiSuggestions, setAiSuggestions] = useState(null);

  const handleTemplateSelect = (template, useParser = false) => {
    setSelectedTemplate(template);
    setView(useParser ? 'parser' : 'onboarding');
  };

  const handleOnboardingComplete = (data) => {
    setResumeData(data);
    setView('editor');
  };

  const handleParserComplete = (data, suggestions) => {
    setResumeData(data);
    setAiSuggestions(suggestions);
    setView('editor');
  };

  const handleViewResumes = () => {
    setView('list');
  };

  const handleSelectResume = async (resume) => {
    setResumeData(resume.data);
    setCurrentResumeId(resume.id);
    setSelectedTemplate(resume.data.template);
    setView('editor');
  };

  const handleBack = () => {
    setView('home');
    setSelectedTemplate(null);
    setResumeData(null);
    setCurrentResumeId(null);
    setAiSuggestions(null);
  };

  return (
    <div className="App">
      {view === 'home' && (
        <TemplateSelector
          onSelect={handleTemplateSelect}
          onViewResumes={handleViewResumes}
        />
      )}

      {view === 'onboarding' && (
        <OnboardingForm
          template={selectedTemplate}
          onComplete={handleOnboardingComplete}
          onBack={handleBack}
          onUseParser={() => setView('parser')}
        />
      )}

      {view === 'parser' && (
        <SmartParser
          template={selectedTemplate}
          onComplete={handleParserComplete}
          onBack={handleBack}
        />
      )}

      {view === 'list' && (
        <ResumeList
          onSelect={handleSelectResume}
          onBack={handleBack}
        />
      )}

      {view === 'editor' && (
        <>
          <Toolbar
            resumeData={resumeData}
            resumeId={currentResumeId}
            onBack={handleBack}
            suggestions={aiSuggestions}
          />
          <ResumeEditor
            resumeData={resumeData}
            setResumeData={setResumeData}
          />
        </>
      )}
    </div>
  );
}

export default App;
