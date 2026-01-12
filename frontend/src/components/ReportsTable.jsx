import React, { useState } from 'react';
import api from '../api';
import { Trash2, Share2, Eye, Download } from 'lucide-react'; // Added Trash2

const ReportsTable = ({ reports, isReadOnly, onRefresh }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const BACKEND_BASE_URL = 'http://localhost:5000';

  const handleShare = async (reportId) => {
    const email = prompt("Enter the email/ID of the person to share with:");
    if (!email) return;

    try {
      await api.post('/share', { reportId, sharedWith: email });
      alert("Access granted successfully!");
    } catch (err) {
      alert("Error sharing report.");
    }
  };

  // --- NEW: Delete Logic ---
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this report? This will also remove its extracted vitals.")) return;
    
    try {
      await api.delete(`/reports/${id}`);
      alert("Report deleted successfully");
      if (onRefresh) onRefresh(); // Refresh the list in App.jsx
    } catch (err) {
      console.error("Delete error:", err);
      alert("Error deleting report.");
    }
  };

  const filteredReports = reports.filter(r => 
    r.upload_date.includes(searchTerm) || r.report_type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ marginTop: '30px', background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
      <h3>📄 Medical Reports History</h3>
      
      <input 
        type="text" 
        placeholder="Search by date (YYYY-MM-DD) or type..." 
        style={{ width: '100%', padding: '10px', marginBottom: '20px', borderRadius: '5px', border: '1px solid #ddd' }}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ textAlign: 'left', borderBottom: '2px solid #eee' }}>
            <th style={{ padding: '10px' }}>Date</th>
            <th>Type</th>
            <th>File Access</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredReports.map(report => (
            <tr key={report.id} style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: '10px' }}>{new Date(report.upload_date).toLocaleDateString()}</td>
              <td>{report.report_type}</td>
              <td>
                <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                  <a href={`${BACKEND_BASE_URL}/${report.file_url}`} target="_blank" rel="noopener noreferrer" title="View">
                    <Eye size={20} color="#007bff" />
                  </a>
                  <a href={`${BACKEND_BASE_URL}/${report.file_url}`} download title="Download">
                    <Download size={20} color="#6c757d" />
                  </a>
                </div>
              </td>
              <td>
                <div style={{ display: 'flex', gap: '10px' }}>
                  {!isReadOnly ? (
                    <>
                      <button 
                        onClick={() => handleShare(report.id)}
                        style={{ background: '#28a745', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}
                      >
                        <Share2 size={16} /> Share
                      </button>
                      <button 
                        onClick={() => handleDelete(report.id)}
                        style={{ background: '#e74c3c', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}
                      >
                        <Trash2 size={16} /> Delete
                      </button>
                    </>
                  ) : (
                    <span style={{ color: '#95a5a6', fontSize: '0.9rem' }}>Read Only</span>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ReportsTable;