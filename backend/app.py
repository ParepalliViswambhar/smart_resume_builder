from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai
from dotenv import load_dotenv
import os
import json
import sqlite3
from datetime import datetime

load_dotenv()

app = Flask(__name__)

# Configure CORS for production
ALLOWED_ORIGINS = os.getenv('ALLOWED_ORIGINS').split(',')
CORS(app, resources={
    r"/api/*": {
        "origins": ALLOWED_ORIGINS,
        "methods": ["GET", "POST", "PUT", "DELETE"],
        "allow_headers": ["Content-Type"]
    }
})

# Configure Gemini
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
model = None

if GEMINI_API_KEY and GEMINI_API_KEY.strip():
    try:
        genai.configure(api_key=GEMINI_API_KEY)
        # Use Gemini 3.1 Flash Lite - best rate limits (500 requests/day)
        model_names = [
            'gemini-3.1-flash-lite-preview' 
        ]
        
        model = None
        for model_name in model_names:
            try:
                test_model = genai.GenerativeModel(model_name)
                model = test_model
                print(f"✓ Gemini API configured successfully with model: {model_name}")
                break
            except Exception as e:
                continue
        
        if not model:
            print("✗ Could not initialize any Gemini model")
            print("  Run 'python check_models.py' to see available models")
    except Exception as e:
        print(f"✗ Gemini configuration error: {e}")
        model = None
else:
    print("✗ GEMINI_API_KEY not found in .env file")
    model = None

# Database setup
DB_PATH = os.getenv('DATABASE_PATH', 'resumes.db')

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute('''CREATE TABLE IF NOT EXISTS resumes
                 (id INTEGER PRIMARY KEY AUTOINCREMENT,
                  data TEXT NOT NULL,
                  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)''')
    conn.commit()
    conn.close()

init_db()

@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok'})

@app.route('/api/resumes', methods=['GET'])
def get_all_resumes():
    conn = get_db_connection()
    c = conn.cursor()
    c.execute('SELECT id, data, created_at, updated_at FROM resumes ORDER BY updated_at DESC')
    rows = c.fetchall()
    conn.close()
    
    resumes = []
    for row in rows:
        resumes.append({
            'id': row['id'],
            'data': json.loads(row['data']),
            'created_at': row['created_at'],
            'updated_at': row['updated_at']
        })
    
    return jsonify(resumes)

@app.route('/api/resumes/<int:resume_id>', methods=['DELETE'])
def delete_resume(resume_id):
    conn = get_db_connection()
    c = conn.cursor()
    c.execute('DELETE FROM resumes WHERE id = ?', (resume_id,))
    conn.commit()
    conn.close()
    return jsonify({'message': 'Resume deleted successfully'})

@app.route('/api/resumes', methods=['POST'])
def save_resume():
    data = request.json
    conn = get_db_connection()
    c = conn.cursor()
    c.execute('INSERT INTO resumes (data, updated_at) VALUES (?, ?)',
              (json.dumps(data), datetime.now()))
    conn.commit()
    resume_id = c.lastrowid
    conn.close()
    return jsonify({'id': resume_id, 'message': 'Resume saved successfully'})

@app.route('/api/resumes/<int:resume_id>', methods=['GET'])
def get_resume(resume_id):
    conn = get_db_connection()
    c = conn.cursor()
    c.execute('SELECT data FROM resumes WHERE id = ?', (resume_id,))
    result = c.fetchone()
    conn.close()
    if result:
        return jsonify(json.loads(result[0]))
    return jsonify({'error': 'Resume not found'}), 404

@app.route('/api/resumes/<int:resume_id>', methods=['PUT'])
def update_resume(resume_id):
    data = request.json
    conn = get_db_connection()
    c = conn.cursor()
    c.execute('UPDATE resumes SET data = ?, updated_at = ? WHERE id = ?',
              (json.dumps(data), datetime.now(), resume_id))
    conn.commit()
    conn.close()
    return jsonify({'message': 'Resume updated successfully'})

@app.route('/api/ai/improve', methods=['POST'])
def improve_content():
    data = request.json
    content = data.get('content', '')
    content_type = data.get('type', 'general')
    
    # Check if model is configured
    if not model:
        return jsonify({'error': 'Gemini API not configured. Please add GEMINI_API_KEY to backend/.env file'}), 500
    
    if not content or len(content.strip()) == 0:
        return jsonify({'error': 'No content provided'}), 400
    
    prompts = {
        'bullet': f"Improve this resume bullet point to be more impactful and quantifiable: '{content}'. Return only the improved version, no explanations.",
        'summary': f"Improve this professional summary to be more compelling: '{content}'. Return only the improved version, no explanations.",
        'skill': f"Suggest 3-5 related skills based on: '{content}'. Return as comma-separated list.",
    }
    
    prompt = prompts.get(content_type, f"Improve this resume content: '{content}'")
    
    try:
        response = model.generate_content(prompt)
        if not response or not response.text:
            return jsonify({'error': 'Empty response from AI'}), 500
        suggestion = response.text.strip()
        return jsonify({'suggestion': suggestion})
    except Exception as e:
        error_msg = str(e)
        print(f"AI Error: {error_msg}")
        return jsonify({'error': f'AI service error: {error_msg}'}), 500

@app.route('/api/ai/chat-assist', methods=['POST'])
def chat_assist():
    data = request.json
    user_message = data.get('message', '')
    resume_data = data.get('resumeData', {})
    
    if not model:
        return jsonify({'error': 'Gemini API not configured'}), 500
    
    if not user_message:
        return jsonify({'error': 'No message provided'}), 400
    
    try:
        # Create detailed context about the resume
        resume_context = f"""
Current Resume Data (JSON format):
{json.dumps(resume_data, indent=2)}
"""

        prompt = f"""You are a professional resume writing assistant with the ability to directly edit resume content.

{resume_context}

User Request: {user_message}

Analyze the request and determine if it requires:
1. EDITING the resume (add, change, update, improve, rewrite, remove, consolidate, organize)
2. ADVICE only (suggest, recommend, what should I, how can I)

If EDITING is needed, apply the requested changes directly to the resume data and return:
{{
  "response": "Friendly message explaining what you changed",
  "action": "edit",
  "updatedResume": <THE COMPLETE UPDATED RESUME JSON WITH ALL CHANGES APPLIED>
}}

IMPORTANT RULES:
- The "updatedResume" must be the COMPLETE resume JSON with the changes already applied
- Keep ALL existing fields and data intact unless the user specifically asks to change them
- When adding new items to arrays (education, projects, experience, skills), append them - do NOT remove existing items
- Each education object must have: id, degree, school, location, date, gpa
- Each project object must have: id, name, tech, date, team, bullets (array), links (object with demo and github)
- Each experience object must have: title, company, location, date, bullets (array)
- For skills, maintain the structure: {{"technical": [...], "soft": [...]}}
- Assign unique incrementing "id" values to new items in arrays

If ADVICE only is needed (no editing), return:
{{
  "response": "Your helpful advice here",
  "action": "advice"
}}

Return ONLY valid JSON, no markdown formatting."""

        print(f"AI Chat: Processing request: {user_message[:50]}...")
        response = model.generate_content(prompt)
        
        if not response or not response.text:
            return jsonify({'error': 'Empty response from AI'}), 500
        
        # Clean the response
        response_text = response.text.strip()
        
        # Remove markdown code blocks if present
        if response_text.startswith('```'):
            response_text = response_text.split('```')[1]
            if response_text.startswith('json'):
                response_text = response_text[4:]
            response_text = response_text.strip()
        
        ai_response = json.loads(response_text)
        print(f"✓ AI Chat response generated: {ai_response.get('action', 'unknown')}")
        
        # Get updated resume directly from AI response
        updated_resume = None
        if ai_response.get('action') == 'edit' and ai_response.get('updatedResume'):
            updated_resume = ai_response['updatedResume']
            print(f"✓ Updated resume received from AI")
        
        return jsonify({
            'response': ai_response.get('response', 'I can help you with that!'),
            'updatedResume': updated_resume
        })
        
    except json.JSONDecodeError as e:
        print(f"✗ JSON Parse Error: {str(e)}")
        print(f"Response was: {response.text[:200]}...")
        return jsonify({
            'response': response.text.strip() if response else 'I encountered an error parsing the response.',
            'updatedResume': None
        })
    except Exception as e:
        error_msg = str(e)
        print(f"✗ AI Chat Error: {error_msg}")
        return jsonify({'error': f'AI service error: {error_msg}'}), 500

@app.route('/api/ai/parse-skills', methods=['POST'])
def parse_skills():
    data = request.json
    skills_text = data.get('skillsText', '')
    
    if not model:
        return jsonify({'error': 'Gemini API not configured'}), 500
    
    if not skills_text or len(skills_text.strip()) < 5:
        return jsonify({'error': 'Please provide skills information'}), 400
    
    try:
        prompt = f"""Parse and categorize these skills into proper categories:

Input: {skills_text}

Rules:
1. Identify and categorize skills into these categories:
   - Programming Languages (Java, Python, C++, JavaScript, etc.)
   - Frameworks & Libraries (React, Node.js, TensorFlow, Spring Boot, etc.)
   - Databases (MySQL, MongoDB, PostgreSQL, etc.)
   - AI/ML Technologies (Deep Learning, NLP, Computer Vision, LLM, RAG, etc.)
   - DevOps & Cloud (Docker, Kubernetes, AWS, Git, CI/CD, etc.)
   - Tools & Others (any other tools or technologies)

2. Expand common abbreviations:
   - NLP → Natural Language Processing
   - RAG → Retrieval-Augmented Generation
   - CI/CD → Continuous Integration/Continuous Deployment
   - Keep well-known acronyms like AWS, SQL, HTML, CSS as is

3. Clean up formatting:
   - Remove extra spaces
   - Standardize naming (e.g., "Node.js" not "node" or "nodejs")
   - Group related items

4. If a skill appears in multiple categories, place it in the most relevant one

Return ONLY a JSON object:
{{
  "programmingLanguages": ["skill1", "skill2"],
  "frameworks": ["framework1", "framework2"],
  "databases": ["db1", "db2"],
  "aiml": ["ai1", "ai2"],
  "devops": ["tool1", "tool2"],
  "tools": ["other1", "other2"]
}}

Example:
Input: "Java, Python, node, express, AWS, MongoDB, Deep Learning, docker, NLP"
Output:
{{
  "programmingLanguages": ["Java", "Python"],
  "frameworks": ["Node.js", "Express.js"],
  "databases": ["MongoDB"],
  "aiml": ["Deep Learning", "Natural Language Processing (NLP)"],
  "devops": ["AWS", "Docker"],
  "tools": []
}}

Return ONLY the JSON object, no markdown formatting."""

        print(f"Parsing skills: {skills_text[:50]}...")
        response = model.generate_content(prompt)
        
        if not response or not response.text:
            return jsonify({'error': 'Empty response from AI'}), 500
        
        # Clean the response
        response_text = response.text.strip()
        
        # Remove markdown code blocks if present
        if response_text.startswith('```'):
            response_text = response_text.split('```')[1]
            if response_text.startswith('json'):
                response_text = response_text[4:]
            response_text = response_text.strip()
        
        parsed_skills = json.loads(response_text)
        print(f"✓ Successfully parsed and categorized skills")
        
        return jsonify(parsed_skills)
        
    except json.JSONDecodeError as e:
        print(f"✗ JSON Parse Error: {str(e)}")
        print(f"Response was: {response.text[:200]}...")
        return jsonify({'error': 'Failed to parse AI response'}), 500
    except Exception as e:
        error_msg = str(e)
        print(f"✗ AI Parse Error: {error_msg}")
        return jsonify({'error': f'AI service error: {error_msg}'}), 500

@app.route('/api/ai/parse-education', methods=['POST'])
def parse_education():
    data = request.json
    education_text = data.get('educationText', '')
    
    if not model:
        return jsonify({'error': 'Gemini API not configured'}), 500
    
    if not education_text or len(education_text.strip()) < 5:
        return jsonify({'error': 'Please provide education information'}), 400
    
    try:
        prompt = f"""Parse this education information and expand abbreviations to full forms:

Input: {education_text}

Rules:
1. Expand degree abbreviations:
   - BTech/B.Tech → Bachelor of Technology
   - BE/B.E → Bachelor of Engineering
   - BSc/B.Sc → Bachelor of Science
   - MSc/M.Sc → Master of Science
   - MTech/M.Tech → Master of Technology
   - MBA → Master of Business Administration
   
2. Expand specialization abbreviations:
   - CSE → Computer Science and Engineering
   - ECE → Electronics and Communication Engineering
   - EEE → Electrical and Electronics Engineering
   - AIML → Artificial Intelligence and Machine Learning
   - DS → Data Science
   - IT → Information Technology
   
3. Extract:
   - Full degree name with specialization
   - College/University full name (keep as is if already full)
   - Location if mentioned
   - Date/Year (format as "2023 - 2027" or "Expected 2027" for future dates)
   - GPA/CGPA if mentioned

Return ONLY a JSON object:
{{
  "degree": "Full degree name with specialization",
  "school": "Full college/university name",
  "location": "City, State (or empty if not mentioned)",
  "date": "Year range or Expected year",
  "gpa": "GPA value (or empty if not mentioned)"
}}

Example:
Input: "BTech-CSE-AIML, college KMIT, passing year-2027, cgpa:8.66"
Output:
{{
  "degree": "Bachelor of Technology in Computer Science and Engineering (Artificial Intelligence and Machine Learning)",
  "school": "KMIT",
  "location": "",
  "date": "Expected 2027",
  "gpa": "8.66/10.0"
}}

Return ONLY the JSON object, no markdown formatting."""

        print(f"Parsing education: {education_text[:50]}...")
        response = model.generate_content(prompt)
        
        if not response or not response.text:
            return jsonify({'error': 'Empty response from AI'}), 500
        
        # Clean the response
        response_text = response.text.strip()
        
        # Remove markdown code blocks if present
        if response_text.startswith('```'):
            response_text = response_text.split('```')[1]
            if response_text.startswith('json'):
                response_text = response_text[4:]
            response_text = response_text.strip()
        
        parsed_education = json.loads(response_text)
        print(f"✓ Successfully parsed education")
        
        return jsonify(parsed_education)
        
    except json.JSONDecodeError as e:
        print(f"✗ JSON Parse Error: {str(e)}")
        print(f"Response was: {response.text[:200]}...")
        return jsonify({'error': 'Failed to parse AI response'}), 500
    except Exception as e:
        error_msg = str(e)
        print(f"✗ AI Parse Error: {error_msg}")
        return jsonify({'error': f'AI service error: {error_msg}'}), 500

@app.route('/api/ai/parse-projects', methods=['POST'])
def parse_projects():
    data = request.json
    projects_text = data.get('projectsText', '')
    
    if not model:
        return jsonify({'error': 'Gemini API not configured'}), 500
    
    if not projects_text or len(projects_text.strip()) < 10:
        return jsonify({'error': 'Please provide project information'}), 400
    
    try:
        prompt = f"""You are a resume parser. Parse the following project descriptions into a structured JSON array.

Project Text:
{projects_text}

Each project should have:
- name: The project title/name
- tech: Technologies/tools used (comma-separated)
- date: Year or date range
- team: Team size if mentioned (e.g., "Team of 7" or empty string)
- bullets: Array of achievement/description bullet points
- links: Object with demo and github URLs if mentioned

Rules:
1. Each project starts with a title (usually followed by | for tech stack)
2. Technologies are usually after | or listed with commas
3. Bullet points start with • or -
4. Extract year/date from the text
5. Links are usually labeled as "Live Demo:", "GitHub:", "Demo:", etc.
6. Combine related information into single project entries
7. Clean up formatting and remove duplicate information

Return ONLY a valid JSON array like this:
[
  {{
    "name": "Project Name",
    "tech": "Tech1, Tech2, Tech3",
    "date": "2024",
    "team": "Team of 7",
    "bullets": [
      "Achievement 1",
      "Achievement 2"
    ],
    "links": {{
      "demo": "url or empty string",
      "github": "url or empty string"
    }}
  }}
]

Return ONLY the JSON array, no markdown formatting or explanations."""

        print(f"Parsing projects ({len(projects_text)} characters)...")
        response = model.generate_content(prompt)
        
        if not response or not response.text:
            return jsonify({'error': 'Empty response from AI'}), 500
        
        # Clean the response
        response_text = response.text.strip()
        
        # Remove markdown code blocks if present
        if response_text.startswith('```'):
            response_text = response_text.split('```')[1]
            if response_text.startswith('json'):
                response_text = response_text[4:]
            response_text = response_text.strip()
        
        parsed_projects = json.loads(response_text)
        print(f"✓ Successfully parsed {len(parsed_projects)} projects")
        
        return jsonify({'projects': parsed_projects})
        
    except json.JSONDecodeError as e:
        print(f"✗ JSON Parse Error: {str(e)}")
        print(f"Response was: {response.text[:200]}...")
        return jsonify({'error': 'Failed to parse AI response. Please try again.'}), 500
    except Exception as e:
        error_msg = str(e)
        print(f"✗ AI Parse Error: {error_msg}")
        return jsonify({'error': f'AI service error: {error_msg}'}), 500

@app.route('/api/ai/parse-resume', methods=['POST'])
def parse_resume_content():
    data = request.json
    raw_content = data.get('content', '')
    
    if not model:
        return jsonify({'error': 'Gemini API not configured'}), 500
    
    if not raw_content or len(raw_content.strip()) < 50:
        return jsonify({'error': 'Please provide more content (at least 50 characters)'}), 400
    
    try:
        prompt = f"""You are a professional resume writer. Analyze the following content and extract structured resume information.

Content:
{raw_content}

Parse this content and return a JSON object with the following structure:
{{
  "personalInfo": {{
    "name": "extracted name or 'Not provided'",
    "email": "extracted email or ''",
    "phone": "extracted phone or ''",
    "location": "extracted location or ''",
    "linkedin": "extracted linkedin or ''",
    "github": "extracted github or ''",
    "website": "extracted website or ''"
  }},
  "summary": "A professional 2-3 sentence summary based on the content",
  "education": [
    {{
      "degree": "degree name",
      "school": "school name",
      "location": "location",
      "date": "date range",
      "gpa": "gpa if mentioned"
    }}
  ],
  "experience": [
    {{
      "title": "job title",
      "company": "company name",
      "location": "location",
      "date": "date range",
      "bullets": ["achievement 1", "achievement 2"]
    }}
  ],
  "projects": [
    {{
      "name": "project name",
      "tech": "technologies used",
      "date": "year",
      "bullets": ["description 1", "description 2"]
    }}
  ],
  "skills": {{
    "technical": ["skill1", "skill2"],
    "soft": ["skill1", "skill2"]
  }},
  "suggestions": {{
    "summary": "Suggestion to improve the summary",
    "experience": ["Suggestion for experience section"],
    "projects": ["Suggestion for projects section"],
    "skills": ["Suggested additional skills based on content"],
    "overall": "Overall feedback and recommendations"
  }}
}}

Important:
- Extract all information you can find
- For missing information, use empty strings or empty arrays
- Make bullet points impactful and quantifiable
- Provide helpful suggestions for improvement
- Return ONLY valid JSON, no markdown formatting or explanations"""

        print(f"Parsing resume content ({len(raw_content)} characters)...")
        response = model.generate_content(prompt)
        
        if not response or not response.text:
            return jsonify({'error': 'Empty response from AI'}), 500
        
        # Clean the response to extract JSON
        response_text = response.text.strip()
        
        # Remove markdown code blocks if present
        if response_text.startswith('```'):
            response_text = response_text.split('```')[1]
            if response_text.startswith('json'):
                response_text = response_text[4:]
            response_text = response_text.strip()
        
        parsed_data = json.loads(response_text)
        print(f"✓ Successfully parsed resume content")
        
        return jsonify(parsed_data)
        
    except json.JSONDecodeError as e:
        print(f"✗ JSON Parse Error: {str(e)}")
        print(f"Response was: {response.text[:200]}...")
        return jsonify({'error': 'Failed to parse AI response. Please try again.'}), 500
    except Exception as e:
        error_msg = str(e)
        print(f"✗ AI Parse Error: {error_msg}")
        return jsonify({'error': f'AI service error: {error_msg}'}), 500

@app.route('/api/ai/generate', methods=['POST'])
def generate_content():
    data = request.json
    user_data = data.get('userData', {})
    
    # Check if model is configured
    if not model:
        print("✗ Gemini model not configured")
        return jsonify({'error': 'Gemini API not configured. Please add GEMINI_API_KEY to backend/.env file'}), 500
    
    try:
        # Generate professional summary
        name = user_data.get('name', 'Professional')
        degree = user_data.get('degree', '')
        skills = user_data.get('skills', '')
        experience = user_data.get('experience', '')
        
        summary_prompt = f"""Create a professional summary for a resume based on this information:
Name: {name}
Education: {degree}
Skills: {skills}
Experience: {experience}

Write a compelling 2-3 sentence professional summary. Return only the summary text, no extra formatting."""
        
        print(f"Generating summary for: {name}")
        response = model.generate_content(summary_prompt)
        
        if not response or not response.text:
            print("✗ Empty response from Gemini")
            return jsonify({'summary': f'{name} is a motivated professional with expertise in {skills.split(",")[0] if skills else "technology"}. Passionate about creating innovative solutions and continuous learning.'}), 200
        
        summary = response.text.strip()
        print(f"✓ Generated summary: {summary[:50]}...")
        return jsonify({'summary': summary})
    except Exception as e:
        error_msg = str(e)
        print(f"✗ AI Error: {error_msg}")
        # Return a fallback summary instead of error
        fallback = f'Motivated professional with strong technical skills and a passion for innovation. Experienced in software development with a focus on creating efficient and scalable solutions.'
        return jsonify({'summary': fallback}), 200

if __name__ == '__main__':
    print("\n" + "="*60)
    print("Smart Resume Builder - Backend Server")
    print("="*60)
    if model:
        print("✓ Gemini AI: ENABLED")
        print("  Model: Gemini 3.1 Flash Lite Preview")
        print("  Rate Limit: 500 requests/day (generous for development)")
    else:
        print("✗ Gemini AI: DISABLED (Add GEMINI_API_KEY to .env)")
    port = int(os.getenv('PORT', 5000))
    print(f"✓ Server running on port: {port}")
    print("="*60 + "\n")
    app.run(host='0.0.0.0', port=port, debug=os.getenv('FLASK_ENV') != 'production')
