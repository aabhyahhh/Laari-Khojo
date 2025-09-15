import React, { useState, useEffect } from 'react';
import { getVendorClickAnalytics } from '../utils/vendorClickTracker';

interface VendorAnalyticsProps {
  authToken: string;
  // Optional modal props (legacy modal usage)
  isOpen?: boolean;
  onClose?: () => void;
  // Render mode: page renders inline, modal renders centered overlay
  mode?: 'page' | 'modal';
}

interface VendorClickData {
  vendorId: string;
  vendorName: string;
  vendorEmail: string;
  contactNumber: string;
  mapsLink: string;
  latitude: number;
  longitude: number;
  foodType: string;
  clickCount: number;
  firstClickedAt: string;
  lastClickedAt: string;
  createdAt: string;
  updatedAt: string;
}

interface AnalyticsStats {
  totalVendors: number;
  totalClicks: number;
  averageClicksPerVendor: string;
  mostClickedVendor: {
    name: string;
    clickCount: number;
  } | null;
}

const VendorAnalytics: React.FC<VendorAnalyticsProps> = ({ isOpen, onClose, authToken, mode = 'modal' }) => {
  const [analytics, setAnalytics] = useState<VendorClickData[]>([]);
  const [stats, setStats] = useState<AnalyticsStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sortBy, setSortBy] = useState<'clickCount' | 'lastClickedAt' | 'vendorName'>('clickCount');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    const shouldFetch = (mode === 'page' && !!authToken) || (mode === 'modal' && !!isOpen && !!authToken);
    if (shouldFetch) {
      fetchAnalytics();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, authToken, mode]);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await getVendorClickAnalytics(authToken);
      
      if (response.success && response.data) {
        setAnalytics(response.data.analytics || []);
        setStats(response.data.stats || null);
      } else {
        setError(response.msg || 'Failed to fetch analytics');
      }
    } catch (error) {
      setError('Network error while fetching analytics');
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field: 'clickCount' | 'lastClickedAt' | 'vendorName') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const sortedAnalytics = [...analytics].sort((a, b) => {
    let aValue: any, bValue: any;
    
    switch (sortBy) {
      case 'clickCount':
        aValue = a.clickCount;
        bValue = b.clickCount;
        break;
      case 'lastClickedAt':
        aValue = new Date(a.lastClickedAt).getTime();
        bValue = new Date(b.lastClickedAt).getTime();
        break;
      case 'vendorName':
        aValue = a.vendorName.toLowerCase();
        bValue = b.vendorName.toLowerCase();
        break;
      default:
        return 0;
    }
    
    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getFoodTypeColor = (foodType: string) => {
    switch (foodType) {
      case 'veg':
        return '#28a745';
      case 'non-veg':
        return '#dc3545';
      case 'swaminarayan':
        return '#6f42c1';
      case 'jain':
        return '#6f42c1';
      default:
        return '#6c757d';
    }
  };

  if (mode === 'modal') {
    if (!isOpen) return null;
  }

  return (
    <div style={mode === 'modal' ? {
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 3000,
      padding: '20px'
    } : { padding: '24px', maxWidth: 1200, margin: '0 auto', width: '100%' }}>
      <div style={mode === 'modal' ? {
        backgroundColor: 'white',
        borderRadius: '16px',
        padding: '32px',
        maxWidth: '1200px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        position: 'relative'
      } : {
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '24px',
        width: '100%'
      }}>
        {mode === 'modal' && (
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#666'
            }}
          >
            ×
          </button>
        )}

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <h2 style={{ 
            margin: '0 0 8px 0', 
            color: '#2c3e50', 
            fontSize: '24px',
            fontWeight: '600'
          }}>
            📊 Vendor Click Analytics
          </h2>
          <p style={{ 
            margin: '0', 
            color: '#666', 
            fontSize: '14px' 
          }}>
            Track customer interaction with vendor markers
          </p>
        </div>

        {/* Statistics Cards */}
        {stats && (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: '16px', 
            marginBottom: '24px' 
          }}>
            <div style={{
              padding: '16px',
              backgroundColor: '#f8f9fa',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <h3 style={{ margin: '0 0 4px 0', color: '#2c3e50', fontSize: '18px' }}>
                {stats.totalVendors}
              </h3>
              <p style={{ margin: '0', color: '#666', fontSize: '14px' }}>
                Total Vendors
              </p>
            </div>
            <div style={{
              padding: '16px',
              backgroundColor: '#f8f9fa',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <h3 style={{ margin: '0 0 4px 0', color: '#2c3e50', fontSize: '18px' }}>
                {stats.totalClicks}
              </h3>
              <p style={{ margin: '0', color: '#666', fontSize: '14px' }}>
                Total Clicks
              </p>
            </div>
            <div style={{
              padding: '16px',
              backgroundColor: '#f8f9fa',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <h3 style={{ margin: '0 0 4px 0', color: '#2c3e50', fontSize: '18px' }}>
                {stats.averageClicksPerVendor}
              </h3>
              <p style={{ margin: '0', color: '#666', fontSize: '14px' }}>
                Avg Clicks/Vendor
              </p>
            </div>
            {stats.mostClickedVendor && (
              <div style={{
                padding: '16px',
                backgroundColor: '#f8f9fa',
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <h3 style={{ margin: '0 0 4px 0', color: '#2c3e50', fontSize: '18px' }}>
                  {stats.mostClickedVendor.clickCount}
                </h3>
                <p style={{ margin: '0', color: '#666', fontSize: '14px' }}>
                  Most Clicked: {stats.mostClickedVendor.name}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div style={{
            marginBottom: '16px',
            padding: '12px',
            backgroundColor: '#f8d7da',
            color: '#721c24',
            borderRadius: '8px',
            fontSize: '14px'
          }}>
            {error}
          </div>
        )}

        {/* Sort Controls */}
        <div style={{ 
          marginBottom: '16px', 
          display: 'flex', 
          gap: '12px', 
          alignItems: 'center',
          flexWrap: 'wrap'
        }}>
          <span style={{ color: '#666', fontSize: '14px' }}>Sort by:</span>
          <button
            onClick={() => handleSort('clickCount')}
            style={{
              padding: '6px 12px',
              backgroundColor: sortBy === 'clickCount' ? '#C80B41' : '#e9ecef',
              color: sortBy === 'clickCount' ? 'white' : '#495057',
              border: 'none',
              borderRadius: '4px',
              fontSize: '12px',
              cursor: 'pointer'
            }}
          >
            Clicks {sortBy === 'clickCount' && (sortOrder === 'desc' ? '↓' : '↑')}
          </button>
          <button
            onClick={() => handleSort('lastClickedAt')}
            style={{
              padding: '6px 12px',
              backgroundColor: sortBy === 'lastClickedAt' ? '#C80B41' : '#e9ecef',
              color: sortBy === 'lastClickedAt' ? 'white' : '#495057',
              border: 'none',
              borderRadius: '4px',
              fontSize: '12px',
              cursor: 'pointer'
            }}
          >
            Last Click {sortBy === 'lastClickedAt' && (sortOrder === 'desc' ? '↓' : '↑')}
          </button>
          <button
            onClick={() => handleSort('vendorName')}
            style={{
              padding: '6px 12px',
              backgroundColor: sortBy === 'vendorName' ? '#C80B41' : '#e9ecef',
              color: sortBy === 'vendorName' ? 'white' : '#495057',
              border: 'none',
              borderRadius: '4px',
              fontSize: '12px',
              cursor: 'pointer'
            }}
          >
            Name {sortBy === 'vendorName' && (sortOrder === 'desc' ? '↓' : '↑')}
          </button>
        </div>

        {/* Analytics Table */}
        <div>
          <h3 style={{ 
            margin: '0 0 16px 0', 
            color: '#2c3e50', 
            fontSize: '18px',
            fontWeight: '600'
          }}>
            Vendor Click Data ({analytics.length})
          </h3>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <div style={{
                border: '3px solid #f3f3f3',
                borderTop: '3px solid #C80B41',
                borderRadius: '50%',
                width: '30px',
                height: '30px',
                animation: 'spin 1s linear infinite',
                margin: '0 auto'
              }}></div>
              <p style={{ marginTop: '16px', color: '#666' }}>Loading analytics...</p>
            </div>
          ) : (
            <div style={{ 
              maxHeight: '400px', 
              overflowY: 'auto',
              border: '1px solid #e9ecef',
              borderRadius: '8px'
            }}>
              {sortedAnalytics.length === 0 ? (
                <div style={{ 
                  padding: '40px', 
                  textAlign: 'center', 
                  color: '#666' 
                }}>
                  No vendor click data available yet.
                </div>
              ) : (
                <table style={{ 
                  width: '100%', 
                  borderCollapse: 'collapse',
                  fontSize: '14px'
                }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f8f9fa' }}>
                      <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e9ecef' }}>
                        Vendor
                      </th>
                      <th style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #e9ecef' }}>
                        Clicks
                      </th>
                      <th style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #e9ecef' }}>
                        Food Type
                      </th>
                      <th style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #e9ecef' }}>
                        Last Click
                      </th>
                      <th style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #e9ecef' }}>
                        Contact
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedAnalytics.map((vendor, index) => (
                      <tr key={vendor.vendorId} style={{ 
                        backgroundColor: index % 2 === 0 ? 'white' : '#f8f9fa' 
                      }}>
                        <td style={{ padding: '12px', borderBottom: '1px solid #e9ecef' }}>
                          <div>
                            <div style={{ fontWeight: '600', color: '#2c3e50' }}>
                              {vendor.vendorName}
                            </div>
                            <div style={{ fontSize: '12px', color: '#666' }}>
                              {vendor.vendorEmail}
                            </div>
                          </div>
                        </td>
                        <td style={{ 
                          padding: '12px', 
                          textAlign: 'center', 
                          borderBottom: '1px solid #e9ecef',
                          fontWeight: '600',
                          color: '#C80B41'
                        }}>
                          {vendor.clickCount}
                        </td>
                        <td style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #e9ecef' }}>
                          <span style={{
                            padding: '4px 8px',
                            borderRadius: '4px',
                            backgroundColor: getFoodTypeColor(vendor.foodType),
                            color: 'white',
                            fontSize: '12px',
                            fontWeight: '500'
                          }}>
                            {vendor.foodType || 'N/A'}
                          </span>
                        </td>
                        <td style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #e9ecef' }}>
                          <div style={{ fontSize: '12px', color: '#666' }}>
                            {formatDate(vendor.lastClickedAt)}
                          </div>
                        </td>
                        <td style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #e9ecef' }}>
                          <div style={{ fontSize: '12px', color: '#666' }}>
                            {vendor.contactNumber}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>

        <style>
          {`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}
        </style>
      </div>
    </div>
  );
};

export default VendorAnalytics;
