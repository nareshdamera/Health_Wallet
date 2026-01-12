import React, { useState, useEffect } from 'react';
import api from './api';
import VitalsChart from './components/VitalsChart';
import ReportsTable from './components/ReportsTable';
import FileUpload from './components/FileUpload';
import Login from './components/Login';

/**
 * App.jsx - Main Application Controller
 * Handles authentication state, role-based conditional rendering,
 * and global data fetching for both Patient and Viewer roles.
 */
function App() {
  // 1. Session Management: Load user from localStorage to persist login state
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));
  
  // 2. Data State
  const [vitals, setVitals] = useState([]);
  const [reports, setReports] = useState([]);
  
  // 3. Search & View State
  const [searchId, setSearchId] = useState(''); // Patient ID entered by a 'Viewer'
  const [viewingPatientId, setViewingPatientId] = useState(null); // The ID currently being displayed

  /**
   * Fetch health data (vitals and reports) from the backend for a specific user ID
   * @param {string|number} targetId - The ID of the patient to retrieve records for
   */
  const fetchData = async (targetId) => {
    if (!targetId) return;
    try {
      // Requirements: Retrieve reports and vitals
      const [vitalsRes, reportsRes] = await Promise.all([
        api.get(`/vitals/${targetId}`),
        api.get(`/reports/${targetId}`)
      ]);
      setVitals(vitalsRes.data);
      setReports(reportsRes.data);
    } catch (err) {
      console.error("Error loading data", err);
      // We avoid disruptive alerts here to maintain a clean UI during search
    }
  };

  /**
   * Effect: Automatically load data if the logged-in user is a patient
   */
  useEffect(() => {
    if (user && user.role === 'patient') {
      setViewingPatientId(user.userId);
      fetchData(user.userId);
    }
  }, [user]);

  /**
   * Clears the session and resets all states to return to the Login screen
   */
  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    setVitals([]);
    setReports([]);
    setViewingPatientId(null);
    setSearchId('');
  };

  /**
   * Handler for the Viewer's search form
   */
  const handlePatientSearch = (e) => {
    e.preventDefault();
    if (!searchId) return;
    setViewingPatientId(searchId);
    fetchData(searchId);
  };

  // Guard: If no user is authenticated, render the Login/Register component
  if (!user) {
    return <Login onLogin={(userData) => setUser(userData)} />;
  }

  return (
    <div style={styles.appContainer}>
      {/* HEADER SECTION: Displays User Name and Role */}
      <header style={styles.header}>
        <div style={styles.brandGroup}>
          <h1 style={styles.appTitle}>🏥 Health Wallet</h1>
          <p style={styles.welcomeText}>
            Welcome, <strong>{user.name || "User"}</strong>
            <span style={styles.roleBadge}>{user.role}</span>
          </p>
        </div>
        <button onClick={handleLogout} style={styles.logoutBtn}>
          Logout
        </button>
      </header>

      {/* ROLE 2 (Viewer/Other): Search Interface */}
      {user.role === 'viewer' && (
        <section style={styles.searchSection}>
          <h3 style={styles.sectionTitle}>🔍 Search Patient Data</h3>
          <form onSubmit={handlePatientSearch} style={styles.searchForm}>
            <input 
              type="text" 
              placeholder="Enter Patient ID (e.g., 1)" 
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              style={styles.searchInput}
            />
            <button type="submit" style={styles.searchBtn}>
              View Records
            </button>
          </form>
        </section>
      )}

      {/* MAIN CONTENT AREA */}
      <div style={styles.mainGrid}>
        {/* ROLE 1 (Patient): File Upload */}
        {user.role === 'patient' && (
          <FileUpload 
            userId={user.userId} 
            onUploadSuccess={() => fetchData(user.userId)} 
          />
        )}

        {/* VITALS TREND: Visible for both roles once a patient is selected */}
        {viewingPatientId && vitals.length > 0 && (
          <VitalsChart data={vitals} />
        )}
      </div>

      {/* REPORTS HISTORY: Visible for both roles */}
      {viewingPatientId && (
        <ReportsTable 
          reports={reports} 
          isReadOnly={user.role === 'viewer'} 
          onRefresh={() => fetchData(viewingPatientId)} 
        />
      )}
      
      {/* Search Prompt for Viewers */}
      {!viewingPatientId && user.role === 'viewer' && (
        <div style={styles.emptyState}>
          <p>Please enter a Patient ID above to retrieve medical records.</p>
        </div>
      )}
    </div>
  );
}

// Internal CSS styles for App.jsx
const styles = {
  appContainer: {
    padding: '20px',
    width: '100%',
    minHeight: '100vh',
    boxSizing: 'border-box',
    fontFamily: "'Inter', sans-serif",
    backgroundColor: '#f4f7f6'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '40px',
    padding: '0 10px'
  },
  brandGroup: { textAlign: 'left' },
  appTitle: { color: '#2c3e50', fontSize: '2rem', margin: 0 },
  welcomeText: { color: '#7f8c8d', margin: '5px 0 0 0', display: 'flex', alignItems: 'center', gap: '8px' },
  roleBadge: {
    fontSize: '0.7rem',
    backgroundColor: '#dcdde1',
    color: '#2f3640',
    padding: '2px 10px',
    borderRadius: '12px',
    textTransform: 'uppercase',
    fontWeight: 'bold'
  },
  logoutBtn: {
    padding: '10px 20px',
    backgroundColor: '#e74c3c',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 'bold',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  },
  searchSection: {
    marginBottom: '30px',
    background: 'white',
    padding: '25px',
    borderRadius: '15px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.05)'
  },
  sectionTitle: { margin: '0 0 15px 0', color: '#34495e' },
  searchForm: { display: 'flex', gap: '15px' },
  searchInput: {
    flex: 1,
    padding: '12px',
    borderRadius: '8px',
    border: '1px solid #dfe6e9',
    fontSize: '1rem'
  },
  searchBtn: {
    padding: '12px 25px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600'
  },
  mainGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
    gap: '25px',
    marginBottom: '30px'
  },
  emptyState: {
    textAlign: 'center',
    marginTop: '60px',
    color: '#bdc3c7',
    fontSize: '1.1rem'
  }
};

export default App;
// import React, { useState, useEffect } from 'react';
// import api from './api';
// import VitalsChart from './components/VitalsChart';
// import ReportsTable from './components/ReportsTable';
// import FileUpload from './components/FileUpload';
// import Login from './components/Login';

// function App() {
//   const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));
//   const [vitals, setVitals] = useState([]);
//   const [reports, setReports] = useState([]);
//   const [searchId, setSearchId] = useState('');
//   const [viewingPatientId, setViewingPatientId] = useState(null);

//   // const fetchData = async (targetId) => {
//   //   if (!targetId) return;
//   //   try {
//   //     const [vitalsRes, reportsRes] = await Promise.all([
//   //       api.get(`/vitals/${targetId}`),
//   //       api.get(`/reports/${targetId}`)
//   //     ]);
//   //     setVitals(vitalsRes.data);
//   //     setReports(reportsRes.data);
//   //   } catch (err) {
//   //     console.error("Error loading data", err);
//   //     alert("Could not find patient data. Please check the ID.");
//   //   }
//   // };
//   const fetchData = async (targetId) => {
//     if (!targetId) return;
//     try {
//       const [vitalsRes, reportsRes] = await Promise.all([
//         api.get(`/vitals/${targetId}`),
//         api.get(`/reports/${targetId}`)
//       ]);
//       setVitals(vitalsRes.data);
//       setReports(reportsRes.data);
//     } catch (err) {
//       console.error("Error loading data", err);
//       // alert("Could not find patient data. Please check the ID.");
//     }
//   };

//   useEffect(() => {
//     if (user) {
//       if (user.role === 'patient') {
//         setViewingPatientId(user.userId);
//         fetchData(user.userId);
//       }
//     }
//   }, [user]);

//   const handleLogout = () => {
//     localStorage.removeItem('user');
//     setUser(null);
//     setVitals([]);
//     setReports([]);
//     setViewingPatientId(null);
//   };

//   const handlePatientSearch = (e) => {
//     e.preventDefault();
//     setViewingPatientId(searchId);
//     fetchData(searchId);
//   };

//   if (!user) {
//     return <Login onLogin={(userData) => setUser(userData)} />;
//   }

//   return (
//     <div style={{ padding: '20px', width: '100%', minHeight: '100vh', boxSizing: 'border-box', fontFamily: 'Inter, sans-serif', backgroundColor: '#f4f7f6' }}>
//       <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px', padding: '0 20px' }}>
//         <div style={{ textAlign: 'left' }}>
//           <h1 style={{ color: '#2c3e50', fontSize: '2rem', margin: 0 }}>🏥 Health Wallet</h1>
//           {/* Change: Displaying Name instead of Email */}
//           <p style={{ color: '#7f8c8d', margin: '5px 0 0 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
//             Welcome, <strong>{user.name || "User"}</strong>
//             <span style={{ 
//               fontSize: '0.75rem', 
//               backgroundColor: '#e0e0e0', 
//               padding: '2px 8px', 
//               borderRadius: '12px',
//               textTransform: 'capitalize',
//               fontWeight: '600'
//             }}>
//               {user.role}
//             </span>
//           </p>
//         </div>
//         <button onClick={handleLogout} style={{ padding: '8px 16px', backgroundColor: '#e74c3c', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
//           Logout
//         </button>
//       </header>

//       {user.role === 'viewer' && (
//         <section style={{ marginBottom: '30px', background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
//           <h3>🔍 Search Patient Data</h3>
//           <form onSubmit={handlePatientSearch} style={{ display: 'flex', gap: '10px' }}>
//             <input 
//               type="text" 
//               placeholder="Enter Patient ID" 
//               value={searchId}
//               onChange={(e) => setSearchId(e.target.value)}
//               style={{ flex: 1, padding: '10px', borderRadius: '5px', border: '1px solid #ddd' }}
//             />
//             <button type="submit" style={{ padding: '10px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
//               View Records
//             </button>
//           </form>
//         </section>
//       )}

//       <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px', marginBottom: '30px' }}>
//         {user.role === 'patient' && (
//           <FileUpload userId={user.userId} onUploadSuccess={() => fetchData(user.userId)} />
//         )}
//         {viewingPatientId && <VitalsChart data={vitals} />}
//       </div>

//       {viewingPatientId && (
//         <ReportsTable 
//           reports={reports} 
//           isReadOnly={user.role === 'viewer'} 
//         />
//       )}
      
//       {!viewingPatientId && user.role === 'viewer' && (
//         <div style={{ textAlign: 'center', marginTop: '50px', color: '#95a5a6' }}>
//           <p>Please enter a Patient ID above to retrieve medical records.</p>
//         </div>
//       )}
//     </div>
//   );
// }

// export default App;