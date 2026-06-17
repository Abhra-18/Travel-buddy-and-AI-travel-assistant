import { useState, useEffect } from 'react';
import API from '../../services/api';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('verifications'); // 'verifications' or 'reports'
  
  const [verifications, setVerifications] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchVerifications = async () => {
    try {
      const { data } = await API.get('/admin/verifications');
      setVerifications(data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load verifications');
    }
  };

  const fetchReports = async () => {
    try {
      const { data } = await API.get('/admin/reports');
      setReports(data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load reports');
    }
  };

  useEffect(() => {
    setLoading(true);
    setError('');
    if (activeTab === 'verifications') {
      fetchVerifications().finally(() => setLoading(false));
    } else {
      fetchReports().finally(() => setLoading(false));
    }
  }, [activeTab]);

  const handleVerifyAction = async (userId, action) => {
    try {
      await API.put(`/admin/verify/${userId}/${action}`);
      setVerifications(verifications.filter(v => v._id !== userId));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to process verification');
    }
  };

  const handleReportAction = async (reportId, action) => {
    try {
      await API.post(`/admin/reports/${reportId}/resolve`, { action });
      if (action === 'dismiss') {
        setReports(reports.filter(r => r._id !== reportId));
      } else {
        // If banned, maybe remove all reports for that user
        const bannedReport = reports.find(r => r._id === reportId);
        if (bannedReport) {
          setReports(reports.filter(r => r.reportedUser?._id !== bannedReport.reportedUser?._id));
        }
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to process report');
    }
  };

  return (
    <div className="admin-container">
      <h1 style={{ marginBottom: '2rem' }}>Admin Dashboard</h1>
      
      <div className="admin-tabs">
        <button 
          className={`admin-tab ${activeTab === 'verifications' ? 'active' : ''}`}
          onClick={() => setActiveTab('verifications')}
        >
          Pending Verifications ({activeTab === 'verifications' ? verifications.length : '...'})
        </button>
        <button 
          className={`admin-tab ${activeTab === 'reports' ? 'active' : ''}`}
          onClick={() => setActiveTab('reports')}
        >
          User Reports ({activeTab === 'reports' ? reports.length : '...'})
        </button>
      </div>

      {error && <div className="card" style={{ backgroundColor: '#fee2e2', color: '#991b1b', marginBottom: '1rem', padding: '1rem' }}>{error}</div>}

      <div className="admin-content">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>Loading...</div>
        ) : (
          <>
            {/* Verifications Tab */}
            {activeTab === 'verifications' && (
              <div className="admin-grid">
                {verifications.length === 0 ? (
                  <p style={{ gridColumn: '1 / -1', textAlign: 'center', color: 'var(--color-text-muted)', padding: '2rem' }}>No pending verifications.</p>
                ) : (
                  verifications.map(user => (
                    <div key={user._id} className="card admin-card">
                      <div className="admin-card-header">
                        <img src={user.profilePicture || 'https://via.placeholder.com/40'} alt={user.name} className="admin-avatar" />
                        <div>
                          <h4>{user.name}</h4>
                          <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{user.email}</p>
                        </div>
                      </div>
                      <div className="admin-id-preview">
                        <img src={user.idDocument} alt="ID Document" />
                      </div>
                      <div className="admin-actions">
                        <button className="btn btn-outline" onClick={() => handleVerifyAction(user._id, 'reject')}>Reject</button>
                        <button className="btn btn-primary" onClick={() => handleVerifyAction(user._id, 'approve')}>Approve</button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Reports Tab */}
            {activeTab === 'reports' && (
              <div className="admin-list">
                {reports.length === 0 ? (
                  <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: '2rem' }}>No pending reports.</p>
                ) : (
                  reports.map(report => (
                    <div key={report._id} className="card admin-report-card">
                      <div className="report-header">
                        <span className="report-badge">{report.reason}</span>
                        <span className="report-date">{new Date(report.createdAt).toLocaleDateString()}</span>
                      </div>
                      
                      <div className="report-body">
                        <div className="report-users">
                          <div>
                            <span className="label">Reported User:</span>
                            <strong>{report.reportedUser?.name}</strong> ({report.reportedUser?.email})
                          </div>
                          <div>
                            <span className="label">Reported By:</span>
                            <span>{report.reporter?.name}</span>
                          </div>
                        </div>
                        
                        {report.description && (
                          <div className="report-desc">
                            <span className="label">Description:</span>
                            <p>{report.description}</p>
                          </div>
                        )}
                      </div>

                      <div className="admin-actions" style={{ justifyContent: 'flex-start', marginTop: '1rem' }}>
                        <button className="btn btn-outline" onClick={() => handleReportAction(report._id, 'dismiss')}>Dismiss Report</button>
                        <button className="btn btn-primary" style={{ backgroundColor: '#dc2626', border: 'none' }} onClick={() => handleReportAction(report._id, 'ban_user')}>Ban User</button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
