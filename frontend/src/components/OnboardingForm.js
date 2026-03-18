import React, { useState } from 'react';
import './OnboardingForm.css';
import { ArrowRight, ArrowLeft, Sparkles } from 'lucide-react';
import API_URL from '../config';

function OnboardingForm({ template, onComplete, onBack, onUseParser }) {
  const [step, setStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    linkedin: '',
    github: '',
    website: '',
    degree: '',
    school: '',
    graduationYear: '',
    gpa: '',
    skills: '',
    experience: '',
    projects: '',
    achievements: ''
  });

  const updateField = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const nextStep = () => {
    if (step < 4) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async () => {
    setIsGenerating(true);
    
    // Parse education with AI if provided
    let parsedEducation = [];
    
    if (formData.degree || formData.school) {
      try {
        const educationText = `${formData.degree} from ${formData.school}, ${formData.graduationYear}, GPA: ${formData.gpa}`;
        const response = await fetch(`${API_URL}/api/ai/parse-education`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ educationText })
        });
        
        if (response.ok) {
          const data = await response.json();
          parsedEducation = [{
            id: 1,
            degree: data.degree || formData.degree,
            school: data.school || formData.school,
            location: data.location || formData.location || 'City, State',
            date: data.date || formData.graduationYear || '2020 - 2024',
            gpa: data.gpa || formData.gpa || ''
          }];
        }
      } catch (error) {
        console.log('AI education parsing failed, using fallback');
      }
    }
    
    // Fallback to manual parsing
    if (parsedEducation.length === 0) {
      parsedEducation = [{
        id: 1,
        degree: formData.degree || 'Bachelor of Science',
        school: formData.school || 'University Name',
        location: formData.location || 'City, State',
        date: formData.graduationYear || '2020 - 2024',
        gpa: formData.gpa || '3.8/4.0'
      }];
    }

    // Parse skills with AI if provided
    let parsedSkills = {
      programmingLanguages: [],
      frameworks: [],
      databases: [],
      aiml: [],
      devops: [],
      tools: [],
      soft: ['Communication', 'Problem Solving', 'Team Collaboration']
    };
    
    if (formData.skills && formData.skills.trim().length > 0) {
      try {
        const response = await fetch(`${API_URL}/api/ai/parse-skills`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ skillsText: formData.skills })
        });
        
        if (response.ok) {
          const data = await response.json();
          parsedSkills = {
            programmingLanguages: data.programmingLanguages || [],
            frameworks: data.frameworks || [],
            databases: data.databases || [],
            aiml: data.aiml || [],
            devops: data.devops || [],
            tools: data.tools || [],
            soft: ['Communication', 'Problem Solving', 'Team Collaboration']
          };
        }
      } catch (error) {
        console.log('AI skills parsing failed, using fallback');
      }
    }
    
    // Fallback to simple parsing
    if (parsedSkills.programmingLanguages.length === 0 && formData.skills) {
      parsedSkills = {
        technical: formData.skills.split(',').map(s => s.trim()).filter(s => s),
        soft: ['Communication', 'Problem Solving', 'Team Collaboration']
      };
    }

    // Parse projects with AI if there's complex content
    let parsedProjects = [];
    
    if (formData.projects && formData.projects.trim().length > 0) {
      try {
        const response = await fetch(`${API_URL}/api/ai/parse-projects`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ projectsText: formData.projects })
        });
        
        if (response.ok) {
          const data = await response.json();
          parsedProjects = data.projects.map((proj, idx) => ({
            id: idx + 1,
            name: proj.name,
            tech: proj.tech || '',
            date: proj.date || new Date().getFullYear().toString(),
            team: proj.team || '',
            description: '',
            bullets: proj.bullets || [],
            links: proj.links || { demo: '', github: '' }
          }));
        }
      } catch (error) {
        console.log('AI project parsing failed, using fallback');
      }
    }
    
    // Fallback to simple parsing if AI fails or no projects
    if (parsedProjects.length === 0 && formData.projects) {
      parsedProjects = formData.projects.split('\n').filter(p => p.trim()).map((proj, idx) => {
        const projectLine = proj.trim();
        let projectName = projectLine;
        let projectDesc = '';
        
        if (projectLine.includes(' - ')) {
          const parts = projectLine.split(' - ');
          projectName = parts[0].trim();
          projectDesc = parts.slice(1).join(' - ').trim();
        }
        
        return {
          id: idx + 1,
          name: projectName,
          tech: formData.skills ? formData.skills.split(',').slice(0, 3).join(', ') : '',
          date: new Date().getFullYear().toString(),
          team: '',
          description: projectDesc,
          bullets: projectDesc ? [projectDesc] : [],
          links: { demo: '', github: '' }
        };
      });
    }
    
    // Default project if none provided
    if (parsedProjects.length === 0) {
      parsedProjects = [{
        id: 1,
        name: 'Project Name',
        tech: 'Technologies Used',
        date: new Date().getFullYear().toString(),
        team: '',
        description: '',
        bullets: ['Describe what you built and the impact'],
        links: { demo: '', github: '' }
      }];
    }

    // Generate AI summary
    let aiSummary = 'Professional with experience in software development and a passion for creating innovative solutions.';
    
    try {
      const response = await fetch(`${API_URL}/api/ai/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userData: formData })
      });
      const data = await response.json();
      if (data.summary) {
        aiSummary = data.summary;
      }
    } catch (error) {
      console.log('AI generation failed, using default');
    }

    // Transform form data to resume structure
    const resumeData = {
      template: template,
      personalInfo: {
        name: formData.name || 'Your Name',
        email: formData.email || 'your.email@example.com',
        phone: formData.phone || '+1 (555) 123-4567',
        location: formData.location || 'City, State',
        linkedin: formData.linkedin || 'linkedin.com/in/yourprofile',
        github: formData.github || 'github.com/yourusername',
        website: formData.website || 'yourwebsite.com'
      },
      summary: aiSummary,
      education: parsedEducation,
      experience: formData.experience ? formData.experience.split('\n').filter(e => e.trim()).map((exp, idx) => ({
        id: idx + 1,
        title: exp.trim(),
        company: 'Company Name',
        location: 'City, State',
        date: 'Month Year - Month Year',
        bullets: ['Add your achievements and responsibilities here']
      })) : [{
        id: 1,
        title: 'Job Title',
        company: 'Company Name',
        location: 'City, State',
        date: 'Month Year - Month Year',
        bullets: ['Add your achievements and responsibilities here']
      }],
      projects: parsedProjects,
      skills: parsedSkills,
      achievements: formData.achievements ? formData.achievements.split('\n').filter(a => a.trim()).map((achievement, idx) => ({
        id: idx + 1,
        description: achievement.trim()
      })) : [],
      customSections: []
    };

    onComplete(resumeData);
    setIsGenerating(false);
  };

  const renderStep = () => {
    switch(step) {
      case 1:
        return (
          <div className="form-step">
            <h2>Personal Information</h2>
            <p className="step-description">Let's start with your basic details</p>
            
            <div className="form-group">
              <label>Full Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => updateField('name', e.target.value)}
                placeholder="John Doe"
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => updateField('email', e.target.value)}
                  placeholder="john@example.com"
                />
              </div>
              <div className="form-group">
                <label>Phone *</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => updateField('phone', e.target.value)}
                  placeholder="+1 (555) 123-4567"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Location</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => updateField('location', e.target.value)}
                placeholder="San Francisco, CA"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>LinkedIn</label>
                <input
                  type="text"
                  value={formData.linkedin}
                  onChange={(e) => updateField('linkedin', e.target.value)}
                  placeholder="linkedin.com/in/johndoe"
                />
              </div>
              <div className="form-group">
                <label>GitHub</label>
                <input
                  type="text"
                  value={formData.github}
                  onChange={(e) => updateField('github', e.target.value)}
                  placeholder="github.com/johndoe"
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="form-step">
            <h2>Education</h2>
            <p className="step-description">Tell us about your educational background</p>
            
            <div className="form-group">
              <label>Degree *</label>
              <input
                type="text"
                value={formData.degree}
                onChange={(e) => updateField('degree', e.target.value)}
                placeholder="Bachelor of Science in Computer Science"
              />
            </div>

            <div className="form-group">
              <label>School/University *</label>
              <input
                type="text"
                value={formData.school}
                onChange={(e) => updateField('school', e.target.value)}
                placeholder="Stanford University"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Graduation Year</label>
                <input
                  type="text"
                  value={formData.graduationYear}
                  onChange={(e) => updateField('graduationYear', e.target.value)}
                  placeholder="2024"
                />
              </div>
              <div className="form-group">
                <label>GPA (Optional)</label>
                <input
                  type="text"
                  value={formData.gpa}
                  onChange={(e) => updateField('gpa', e.target.value)}
                  placeholder="3.8/4.0"
                />
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="form-step">
            <h2>Skills & Experience</h2>
            <p className="step-description">What are you good at?</p>
            
            <div className="form-group">
              <label>Technical Skills *</label>
              <input
                type="text"
                value={formData.skills}
                onChange={(e) => updateField('skills', e.target.value)}
                placeholder="JavaScript, React, Python, Node.js, SQL (comma-separated)"
              />
              <small>Separate skills with commas</small>
            </div>

            <div className="form-group">
              <label>Work Experience (Optional)</label>
              <textarea
                value={formData.experience}
                onChange={(e) => updateField('experience', e.target.value)}
                placeholder="Software Engineer Intern at Google&#10;Frontend Developer at Startup"
                rows="4"
              />
              <small>One position per line</small>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="form-step">
            <h2>Projects & Achievements</h2>
            <p className="step-description">Showcase your best work</p>
            
            <div className="form-group">
              <label>Projects</label>
              <textarea
                value={formData.projects}
                onChange={(e) => updateField('projects', e.target.value)}
                placeholder="Paste your projects here in any format. AI will understand and organize them.

Example formats:
• Simple: Project Name - Description
• Detailed: Copy-paste from your existing resume with bullets, tech stack, dates, links, etc.

The AI will automatically extract:
- Project names
- Technologies used
- Dates/years
- Team size
- Bullet points
- Demo/GitHub links"
                rows="8"
              />
              <small>Paste your projects in any format - AI will parse and organize them intelligently</small>
            </div>

            <div className="form-group">
              <label>Key Achievements (Optional)</label>
              <textarea
                value={formData.achievements}
                onChange={(e) => updateField('achievements', e.target.value)}
                placeholder="Won first place in university hackathon&#10;Published research paper on machine learning&#10;Led team of 5 developers on capstone project"
                rows="4"
              />
              <small>One achievement per line</small>
            </div>

            <div className="ai-notice">
              <Sparkles size={20} />
              <span>AI will intelligently parse your projects and generate a professional summary</span>
            </div>

            <button 
              className="smart-parse-btn"
              onClick={() => onUseParser && onUseParser()}
              type="button"
            >
              <Sparkles size={18} />
              Or paste your entire resume and let AI organize everything
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="onboarding-overlay">
      <div className="onboarding-container">
        <div className="onboarding-header">
          <h1>Let's Build Your Resume</h1>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${(step / 4) * 100}%` }}></div>
          </div>
          <p className="step-indicator">Step {step} of 4</p>
        </div>

        <div className="onboarding-content">
          {renderStep()}
        </div>

        <div className="onboarding-actions">
          <button className="btn-secondary" onClick={step === 1 ? onBack : prevStep}>
            <ArrowLeft size={18} />
            {step === 1 ? 'Back to Templates' : 'Previous'}
          </button>
          
          {step < 4 ? (
            <button className="btn-primary" onClick={nextStep}>
              Next
              <ArrowRight size={18} />
            </button>
          ) : (
            <button 
              className="btn-primary" 
              onClick={handleSubmit}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <>
                  <span className="spinner"></span>
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  Generate Resume
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default OnboardingForm;
