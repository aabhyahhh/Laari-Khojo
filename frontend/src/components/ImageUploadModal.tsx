import React, { useState, useRef } from 'react';
// import api from '../api/client';

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
  // const [vendorToken, setVendorToken] = useState('');
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
        // setVendorToken(data.data.vendorToken);
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
    // setVendorToken('');
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

        {/* Step indicators */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: '24px',
        }}>
          {['phone', 'otp', 'upload'].map((stepName, index) => (
            <div key={stepName} style={{
              flex: 1,
              height: '4px',
              backgroundColor: step === stepName ? '#C80B41' :
                ['phone', 'otp', 'upload'].indexOf(step) > index ? '#C80B41' : '#ddd',
              marginRight: index < 2 ? '8px' : 0,
              borderRadius: '2px',
            }} />
          ))}
        </div>

        {/* Progress text */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: '24px',
          fontSize: '12px',
          color: '#666',
        }}>
          {['phone', 'otp', 'upload'].map((stepName, index) => (
            <span key={stepName} style={{
              color: ['phone', 'otp', 'upload'].indexOf(step) > index ? '#C80B41' : '#ddd',
              fontWeight: step === stepName ? '600' : 'normal',
            }}>
              Step {index + 1}
            </span>
          ))}
        </div>

        {/* Error message */}
        {error && (
          <div style={{
            padding: '12px',
            marginBottom: '16px',
            backgroundColor: '#f8d7da',
            color: '#721c24',
            borderRadius: '6px',
            fontSize: '14px',
            border: '1px solid #f5c6cb',
          }}>
            {error}
          </div>
        )}

        {/* Success message */}
        {success && (
          <div style={{
            padding: '12px',
            marginBottom: '16px',
            backgroundColor: '#d4edda',
            color: '#155724',
            borderRadius: '6px',
            fontSize: '14px',
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
                fontSize: '14px',
                fontWeight: '600',
                color: '#2c3e50',
              }}>
                Enter your registered phone number:
              </label>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                border: '1px solid #ddd',
                borderRadius: '6px',
                overflow: 'hidden',
              }}>
                <div style={{
                  padding: '12px',
                  backgroundColor: '#f8f9fa',
                  borderRight: '1px solid #ddd',
                  color: '#666',
                  fontSize: '16px',
                  fontWeight: '500',
                }}>
                  +91
                </div>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="Enter phone number"
                  style={{
                    flex: 1,
                    padding: '12px',
                    border: 'none',
                    outline: 'none',
                    fontSize: '16px',
                  }}
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: loading ? '#6c757d' : '#C80B41',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '16px',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'background-color 0.2s',
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  (e.target as HTMLButtonElement).style.backgroundColor = '#a00833';
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  (e.target as HTMLButtonElement).style.backgroundColor = '#C80B41';
                }
              }}
            >
              {loading ? 'Sending...' : 'Send OTP'}
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
                fontSize: '14px',
                fontWeight: '600',
                color: '#2c3e50',
              }}>
                Enter the 6-digit OTP sent to +91{phoneNumber} via WhatsApp:
              </label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter 6-digit OTP"
                maxLength={6}
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
                disabled={loading}
                style={{
                  flex: 1,
                  padding: '12px',
                  backgroundColor: loading ? '#6c757d' : '#C80B41',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '16px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'background-color 0.2s',
                }}
                onMouseEnter={(e) => {
                  if (!loading) {
                    (e.target as HTMLButtonElement).style.backgroundColor = '#a00833';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!loading) {
                    (e.target as HTMLButtonElement).style.backgroundColor = '#C80B41';
                  }
                }}
              >
                {loading ? 'Verifying...' : 'Verify OTP'}
              </button>
            </div>
          </form>
        )}

        {/* Step 3: Image Upload */}
        {step === 'upload' && (
          <form onSubmit={handleUpload}>
            <div style={{ marginBottom: '16px' }}>
              <h3 style={{
                margin: '0 0 8px 0',
                fontSize: '16px',
                fontWeight: '600',
                color: '#2c3e50',
              }}>
                Welcome, {vendorData?.name || 'Vendor'}!
              </h3>
              <p style={{
                margin: '0 0 16px 0',
                color: '#666',
                fontSize: '14px',
              }}>
                {uploadType === 'profile' 
                  ? 'Select a profile picture for your laari'
                  : 'Select images to add to your laari carousel'
                }
              </p>

              {/* Show current profile picture for profile upload */}
              {uploadType === 'profile' && vendorData?.profilePicture && (
                <div style={{ marginBottom: '20px' }}>
                  <h4 style={{
                    margin: '0 0 12px 0',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#2c3e50',
                  }}>
                    Current Profile Picture:
                  </h4>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px',
                    border: '1px solid #eee',
                    borderRadius: '6px',
                    backgroundColor: '#f8f9fa',
                  }}>
                    <img 
                      src={vendorData.profilePicture} 
                      alt="Current profile picture"
                      style={{
                        width: '60px',
                        height: '60px',
                        borderRadius: '50%',
                        objectFit: 'cover',
                        border: '2px solid #ddd',
                      }}
                    />
                    <div style={{ flex: 1 }}>
                      <p style={{
                        margin: '0 0 4px 0',
                        fontSize: '12px',
                        color: '#666',
                      }}>
                        Current profile picture
                      </p>
                      <button
                        type="button"
                        onClick={async () => {
                          // Only allow removal if a new image is selected
                          if (selectedFiles.length === 0) {
                            setError('Please select a new profile picture before removing the current one');
                            return;
                          }
                          
                          try {
                            const response = await fetch(`${import.meta.env.DEV ? 'http://localhost:3000' : 'https://laari-khojo-backend.onrender.com'}/api/delete-profile-picture`, {
                              method: 'DELETE',
                              headers: {
                                'Content-Type': 'application/json',
                              },
                              body: JSON.stringify({
                                phoneNumber: phoneNumber
                              }),
                            });

                            const data = await response.json();
                            if (data.success) {
                              // Update local vendor data
                                                              setVendorData(prev => prev ? {
                                  ...prev,
                                  profilePicture: undefined
                                } : null);
                              setSuccess('Profile picture removed successfully!');
                              setTimeout(() => setSuccess(''), 3000);
                            } else {
                              setError(data.msg || 'Failed to remove profile picture');
                            }
                          } catch (error) {
                            setError('Failed to remove profile picture');
                          }
                        }}
                        style={{
                          padding: '6px 12px',
                          backgroundColor: selectedFiles.length === 0 ? '#6c757d' : '#dc3545',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          fontSize: '12px',
                          cursor: selectedFiles.length === 0 ? 'not-allowed' : 'pointer',
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Show existing carousel images for carousel upload */}
              {uploadType === 'carousel' && vendorData?.carouselImages && vendorData.carouselImages.length > 0 && (
                <div style={{ marginBottom: '20px' }}>
                  <h4 style={{
                    margin: '0 0 12px 0',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#2c3e50',
                  }}>
                    Existing Images ({vendorData.carouselImages.length}):
                  </h4>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
                    gap: '8px',
                    maxHeight: '120px',
                    overflowY: 'auto',
                    border: '1px solid #eee',
                    borderRadius: '6px',
                    padding: '8px',
                    backgroundColor: '#f8f9fa',
                  }}>
                    {vendorData.carouselImages.map((imageUrl, index) => (
                      <div key={index} style={{
                        position: 'relative',
                        aspectRatio: '1',
                        borderRadius: '4px',
                        overflow: 'hidden',
                        border: '1px solid #ddd',
                      }}>
                        <img 
                          src={imageUrl} 
                          alt={`Existing image ${index + 1}`}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                          }}
                        />
                        <button
                          type="button"
                          onClick={async () => {
                            try {
                              const response = await fetch(`${import.meta.env.DEV ? 'http://localhost:3000' : 'https://laari-khojo-backend.onrender.com'}/api/delete-carousel-image`, {
                                method: 'DELETE',
                                headers: {
                                  'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({
                                  phoneNumber: phoneNumber,
                                  imageUrl: imageUrl
                                }),
                              });

                              const data = await response.json();
                              if (data.success) {
                                // Update local vendor data
                                setVendorData(prev => prev ? {
                                  ...prev,
                                  carouselImages: prev.carouselImages?.filter(img => img !== imageUrl) || []
                                } : null);
                              } else {
                                setError(data.msg || 'Failed to delete image');
                              }
                            } catch (error) {
                              setError('Failed to delete image');
                            }
                          }}
                          style={{
                            position: 'absolute',
                            top: '2px',
                            right: '2px',
                            background: 'rgba(255, 0, 0, 0.8)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '50%',
                            width: '20px',
                            height: '20px',
                            fontSize: '12px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
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

              {/* Warning for profile picture removal */}
              {uploadType === 'profile' && vendorData?.profilePicture && selectedFiles.length === 0 && (
                <div style={{
                  padding: '8px 12px',
                  marginBottom: '16px',
                  backgroundColor: '#fff3cd',
                  color: '#856404',
                  borderRadius: '4px',
                  fontSize: '12px',
                  border: '1px solid #ffeaa7',
                }}>
                  ⚠️ You must select a new profile picture before removing the current one.
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
                disabled={uploading || (uploadType === 'profile' && selectedFiles.length === 0)}
                style={{
                  flex: 1,
                  padding: '12px',
                  backgroundColor: uploading || (uploadType === 'profile' && selectedFiles.length === 0) ? '#6c757d' : '#C80B41',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: uploading || (uploadType === 'profile' && selectedFiles.length === 0) ? 'not-allowed' : 'pointer',
                  transition: 'background-color 0.2s',
                }}
                onMouseEnter={(e) => {
                  if (!uploading && !(uploadType === 'profile' && selectedFiles.length === 0)) {
                    (e.target as HTMLButtonElement).style.backgroundColor = '#a00833';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!uploading && !(uploadType === 'profile' && selectedFiles.length === 0)) {
                    (e.target as HTMLButtonElement).style.backgroundColor = '#C80B41';
                  }
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