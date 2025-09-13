import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import VendorAnalytics from './VendorAnalytics';
import { getApiBaseUrl } from '../api/config';

interface AdminPageProps {
  token: string | null;
}

const AdminPage: React.FC<AdminPageProps> = ({ token }) => {
  const navigate = useNavigate();
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    const verify = async () => {
      if (!token) {
        navigate('/login', { replace: true });
        return;
      }
      try {
        const res = await fetch(`${getApiBaseUrl()}/api/profile`, {
          method: 'GET',
          headers: { Authorization: `Bearer ${token}` },
          credentials: 'include'
        });
        if (!res.ok) throw new Error('invalid');
        setVerified(true);
      } catch (_e) {
        // Clear any stale token and redirect to login
        try { localStorage.removeItem('token'); } catch {}
        navigate('/login', { replace: true });
      }
    };
    verify();
  }, [token, navigate]);

  if (!token || !verified) return null;

  return (
    <div style={{ backgroundColor: '#f5f6f8', minHeight: '100vh', padding: '24px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h1 style={{ margin: 0, color: '#2c3e50' }}>Admin Dashboard</h1>
          <button
            onClick={() => { try { localStorage.removeItem('token'); } catch {}; navigate('/login', { replace: true }); }}
            style={{ padding: '8px 12px', background: '#dc3545', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer' }}
          >Logout</button>
        </div>
        <p style={{ margin: '0 0 24px 0', color: '#6c757d' }}>Vendor click analytics</p>
        <VendorAnalytics authToken={token} mode={'page'} />
      </div>
    </div>
  );
};

export default AdminPage;


