import React, { useState } from 'react';
import './Toolbar.css';
import { Download, Save, ArrowLeft, Sparkles } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import API_URL from '../config';
import API_URL from '../config';

function Toolbar({ resumeData, resumeId, onBack }) {
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      if (resumeId) {
        // Update existing resume
        await fetch(`${API_URL}/api/resumes/${resumeId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(resumeData)
        });
        alert('Resume updated successfully!');
      } else {
        // Create new resume
        const response = await fetch(`${API_URL}/api/resumes`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(resumeData)
        });
        const data = await response.json();
        alert(`Resume saved! ID: ${data.id}`);
      }
    } catch (error) {
      alert('Failed to save resume');
    }
    setSaving(false);
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const element = document.getElementById('resume-content');
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save('resume.pdf');
    } catch (error) {
      alert('Failed to export PDF');
    }
    setExporting(false);
  };

  return (
    <div className="toolbar">
      <div className="toolbar-content">
        <button className="toolbar-btn back-btn" onClick={onBack}>
          <ArrowLeft size={20} />
          <span>Back</span>
        </button>
        
        <div className="toolbar-actions">
          <button className="toolbar-btn" onClick={handleSave} disabled={saving}>
            <Save size={20} />
            <span>{saving ? 'Saving...' : 'Save Draft'}</span>
          </button>
          
          <button className="toolbar-btn primary" onClick={handleExport} disabled={exporting}>
            <Download size={20} />
            <span>{exporting ? 'Exporting...' : 'Export PDF'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default Toolbar;
