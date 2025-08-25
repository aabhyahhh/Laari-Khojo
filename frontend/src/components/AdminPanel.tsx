import React, { useState, useEffect } from 'react';
import { getApiBaseUrl } from '../api/config';
import { Vendor } from '../api/client';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ isOpen, onClose }) => {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(false);
  const [sendingInvitation, setSendingInvitation] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchVendors();
    }
  }, [isOpen]);

  const fetchVendors = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${getApiBaseUrl()}/api/all-users`);
      const data = await response.json();
      
      if (data.data) {
        setVendors(data.data);
      } else {
        setError('Failed to fetch vendors');
      }
    } catch (error) {
      setError('Network error while fetching vendors');
    } finally {
      setLoading(false);
    }
  };

  const sendPhotoUploadInvitation = async (phoneNumber: string, vendorName: string) => {
    setSendingInvitation(phoneNumber);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`${getApiBaseUrl()}/api/send-photo-upload-invitation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phoneNumber }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(`✅ Photo upload invitation sent to ${vendorName} (${phoneNumber})`);
        setTimeout(() => setSuccess(''), 5000);
      } else {
        setError(data.msg || 'Failed to send invitation');
        setTimeout(() => setError(''), 5000);
      }
    } catch (error) {
      setError('Network error while sending invitation');
      setTimeout(() => setError(''), 5000);
    } finally {
      setSendingInvitation(null);
    }
  };

  const sendBulkInvitations = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    const vendorsWithoutPhotos = vendors.filter(vendor => 
      !vendor.profilePicture || !vendor.carouselImages || vendor.carouselImages.length === 0
    );

    if (vendorsWithoutPhotos.length === 0) {
      setError('All vendors already have photos uploaded');
      setLoading(false);
      return;
    }

    let successCount = 0;
    let errorCount = 0;

    for (const vendor of vendorsWithoutPhotos) {
      try {
        const response = await fetch(`${getApiBaseUrl()}/api/send-photo-upload-invitation`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ phoneNumber: vendor.contactNumber }),
        });

        const data = await response.json();

        if (data.success) {
          successCount++;
        } else {
          errorCount++;
        }

        // Add delay between requests to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        errorCount++;
      }
    }

    setSuccess(`✅ Sent ${successCount} invitations successfully. ${errorCount} failed.`);
    setTimeout(() => setSuccess(''), 5000);
    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div style={{
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
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '16px',
        padding: '32px',
        maxWidth: '800px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        position: 'relative'
      }}>
        {/* Close button */}
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

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <h2 style={{ 
            margin: '0 0 8px 0', 
            color: '#2c3e50', 
            fontSize: '24px',
            fontWeight: '600'
          }}>
            📱 WhatsApp Photo Upload Admin
          </h2>
          <p style={{ 
            margin: '0', 
            color: '#666', 
            fontSize: '14px' 
          }}>
            Send photo upload invitations to vendors via WhatsApp
          </p>
        </div>

        {/* Bulk Action */}
        <div style={{ marginBottom: '24px', textAlign: 'center' }}>
          <button
            onClick={sendBulkInvitations}
            disabled={loading}
            style={{
              padding: '12px 24px',
              backgroundColor: loading ? '#ccc' : '#C80B41',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '500',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Sending...' : '📤 Send Invitations to All Vendors Without Photos'}
          </button>
        </div>

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

        {/* Success Message */}
        {success && (
          <div style={{
            marginBottom: '16px',
            padding: '12px',
            backgroundColor: '#d4edda',
            color: '#155724',
            borderRadius: '8px',
            fontSize: '14px'
          }}>
            {success}
          </div>
        )}

        {/* Vendors List */}
        <div>
          <h3 style={{ 
            margin: '0 0 16px 0', 
            color: '#2c3e50', 
            fontSize: '18px',
            fontWeight: '600'
          }}>
            Vendors ({vendors.length})
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
              <p style={{ marginTop: '16px', color: '#666' }}>Loading vendors...</p>
            </div>
          ) : (
            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {vendors.map((vendor) => (
                <div
                  key={vendor._id}
                  style={{
                    padding: '16px',
                    border: '1px solid #e9ecef',
                    borderRadius: '8px',
                    marginBottom: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <h4 style={{ 
                      margin: '0 0 4px 0', 
                      color: '#2c3e50', 
                      fontSize: '16px',
                      fontWeight: '600'
                    }}>
                      {vendor.name || vendor.businessName || vendor.vendorName || 'Unknown Vendor'}
                    </h4>
                    <p style={{ 
                      margin: '0 0 4px 0', 
                      color: '#666', 
                      fontSize: '14px' 
                    }}>
                      📱 {vendor.contactNumber}
                    </p>
                    <div style={{ display: 'flex', gap: '8px', fontSize: '12px' }}>
                      {vendor.profilePicture ? (
                        <span style={{ color: '#28a745' }}>✅ Profile Photo</span>
                      ) : (
                        <span style={{ color: '#dc3545' }}>❌ No Profile Photo</span>
                      )}
                      {vendor.carouselImages && vendor.carouselImages.length > 0 ? (
                        <span style={{ color: '#28a745' }}>✅ Business Photos ({vendor.carouselImages.length})</span>
                      ) : (
                        <span style={{ color: '#dc3545' }}>❌ No Business Photos</span>
                      )}
                    </div>
                  </div>
                  
                  <button
                    onClick={() => sendPhotoUploadInvitation(
                      vendor.contactNumber, 
                      vendor.name || vendor.businessName || vendor.vendorName || 'Vendor'
                    )}
                    disabled={sendingInvitation === vendor.contactNumber}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: sendingInvitation === vendor.contactNumber ? '#ccc' : '#007bff',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '14px',
                      fontWeight: '500',
                      cursor: sendingInvitation === vendor.contactNumber ? 'not-allowed' : 'pointer',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {sendingInvitation === vendor.contactNumber ? 'Sending...' : '📤 Send Invitation'}
                  </button>
                </div>
              ))}
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

export default AdminPanel;
