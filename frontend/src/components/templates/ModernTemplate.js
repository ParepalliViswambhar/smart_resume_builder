import React from 'react';
import './ModernTemplate.css';
import { Mail, Phone, MapPin, Linkedin, Globe, Plus, Trash2, Sparkles, Github } from 'lucide-react';
import EditableField from '../EditableField';

function ModernTemplate({ resumeData, handleContentChange, handleArrayChange, addItem, removeItem, openAI }) {
  return (
    <div className="modern-template">
      <div className="header-section">
        <EditableField
          value={resumeData.personalInfo.name}
          onChange={(val) => handleContentChange('personalInfo.name', val)}
          className="name-field"
          tag="h1"
        />
        
        <div className="contact-info">
          <div className="contact-item">
            <Mail size={16} />
            <EditableField
              value={resumeData.personalInfo.email}
              onChange={(val) => handleContentChange('personalInfo.email', val)}
            />
          </div>
          <div className="contact-item">
            <Phone size={16} />
            <EditableField
              value={resumeData.personalInfo.phone}
              onChange={(val) => handleContentChange('personalInfo.phone', val)}
            />
          </div>
          <div className="contact-item">
            <MapPin size={16} />
            <EditableField
              value={resumeData.personalInfo.location}
              onChange={(val) => handleContentChange('personalInfo.location', val)}
            />
          </div>
          {resumeData.personalInfo.linkedin && (
            <div className="contact-item">
              <Linkedin size={16} />
              <EditableField
                value={resumeData.personalInfo.linkedin}
                onChange={(val) => handleContentChange('personalInfo.linkedin', val)}
              />
            </div>
          )}
          {resumeData.personalInfo.github && (
            <div className="contact-item">
              <Github size={16} />
              <EditableField
                value={resumeData.personalInfo.github}
                onChange={(val) => handleContentChange('personalInfo.github', val)}
              />
            </div>
          )}
          {resumeData.personalInfo.website && (
            <div className="contact-item">
              <Globe size={16} />
              <EditableField
                value={resumeData.personalInfo.website}
                onChange={(val) => handleContentChange('personalInfo.website', val)}
              />
            </div>
          )}
        </div>
      </div>

      <div className="section">
        <div className="section-header">
          <h2>Professional Summary</h2>
          <button className="ai-btn" onClick={() => openAI(resumeData.summary, 'summary')}>
            <Sparkles size={16} />
          </button>
        </div>
        <EditableField
          value={resumeData.summary}
          onChange={(val) => handleContentChange('summary', val)}
          className="summary-field"
          multiline
        />
      </div>

      <div className="section">
        <h2>Education</h2>
        {resumeData.education.map((edu, idx) => (
          <div key={edu.id} className="education-item">
            <div className="item-header">
              <div className="item-title-group">
                <EditableField
                  value={edu.degree}
                  onChange={(val) => handleArrayChange('education', idx, 'degree', val)}
                  className="degree-field"
                  tag="h3"
                />
                <EditableField
                  value={edu.school}
                  onChange={(val) => handleArrayChange('education', idx, 'school', val)}
                  className="school-field"
                />
              </div>
              <div className="item-meta">
                <EditableField
                  value={edu.date}
                  onChange={(val) => handleArrayChange('education', idx, 'date', val)}
                  className="date-field"
                />
                <button className="delete-btn" onClick={() => removeItem('education', edu.id)}>
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
            <div className="item-details">
              <EditableField
                value={edu.location}
                onChange={(val) => handleArrayChange('education', idx, 'location', val)}
              />
              {edu.gpa && (
                <>
                  <span className="separator">•</span>
                  <span>GPA: </span>
                  <EditableField
                    value={edu.gpa}
                    onChange={(val) => handleArrayChange('education', idx, 'gpa', val)}
                  />
                </>
              )}
            </div>
          </div>
        ))}
        <button className="add-btn" onClick={() => addItem('education', {
          degree: 'New Degree',
          school: 'School Name',
          location: 'City, State',
          date: 'Year',
          gpa: 'GPA'
        })}>
          <Plus size={16} /> Add Education
        </button>
      </div>

      <div className="section">
        <h2>Experience</h2>
        {resumeData.experience.map((exp, idx) => (
          <div key={exp.id} className="experience-item">
            <div className="item-header">
              <div className="item-title-group">
                <EditableField
                  value={exp.title}
                  onChange={(val) => handleArrayChange('experience', idx, 'title', val)}
                  className="title-field"
                  tag="h3"
                />
                <EditableField
                  value={exp.company}
                  onChange={(val) => handleArrayChange('experience', idx, 'company', val)}
                  className="company-field"
                />
              </div>
              <div className="item-meta">
                <EditableField
                  value={exp.date}
                  onChange={(val) => handleArrayChange('experience', idx, 'date', val)}
                  className="date-field"
                />
                <button className="delete-btn" onClick={() => removeItem('experience', exp.id)}>
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
            <EditableField
              value={exp.location}
              onChange={(val) => handleArrayChange('experience', idx, 'location', val)}
              className="location-field"
            />
            <ul className="bullet-list">
              {exp.bullets.map((bullet, bIdx) => (
                <li key={bIdx}>
                  <EditableField
                    value={bullet}
                    onChange={(val) => {
                      const newBullets = [...exp.bullets];
                      newBullets[bIdx] = val;
                      handleArrayChange('experience', idx, 'bullets', newBullets);
                    }}
                    multiline
                  />
                  <button className="ai-btn-inline" onClick={() => openAI(bullet, 'bullet')}>
                    <Sparkles size={12} />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
        <button className="add-btn" onClick={() => addItem('experience', {
          title: 'Job Title',
          company: 'Company Name',
          location: 'City, State',
          date: 'Month Year - Month Year',
          bullets: ['Achievement or responsibility']
        })}>
          <Plus size={16} /> Add Experience
        </button>
      </div>

      <div className="section">
        <h2>Projects</h2>
        {resumeData.projects && resumeData.projects.length > 0 ? (
          resumeData.projects.map((proj, idx) => (
            <div key={proj.id} className="project-item">
              <div className="item-header">
                <EditableField
                  value={proj.name}
                  onChange={(val) => handleArrayChange('projects', idx, 'name', val)}
                  className="project-name"
                  tag="h3"
                />
                <div className="item-meta">
                  <EditableField
                    value={proj.date || ''}
                    onChange={(val) => handleArrayChange('projects', idx, 'date', val)}
                    className="date-field"
                  />
                  <button className="delete-btn" onClick={() => removeItem('projects', proj.id)}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              
              {proj.tech && (
                <EditableField
                  value={proj.tech}
                  onChange={(val) => handleArrayChange('projects', idx, 'tech', val)}
                  className="tech-field"
                />
              )}
              
              {proj.team && (
                <div style={{ fontSize: '0.9rem', color: '#718096', marginBottom: '8px' }}>
                  <EditableField
                    value={proj.team}
                    onChange={(val) => handleArrayChange('projects', idx, 'team', val)}
                  />
                </div>
              )}
              
              {proj.description && !proj.bullets?.length && (
                <div className="project-description">
                  <EditableField
                    value={proj.description}
                    onChange={(val) => handleArrayChange('projects', idx, 'description', val)}
                    multiline
                  />
                </div>
              )}
              
              {proj.bullets && proj.bullets.length > 0 && (
                <ul className="bullet-list">
                  {proj.bullets.map((bullet, bIdx) => (
                    <li key={bIdx}>
                      <EditableField
                        value={bullet}
                        onChange={(val) => {
                          const newBullets = [...proj.bullets];
                          newBullets[bIdx] = val;
                          handleArrayChange('projects', idx, 'bullets', newBullets);
                        }}
                        multiline
                      />
                    </li>
                  ))}
                  {proj.links && proj.links.demo && (
                    <li style={{ color: '#667eea' }}>
                      <strong>Demo:</strong>{' '}
                      <EditableField
                        value={proj.links.demo}
                        onChange={(val) => {
                          const newLinks = { ...proj.links, demo: val };
                          handleArrayChange('projects', idx, 'links', newLinks);
                        }}
                      />
                    </li>
                  )}
                  {proj.links && proj.links.github && (
                    <li style={{ color: '#667eea' }}>
                      <strong>GitHub:</strong>{' '}
                      <EditableField
                        value={proj.links.github}
                        onChange={(val) => {
                          const newLinks = { ...proj.links, github: val };
                          handleArrayChange('projects', idx, 'links', newLinks);
                        }}
                      />
                    </li>
                  )}
                </ul>
              )}
              
              {(!proj.bullets || proj.bullets.length === 0) && !proj.description && (
                <button 
                  className="add-description-btn"
                  onClick={() => handleArrayChange('projects', idx, 'bullets', ['Add project details here'])}
                >
                  <Plus size={14} /> Add Description
                </button>
              )}
            </div>
          ))
        ) : (
          <p style={{ color: '#718096', fontStyle: 'italic' }}>No projects added yet. Click the button below to add one.</p>
        )}
        <button className="add-btn" onClick={() => addItem('projects', {
          name: 'Project Name',
          tech: '',
          date: new Date().getFullYear().toString(),
          description: '',
          bullets: []
        })}>
          <Plus size={16} /> Add Project
        </button>
      </div>

      <div className="section">
        <h2>Skills</h2>
        <div className="skills-section">
          {resumeData.skills.programmingLanguages && resumeData.skills.programmingLanguages.length > 0 && (
            <div className="skill-category">
              <strong>Programming Languages:</strong>
              <EditableField
                value={resumeData.skills.programmingLanguages.join(', ')}
                onChange={(val) => handleContentChange('skills.programmingLanguages', val.split(',').map(s => s.trim()))}
                className="skills-field"
              />
            </div>
          )}
          
          {resumeData.skills.frameworks && resumeData.skills.frameworks.length > 0 && (
            <div className="skill-category">
              <strong>Frameworks & Libraries:</strong>
              <EditableField
                value={resumeData.skills.frameworks.join(', ')}
                onChange={(val) => handleContentChange('skills.frameworks', val.split(',').map(s => s.trim()))}
                className="skills-field"
              />
            </div>
          )}
          
          {resumeData.skills.databases && resumeData.skills.databases.length > 0 && (
            <div className="skill-category">
              <strong>Databases:</strong>
              <EditableField
                value={resumeData.skills.databases.join(', ')}
                onChange={(val) => handleContentChange('skills.databases', val.split(',').map(s => s.trim()))}
                className="skills-field"
              />
            </div>
          )}
          
          {resumeData.skills.aiml && resumeData.skills.aiml.length > 0 && (
            <div className="skill-category">
              <strong>AI/ML Technologies:</strong>
              <EditableField
                value={resumeData.skills.aiml.join(', ')}
                onChange={(val) => handleContentChange('skills.aiml', val.split(',').map(s => s.trim()))}
                className="skills-field"
              />
            </div>
          )}
          
          {resumeData.skills.devops && resumeData.skills.devops.length > 0 && (
            <div className="skill-category">
              <strong>DevOps & Cloud:</strong>
              <EditableField
                value={resumeData.skills.devops.join(', ')}
                onChange={(val) => handleContentChange('skills.devops', val.split(',').map(s => s.trim()))}
                className="skills-field"
              />
            </div>
          )}
          
          {resumeData.skills.tools && resumeData.skills.tools.length > 0 && (
            <div className="skill-category">
              <strong>Tools & Others:</strong>
              <EditableField
                value={resumeData.skills.tools.join(', ')}
                onChange={(val) => handleContentChange('skills.tools', val.split(',').map(s => s.trim()))}
                className="skills-field"
              />
            </div>
          )}
          
          {/* Fallback for old format */}
          {resumeData.skills.technical && !resumeData.skills.programmingLanguages && (
            <div className="skill-category">
              <strong>Technical:</strong>
              <EditableField
                value={resumeData.skills.technical.join(', ')}
                onChange={(val) => handleContentChange('skills.technical', val.split(',').map(s => s.trim()))}
                className="skills-field"
              />
            </div>
          )}
          
          {resumeData.skills.soft && resumeData.skills.soft.length > 0 && (
            <div className="skill-category">
              <strong>Soft Skills:</strong>
              <EditableField
                value={resumeData.skills.soft.join(', ')}
                onChange={(val) => handleContentChange('skills.soft', val.split(',').map(s => s.trim()))}
                className="skills-field"
              />
            </div>
          )}
        </div>
      </div>

      {resumeData.achievements && resumeData.achievements.length > 0 && (
        <div className="section">
          <h2>Achievements</h2>
          {resumeData.achievements.map((achievement, idx) => (
            <div key={achievement.id} className="achievement-item">
              <div className="item-header">
                <EditableField
                  value={achievement.description}
                  onChange={(val) => handleArrayChange('achievements', idx, 'description', val)}
                  multiline
                />
                <button className="delete-btn" onClick={() => removeItem('achievements', achievement.id)}>
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
          <button className="add-btn" onClick={() => addItem('achievements', {
            description: 'New achievement'
          })}>
            <Plus size={16} /> Add Achievement
          </button>
        </div>
      )}
    </div>
  );
}

export default ModernTemplate;
