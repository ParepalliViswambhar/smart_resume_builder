import React from 'react';
import './ProfessionalTemplate.css';
import { Mail, Phone, MapPin, Linkedin, Plus, Trash2 } from 'lucide-react';
import EditableField from '../EditableField';

function ProfessionalTemplate({ resumeData, handleContentChange, handleArrayChange, addItem, removeItem }) {
  return (
    <div className="professional-template">
      <div className="prof-header">
        <EditableField
          value={resumeData.personalInfo.name}
          onChange={(val) => handleContentChange('personalInfo.name', val)}
          className="prof-name"
          tag="h1"
        />
        <div className="prof-contact">
          <span><Mail size={14} /> <EditableField value={resumeData.personalInfo.email} onChange={(val) => handleContentChange('personalInfo.email', val)} /></span>
          <span><Phone size={14} /> <EditableField value={resumeData.personalInfo.phone} onChange={(val) => handleContentChange('personalInfo.phone', val)} /></span>
          <span><MapPin size={14} /> <EditableField value={resumeData.personalInfo.location} onChange={(val) => handleContentChange('personalInfo.location', val)} /></span>
          {resumeData.personalInfo.linkedin && (
            <span><Linkedin size={14} /> <EditableField value={resumeData.personalInfo.linkedin} onChange={(val) => handleContentChange('personalInfo.linkedin', val)} /></span>
          )}
          {resumeData.personalInfo.github && (
            <span>GitHub: <EditableField value={resumeData.personalInfo.github} onChange={(val) => handleContentChange('personalInfo.github', val)} /></span>
          )}
        </div>
      </div>

      <div className="prof-section">
        <h2>SUMMARY</h2>
        <EditableField value={resumeData.summary} onChange={(val) => handleContentChange('summary', val)} multiline />
      </div>

      <div className="prof-section">
        <h2>EDUCATION</h2>
        {resumeData.education.map((edu, idx) => (
          <div key={edu.id} className="prof-item">
            <div className="prof-item-row">
              <EditableField value={edu.degree} onChange={(val) => handleArrayChange('education', idx, 'degree', val)} tag="strong" />
              <EditableField value={edu.date} onChange={(val) => handleArrayChange('education', idx, 'date', val)} />
            </div>
            <div className="prof-item-row">
              <EditableField value={edu.school} onChange={(val) => handleArrayChange('education', idx, 'school', val)} />
              <button className="delete-btn" onClick={() => removeItem('education', edu.id)}><Trash2 size={12} /></button>
            </div>
            {edu.location && (
              <div><EditableField value={edu.location} onChange={(val) => handleArrayChange('education', idx, 'location', val)} /></div>
            )}
            {edu.gpa && (
              <div>GPA: <EditableField value={edu.gpa} onChange={(val) => handleArrayChange('education', idx, 'gpa', val)} /></div>
            )}
          </div>
        ))}
        <button className="add-btn" onClick={() => addItem('education', { degree: 'Degree', school: 'School', date: 'Year', gpa: 'GPA' })}>
          <Plus size={14} /> Add
        </button>
      </div>

      <div className="prof-section">
        <h2>EXPERIENCE</h2>
        {resumeData.experience && resumeData.experience.length > 0 ? (
          resumeData.experience.map((exp, idx) => (
            <div key={exp.id} className="prof-item">
              <div className="prof-item-row">
                <EditableField value={exp.title} onChange={(val) => handleArrayChange('experience', idx, 'title', val)} tag="strong" />
                <EditableField value={exp.date} onChange={(val) => handleArrayChange('experience', idx, 'date', val)} />
              </div>
              <div className="prof-item-row">
                <EditableField value={exp.company} onChange={(val) => handleArrayChange('experience', idx, 'company', val)} />
                <button className="delete-btn" onClick={() => removeItem('experience', exp.id)}><Trash2 size={12} /></button>
              </div>
              <ul>
                {exp.bullets && exp.bullets.map((bullet, bIdx) => (
                  <li key={bIdx}>
                    <EditableField value={bullet} onChange={(val) => {
                      const newBullets = [...exp.bullets];
                      newBullets[bIdx] = val;
                      handleArrayChange('experience', idx, 'bullets', newBullets);
                    }} multiline />
                  </li>
                ))}
              </ul>
            </div>
          ))
        ) : null}
        <button className="add-btn" onClick={() => addItem('experience', { title: 'Title', company: 'Company', date: 'Date', bullets: ['Achievement'] })}>
          <Plus size={14} /> Add
        </button>
      </div>

      {resumeData.projects && resumeData.projects.length > 0 && (
        <div className="prof-section">
          <h2>PROJECTS</h2>
          {resumeData.projects.map((proj, idx) => (
            <div key={proj.id} className="prof-item">
              <div className="prof-item-row">
                <EditableField value={proj.name} onChange={(val) => handleArrayChange('projects', idx, 'name', val)} tag="strong" />
                <EditableField value={proj.date || ''} onChange={(val) => handleArrayChange('projects', idx, 'date', val)} />
              </div>
              <div className="prof-item-row">
                {proj.tech && <EditableField value={proj.tech} onChange={(val) => handleArrayChange('projects', idx, 'tech', val)} />}
                <button className="delete-btn" onClick={() => removeItem('projects', proj.id)}><Trash2 size={12} /></button>
              </div>
              {proj.description && !proj.bullets?.length && (
                <p><EditableField value={proj.description} onChange={(val) => handleArrayChange('projects', idx, 'description', val)} multiline /></p>
              )}
              {proj.bullets && proj.bullets.length > 0 && (
                <ul>
                  {proj.bullets.map((bullet, bIdx) => (
                    <li key={bIdx}>
                      <EditableField value={bullet} onChange={(val) => {
                        const newBullets = [...proj.bullets];
                        newBullets[bIdx] = val;
                        handleArrayChange('projects', idx, 'bullets', newBullets);
                      }} multiline />
                    </li>
                  ))}
                  {proj.links && proj.links.demo && (
                    <li style={{ color: '#2563eb' }}>
                      <strong>Demo:</strong>{' '}
                      <EditableField value={proj.links.demo} onChange={(val) => {
                        const newLinks = { ...proj.links, demo: val };
                        handleArrayChange('projects', idx, 'links', newLinks);
                      }} />
                    </li>
                  )}
                  {proj.links && proj.links.github && (
                    <li style={{ color: '#2563eb' }}>
                      <strong>GitHub:</strong>{' '}
                      <EditableField value={proj.links.github} onChange={(val) => {
                        const newLinks = { ...proj.links, github: val };
                        handleArrayChange('projects', idx, 'links', newLinks);
                      }} />
                    </li>
                  )}
                </ul>
              )}
            </div>
          ))}
          <button className="add-btn" onClick={() => addItem('projects', { name: 'Project', tech: '', date: '', description: '', bullets: [] })}>
            <Plus size={14} /> Add
          </button>
        </div>
      )}

      <div className="prof-section">
        <h2>SKILLS</h2>
        {resumeData.skills.programmingLanguages && resumeData.skills.programmingLanguages.length > 0 ? (
          <div>
            {resumeData.skills.programmingLanguages.length > 0 && (
              <div><strong>Programming Languages:</strong> <EditableField value={resumeData.skills.programmingLanguages.join(', ')} onChange={(val) => handleContentChange('skills.programmingLanguages', val.split(',').map(s => s.trim()))} /></div>
            )}
            {resumeData.skills.frameworks && resumeData.skills.frameworks.length > 0 && (
              <div><strong>Frameworks & Libraries:</strong> <EditableField value={resumeData.skills.frameworks.join(', ')} onChange={(val) => handleContentChange('skills.frameworks', val.split(',').map(s => s.trim()))} /></div>
            )}
            {resumeData.skills.databases && resumeData.skills.databases.length > 0 && (
              <div><strong>Databases:</strong> <EditableField value={resumeData.skills.databases.join(', ')} onChange={(val) => handleContentChange('skills.databases', val.split(',').map(s => s.trim()))} /></div>
            )}
            {resumeData.skills.aiml && resumeData.skills.aiml.length > 0 && (
              <div><strong>AI/ML:</strong> <EditableField value={resumeData.skills.aiml.join(', ')} onChange={(val) => handleContentChange('skills.aiml', val.split(',').map(s => s.trim()))} /></div>
            )}
            {resumeData.skills.devops && resumeData.skills.devops.length > 0 && (
              <div><strong>DevOps & Cloud:</strong> <EditableField value={resumeData.skills.devops.join(', ')} onChange={(val) => handleContentChange('skills.devops', val.split(',').map(s => s.trim()))} /></div>
            )}
            {resumeData.skills.tools && resumeData.skills.tools.length > 0 && (
              <div><strong>Tools & Others:</strong> <EditableField value={resumeData.skills.tools.join(', ')} onChange={(val) => handleContentChange('skills.tools', val.split(',').map(s => s.trim()))} /></div>
            )}
          </div>
        ) : resumeData.skills.technical && Array.isArray(resumeData.skills.technical) && resumeData.skills.technical.length > 0 ? (
          <EditableField value={resumeData.skills.technical.join(', ')} onChange={(val) => handleContentChange('skills.technical', val.split(',').map(s => s.trim()))} />
        ) : (
          <p>No skills added yet</p>
        )}
      </div>

      {resumeData.achievements && resumeData.achievements.length > 0 && (
        <div className="prof-section">
          <h2>ACHIEVEMENTS</h2>
          {resumeData.achievements.map((achievement, idx) => (
            <div key={achievement.id} className="prof-item">
              <div className="prof-item-row">
                <EditableField value={achievement.description} onChange={(val) => handleArrayChange('achievements', idx, 'description', val)} multiline />
                <button className="delete-btn" onClick={() => removeItem('achievements', achievement.id)}><Trash2 size={12} /></button>
              </div>
            </div>
          ))}
          <button className="add-btn" onClick={() => addItem('achievements', { description: 'New achievement' })}>
            <Plus size={14} /> Add
          </button>
        </div>
      )}
    </div>
  );
}

export default ProfessionalTemplate;
