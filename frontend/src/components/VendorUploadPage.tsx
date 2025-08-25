import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getApiBaseUrl } from '../api/config';

interface VendorUploadPageProps {
  onClose?: () => void;
}

const VendorUploadPage: React.FC<VendorUploadPageProps> = ({ onClose }) => {
  const [searchParams] = useSearchParams();
  const [step, setStep] = useState<'phone' | 'otp' | 'upload'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [uploading, setUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadType, setUploadType] = useState<'profile' | 'carousel'>('profile');

  // Get vendor info from URL params
  const vendorPhone = searchParams.get('phone');
  const [vendorName, setVendorName] = useState<string>('');

  useEffect(() => {
    if (vendorPhone) {
      setPhoneNumber(vendorPhone);
      // Auto-advance to OTP step if phone is provided
      setStep('otp');
      
      // Fetch vendor name from backend
      fetchVendorName(vendorPhone);
    }
  }, [vendorPhone]);

  const fetchVendorName = async (phone: string) => {
    try {
      const response = await fetch(`${getApiBaseUrl()}/api/all-users`);
      const data = await response.json();
      
      if (data.data) {
        const vendor = data.data.find((v: any) => v.contactNumber === phone);
        if (vendor) {
          setVendorName(vendor.name || vendor.businessName || vendor.vendorName || 'Vendor');
        }
      }
    } catch (error) {
      console.error('Error fetching vendor name:', error);
    }
  };

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber) {
      setError('Please enter your phone number');
      return;
    }

    try {
      const response = await fetch(`${getApiBaseUrl()}/api/send-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phoneNumber }),
      });

      const data = await response.json();

      if (data.success) {
        setStep('otp');
        setError('');
      } else {
        setError(data.msg || 'Failed to send OTP');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp) {
      setError('Please enter the OTP');
      return;
    }

    try {
      const response = await fetch(`${getApiBaseUrl()}/api/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phoneNumber, otp }),
      });

      const data = await response.json();

      if (data.success) {
        setStep('upload');
        setError('');
      } else {
        setError(data.msg || 'Invalid OTP');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validSizeFiles = files.filter(file => file.size <= 5 * 1024 * 1024); // 5MB limit

    if (validSizeFiles.length !== files.length) {
      setError('Some files are too large. Maximum size is 5MB per file.');
    } else {
      setSelectedFiles(validSizeFiles);
      setError('');
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedFiles.length === 0) {
      setError('Please select at least one image');
      return;
    }

    setUploading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('phoneNumber', phoneNumber);
      
      if (uploadType === 'profile') {
        formData.append('image', selectedFiles[0]);
        
        const response = await fetch(`${getApiBaseUrl()}/api/upload-profile-picture`, {
          method: 'POST',
          body: formData,
        });

        const data = await response.json();

        if (data.success) {
          setSuccess('Profile picture uploaded successfully!');
          setTimeout(() => {
            if (onClose) onClose();
            else window.location.href = '/'; // Redirect to home if no close function
          }, 2000);
        } else {
          setError(data.msg || 'Upload failed');
        }
      } else {
        // Carousel upload
        selectedFiles.forEach(file => {
          formData.append('images', file);
        });

        const response = await fetch(`${getApiBaseUrl()}/api/upload-carousel-images`, {
          method: 'POST',
          body: formData,
        });

        const data = await response.json();

        if (data.success) {
          setSuccess('Carousel images uploaded successfully!');
          setTimeout(() => {
            if (onClose) onClose();
            else window.location.href = '/'; // Redirect to home if no close function
          }, 2000);
        } else {
          setError(data.msg || 'Upload failed');
        }
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setUploading(false);
    }
  };

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
        maxWidth: '400px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        position: 'relative'
      }}>
        {/* Close button */}
        {onClose && (
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
            📸 Upload Photos
          </h2>
          {vendorName && (
            <p style={{ 
              margin: '0', 
              color: '#666', 
              fontSize: '14px' 
            }}>
              Welcome, {vendorName}!
            </p>
          )}
        </div>

        {/* Phone Number Step */}
        {step === 'phone' && (
          <form onSubmit={handleSendOTP}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '8px', 
                fontWeight: '500',
                color: '#2c3e50'
              }}>
                Phone Number
              </label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="Enter your phone number"
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '16px',
                  outline: 'none'
                }}
                required
              />
            </div>
            <button
              type="submit"
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: '#C80B41',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '500',
                cursor: 'pointer'
              }}
            >
              Send OTP
            </button>
          </form>
        )}

        {/* OTP Step */}
        {step === 'otp' && (
          <form onSubmit={handleVerifyOTP}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '8px', 
                fontWeight: '500',
                color: '#2c3e50'
              }}>
                Enter OTP
              </label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter 6-digit OTP"
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '16px',
                  outline: 'none'
                }}
                maxLength={6}
                required
              />
            </div>
            <button
              type="submit"
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: '#C80B41',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '500',
                cursor: 'pointer'
              }}
            >
              Verify OTP
            </button>
          </form>
        )}

        {/* Upload Step */}
        {step === 'upload' && (
          <form onSubmit={handleUpload}>
            {/* Upload Type Selection */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '8px', 
                fontWeight: '500',
                color: '#2c3e50'
              }}>
                Upload Type
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setUploadType('profile')}
                  style={{
                    flex: 1,
                    padding: '12px',
                    backgroundColor: uploadType === 'profile' ? '#C80B41' : '#f8f9fa',
                    color: uploadType === 'profile' ? 'white' : '#2c3e50',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer'
                  }}
                >
                  Profile Picture
                </button>
                <button
                  type="button"
                  onClick={() => setUploadType('carousel')}
                  style={{
                    flex: 1,
                    padding: '12px',
                    backgroundColor: uploadType === 'carousel' ? '#C80B41' : '#f8f9fa',
                    color: uploadType === 'carousel' ? 'white' : '#2c3e50',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer'
                  }}
                >
                  Business Images
                </button>
              </div>
            </div>

            {/* File Upload */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '8px', 
                fontWeight: '500',
                color: '#2c3e50'
              }}>
                {uploadType === 'profile' ? 'Profile Picture' : 'Business Images'}
              </label>
              <input
                type="file"
                onChange={handleFileSelect}
                accept="image/*"
                multiple={uploadType === 'carousel'}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px dashed #ddd',
                  borderRadius: '8px',
                  fontSize: '16px',
                  outline: 'none'
                }}
                required
              />
              <p style={{ 
                margin: '8px 0 0 0', 
                fontSize: '12px', 
                color: '#666' 
              }}>
                Maximum file size: 5MB per image
                {uploadType === 'carousel' && ' (You can select multiple images)'}
              </p>
            </div>

            {/* Selected Files Preview */}
            {selectedFiles.length > 0 && (
              <div style={{ marginBottom: '20px' }}>
                <p style={{ 
                  margin: '0 0 8px 0', 
                  fontSize: '14px', 
                  fontWeight: '500',
                  color: '#2c3e50'
                }}>
                  Selected Files:
                </p>
                {selectedFiles.map((file, index) => (
                  <div key={index} style={{ 
                    padding: '8px', 
                    backgroundColor: '#f8f9fa', 
                    borderRadius: '4px',
                    marginBottom: '4px',
                    fontSize: '12px'
                  }}>
                    {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                  </div>
                ))}
              </div>
            )}

            <button
              type="submit"
              disabled={uploading}
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: uploading ? '#ccc' : '#C80B41',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '500',
                cursor: uploading ? 'not-allowed' : 'pointer'
              }}
            >
              {uploading ? 'Uploading...' : 'Upload Photos'}
            </button>
          </form>
        )}

        {/* Error Message */}
        {error && (
          <div style={{
            marginTop: '16px',
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
            marginTop: '16px',
            padding: '12px',
            backgroundColor: '#d4edda',
            color: '#155724',
            borderRadius: '8px',
            fontSize: '14px'
          }}>
            {success}
          </div>
        )}
      </div>
    </div>
  );
};

export default VendorUploadPage;
