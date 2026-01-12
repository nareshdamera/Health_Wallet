import React, { useState } from 'react';
import api from '../api';

const FileUpload = ({ userId, onUploadSuccess }) => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    if (!file) return alert("Please select a file!");
    setLoading(true);

    const formData = new FormData();
    formData.append('report', file);
    formData.append('userId', userId);

    try {
      await api.post('/upload', formData);
      alert("Extraction Complete!");
      setFile(null);
      onUploadSuccess(); // Triggers refresh in App.jsx
    } catch (error) {
      alert("Upload error. Check backend console.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section style={{ background: '#f9f9f9', padding: '20px', borderRadius: '12px', marginBottom: '30px' }}>
      <h3>📤 Upload Medical Report</h3>
      <input type="file" onChange={(e) => setFile(e.target.files[0])} style={{ marginBottom: '10px' }} />
      <br />
      <button 
        onClick={handleUpload} 
        disabled={loading}
        style={{ padding: '10px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
      >
        {loading ? "Scanning with OCR..." : "Scan Report"}
      </button>
    </section>
  );
};

export default FileUpload;