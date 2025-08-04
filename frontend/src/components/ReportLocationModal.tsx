import React, { useState } from 'react';

interface ReportLocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  vendorName: string;
  vendorId: string;
  vendorLocation: string;
  vendorArea: string;
  userLocation: string;
}

interface ReportFormData {
  firstName: string;
  lastName: string;
  email: string;
  issueType: string;
  otherIssueType: string;
  comments: string;
  userContact: string;
  allowContact: boolean;
}

const ReportLocationModal: React.FC<ReportLocationModalProps> = ({
  isOpen,
  onClose,
  vendorName,
  vendorId,
  vendorLocation,
  vendorArea,
  userLocation
}) => {
  const [formData, setFormData] = useState<ReportFormData>({
    firstName: '',
    lastName: '',
    email: '',
    issueType: '',
    otherIssueType: '',
    comments: '',
    userContact: '',
    allowContact: false
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const issueTypeOptions = [
    { value: 'location_far_off', label: '❌ Location is far off (vendor not there at all)' },
    { value: 'vendor_moved', label: '🔁 Vendor has moved to a new spot' },
    { value: 'vendor_not_available', label: '🕐 Vendor not available at shown time' },
    { value: 'amc_clearance', label: '🚧 Laari location changes due to AMC clearances' },
    { value: 'other', label: 'Other (with text input)' }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formDataToSubmit = new FormData();
      formDataToSubmit.append('access_key', 'd003bcfb-91bc-44d0-8347-1259bbc5158f');
      formDataToSubmit.append('subject', `Wrong Location Report - ${vendorName}`);
      formDataToSubmit.append('from_name', `${formData.firstName} ${formData.lastName}`);
      formDataToSubmit.append('from_email', formData.email);

      const issueTypeLabel = issueTypeOptions.find(option => option.value === formData.issueType)?.label || '';
      const finalIssueType = formData.issueType === 'other' ? formData.otherIssueType : issueTypeLabel;

      const message = `
Vendor Location Report

Stall Name: ${vendorName}
Vendor ID: ${vendorId}
Vendor Location: ${vendorLocation}
Vendor Area: ${vendorArea}
User Location: ${userLocation}
Report Time: ${new Date().toLocaleString()}

Reporter Information:
- Name: ${formData.firstName} ${formData.lastName}
- Email: ${formData.email}
- Contact: ${formData.userContact || 'Not provided'}
- Allow Contact: ${formData.allowContact ? 'Yes' : 'No'}

Issue Type: ${finalIssueType}

Comments: ${formData.comments || 'No additional comments'}

Additional Notes: ${formData.comments}
      `.trim();

      formDataToSubmit.append('message', message);

      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body: formDataToSubmit
      });

      const data = await response.json();

      if (data.success) {
        alert('Thank you for reporting! We will investigate this location issue.');
        onClose();
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          issueType: '',
          otherIssueType: '',
          comments: '',
          userContact: '',
          allowContact: false
        });
      } else {
        alert('Failed to submit report. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting report:', error);
      alert('Failed to submit report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
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
      zIndex: 3000
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '24px',
        width: '90%',
        maxWidth: '500px',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px'
        }}>
          <h2 style={{
            margin: 0,
            fontSize: '20px',
            fontWeight: '600',
            color: '#2c3e50'
          }}>
            Report Wrong Location
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#666',
              padding: '4px'
            }}
          >
            ×
          </button>
        </div>

        <div style={{
          backgroundColor: '#f8f9fa',
          padding: '12px',
          borderRadius: '8px',
          marginBottom: '20px',
          border: '1px solid #e9ecef'
        }}>
          <strong>Stall Name:</strong> {vendorName}
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Name Fields */}
          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>
                First Name *
              </label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                required
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>
                Last Name *
              </label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                required
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>
              Email Address *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '14px'
              }}
            />
          </div>

          {/* Issue Type Dropdown */}
          <div>
            <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>
              Issue Type *
            </label>
            <select
              name="issueType"
              value={formData.issueType}
              onChange={handleInputChange}
              required
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '14px'
              }}
            >
              <option value="">Select an issue type</option>
              {issueTypeOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Other Issue Type Text Input */}
          {formData.issueType === 'other' && (
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>
                Please specify the issue *
              </label>
              <input
                type="text"
                name="otherIssueType"
                value={formData.otherIssueType}
                onChange={handleInputChange}
                required
                placeholder="Please describe the issue..."
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              />
            </div>
          )}

          {/* Comments */}
          <div>
            <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>
              Optional Comments
            </label>
            <textarea
              name="comments"
              value={formData.comments}
              onChange={handleInputChange}
              rows={3}
              placeholder="Any additional details about the issue..."
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '14px',
                resize: 'vertical'
              }}
            />
          </div>

          {/* User Contact */}
          <div>
            <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>
              User Contact (Optional but Useful for Verification)
            </label>
            <input
              type="text"
              name="userContact"
              value={formData.userContact}
              onChange={handleInputChange}
              placeholder="Phone number or email (only if needed to follow up)"
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '14px'
              }}
            />
          </div>

          {/* Contact Permission Checkbox */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="checkbox"
              name="allowContact"
              checked={formData.allowContact}
              onChange={handleInputChange}
              style={{ width: '16px', height: '16px' }}
            />
            <label style={{ fontSize: '14px', cursor: 'pointer' }}>
              Okay to contact me for clarification
            </label>
          </div>

          {/* Submit Button */}
          <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1,
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                backgroundColor: 'white',
                color: '#666',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                flex: 1,
                padding: '12px',
                border: 'none',
                borderRadius: '6px',
                backgroundColor: isSubmitting ? '#ccc' : '#C80B41',
                color: 'white',
                fontSize: '14px',
                fontWeight: '500',
                cursor: isSubmitting ? 'not-allowed' : 'pointer'
              }}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Report'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReportLocationModal; 