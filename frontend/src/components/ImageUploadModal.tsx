import React, { useState, useRef } from 'react';
import api from '../api/client';

interface ImageUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  uploadType: 'profile' | 'carousel';
}

interface VendorData {
  _id: string;
  name: string;
  contactNumber: string;
  profilePicture?: string;
  carouselImages?: string[];
}

const ImageUploadModal: React.FC<ImageUploadModalProps> = ({ isOpen, onClose, uploadType }) => {
  const [step, setStep] = useState<'phone' | 'otp' | 'upload'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [vendorToken, setVendorToken] = useState('');
  const [vendorData, setVendorData] = useState<VendorData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${import.meta.env.DEV ? 'http://localhost:3000' : 'https://laari-khojo-backend.onrender.com'}/api/send-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          phoneNumber,
          method: 'whatsapp' // Use WhatsApp by default
        }),
      });

      const data = await response.json();

      if (data.success) {
        setStep('otp');
        setSuccess('OTP sent successfully via WhatsApp!');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.msg || 'Failed to send OTP');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${import.meta.env.DEV ? 'http://localhost:3000' : 'https://laari-khojo-backend.onrender.com'}/api/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phoneNumber, otp }),
      });

      const data = await response.json();

      if (data.success) {
        setVendorToken(data.data.vendorToken);
        setVendorData(data.data.vendor);
        setStep('upload');
        setSuccess('Authentication successful!');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.msg || 'Invalid OTP');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    // Validate file types
    const validFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (validFiles.length !== files.length) {
      setError('Only image files are allowed');
      return;
    }

    // Limit file size (5MB)
    const validSizeFiles = validFiles.filter(file => file.size <= 5 * 1024 * 1024);
    
    if (validSizeFiles.length !== validFiles.length) {
      setError('Files must be smaller than 5MB');
      return;
    }

    setSelectedFiles(validSizeFiles);
    setError('');
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
        
        const response = await fetch(`${import.meta.env.DEV ? 'http://localhost:3000' : 'https://laari-khojo-backend.onrender.com'}/api/upload-profile-picture`, {
          method: 'POST',
          body: formData,
        });

        const data = await response.json();

        if (data.success) {
          setSuccess('Profile picture uploaded successfully!');
          setTimeout(() => {
            onClose();
            window.location.reload(); // Refresh to show new image
          }, 2000);
        } else {
          setError(data.msg || 'Upload failed');
        }
      } else {
        // Carousel upload
        selectedFiles.forEach(file => {
          formData.append('images', file);
        });

        const response = await fetch(`${import.meta.env.DEV ? 'http://localhost:3000' : 'https://laari-khojo-backend.onrender.com'}/api/upload-carousel-images`, {
          method: 'POST',
          body: formData,
        });

        const data = await response.json();

        if (data.success) {
          setSuccess('Carousel images uploaded successfully!');
          setTimeout(() => {
            onClose();
            window.location.reload(); // Refresh to show new images
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

  const resetModal = () => {
    setStep('phone');
    setPhoneNumber('');
    setOtp('');
    setVendorToken('');
    setVendorData(null);
    setError('');
    setSuccess('');
    setSelectedFiles([]);
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 3000,
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '24px',
        maxWidth: '400px',
        width: '90%',
        maxHeight: '80vh',
        overflowY: 'auto',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
          paddingBottom: '16px',
          borderBottom: '1px solid #eee',
        }}>
          <h2 style={{
            margin: 0,
            fontSize: '20px',
            fontWeight: '600',
            color: '#2c3e50',
          }}>
            {uploadType === 'profile' ? 'Upload Profile Picture' : 'Upload Laari Images'}
          </h2>
          <button
            onClick={handleClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#666',
              padding: '4px',
            }}
          >
            ×
          </button>
        </div>

        {/* Progress Steps */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: '24px',
        }}>
          {['phone', 'otp', 'upload'].map((stepName, index) => (
            <div key={stepName} style={{
              display: 'flex',
              alignItems: 'center',
              flex: 1,
            }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: step === stepName ? '#007bff' : 
                               ['phone', 'otp', 'upload'].indexOf(step) > index ? '#28a745' : '#ddd',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '14px',
                fontWeight: '600',
              }}>
                {index + 1}
              </div>
              {index < 2 && (
                <div style={{
                  flex: 1,
                  height: '2px',
                  backgroundColor: ['phone', 'otp', 'upload'].indexOf(step) > index ? '#28a745' : '#ddd',
                  margin: '0 8px',
                }} />
              )}
            </div>
          ))}
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div style={{
            backgroundColor: '#f8d7da',
            color: '#721c24',
            padding: '12px',
            borderRadius: '6px',
            marginBottom: '16px',
            border: '1px solid #f5c6cb',
          }}>
            {error}
          </div>
        )}

        {success && (
          <div style={{
            backgroundColor: '#d4edda',
            color: '#155724',
            padding: '12px',
            borderRadius: '6px',
            marginBottom: '16px',
            border: '1px solid #c3e6cb',
          }}>
            {success}
          </div>
        )}

        {/* Step 1: Phone Number */}
        {step === 'phone' && (
          <form onSubmit={handlePhoneSubmit}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: '500',
                color: '#2c3e50',
              }}>
                Enter your registered phone number:
              </label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="Enter phone number"
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '6px',
                  border: '1px solid #ddd',
                  fontSize: '16px',
                }}
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: loading ? '#6c757d' : '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              {loading ? 'Sending OTP...' : 'Send OTP'}
            </button>
          </form>
        )}

        {/* Step 2: OTP Verification */}
        {step === 'otp' && (
          <form onSubmit={handleOtpSubmit}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: '500',
                color: '#2c3e50',
              }}>
                Enter the 6-digit OTP sent to {phoneNumber} via WhatsApp:
              </label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="Enter 6-digit OTP"
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '6px',
                  border: '1px solid #ddd',
                  fontSize: '16px',
                  textAlign: 'center',
                  letterSpacing: '2px',
                }}
                maxLength={6}
                required
              />
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setStep('phone')}
                style={{
                  flex: 1,
                  padding: '12px',
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '16px',
                  cursor: 'pointer',
                }}
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                style={{
                  flex: 1,
                  padding: '12px',
                  backgroundColor: loading || otp.length !== 6 ? '#6c757d' : '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: loading || otp.length !== 6 ? 'not-allowed' : 'pointer',
                }}
              >
                {loading ? 'Verifying...' : 'Verify OTP'}
              </button>
            </div>
          </form>
        )}

        {/* Step 3: File Upload */}
        {step === 'upload' && vendorData && (
          <form onSubmit={handleUpload}>
            <div style={{ marginBottom: '16px' }}>
              <h3 style={{
                margin: '0 0 12px 0',
                fontSize: '16px',
                fontWeight: '600',
                color: '#2c3e50',
              }}>
                Welcome, {vendorData.name}!
              </h3>
              <p style={{
                margin: '0 0 16px 0',
                color: '#666',
                fontSize: '14px',
              }}>
                {uploadType === 'profile' 
                  ? 'Select a profile picture for your laari'
                  : 'Select images to add to your laari carousel (max 10 images)'
                }
              </p>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple={uploadType === 'carousel'}
                onChange={handleFileSelect}
                style={{ display: 'none' }}
              />
              
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                style={{
                  width: '100%',
                  padding: '16px',
                  border: '2px dashed #ddd',
                  borderRadius: '8px',
                  backgroundColor: '#f8f9fa',
                  cursor: 'pointer',
                  fontSize: '16px',
                  color: '#666',
                  marginBottom: '16px',
                }}
              >
                📁 Click to select {uploadType === 'profile' ? 'image' : 'images'}
              </button>

              {selectedFiles.length > 0 && (
                <div style={{ marginBottom: '16px' }}>
                  <h4 style={{
                    margin: '0 0 8px 0',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#2c3e50',
                  }}>
                    Selected Files ({selectedFiles.length}):
                  </h4>
                  <div style={{
                    maxHeight: '120px',
                    overflowY: 'auto',
                    border: '1px solid #eee',
                    borderRadius: '6px',
                    padding: '8px',
                  }}>
                    {selectedFiles.map((file, index) => (
                      <div key={index} style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '4px 0',
                        fontSize: '12px',
                        color: '#666',
                      }}>
                        <span>{file.name}</span>
                        <span>{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setStep('otp')}
                style={{
                  flex: 1,
                  padding: '12px',
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '16px',
                  cursor: 'pointer',
                }}
              >
                Back
              </button>
              <button
                type="submit"
                disabled={uploading || selectedFiles.length === 0}
                style={{
                  flex: 1,
                  padding: '12px',
                  backgroundColor: uploading || selectedFiles.length === 0 ? '#6c757d' : '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: uploading || selectedFiles.length === 0 ? 'not-allowed' : 'pointer',
                }}
              >
                {uploading ? 'Uploading...' : 'Upload'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ImageUploadModal; 