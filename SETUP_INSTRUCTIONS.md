# Vendor Image Upload Setup Instructions

## Backend Setup

### 1. Install Dependencies
```bash
cd backend
npm install cloudinary multer
```

### 2. Environment Variables
Create a `.env` file in the backend directory with the following variables:

```env
# MongoDB Connection
MONGO_URI=your_mongodb_connection_string

# JWT Secret
ACCESS_SECRET_TOKEN=your_jwt_secret_token

# Twilio Configuration (for WhatsApp OTP)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_WHATSAPP_NUMBER=+14155238886  # Your WhatsApp sandbox number
TWILIO_PHONE_NUMBER=your_sms_number  # Optional: for SMS fallback

# Cloudinary Configuration (for image uploads)
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Environment
NODE_ENV=development
```

### 3. Cloudinary Setup
1. Sign up for a free Cloudinary account at https://cloudinary.com/
2. Get your cloud name, API key, and API secret from your dashboard
3. Add them to your `.env` file

### 4. Twilio Setup (for WhatsApp OTP)
1. Sign up for a free Twilio account at https://www.twilio.com/
2. Get your Account SID and Auth Token from the console
3. Set up WhatsApp sandbox for free testing (see WHATSAPP_SETUP.md for details)
4. Add them to your `.env` file

## Frontend Setup

The frontend components are already created and integrated. The functionality includes:

### Features Implemented:

1. **OTP Authentication Modal**
   - Vendor enters their registered phone number
   - Receives 6-digit OTP via SMS (Twilio)
   - Verifies OTP to authenticate

2. **Profile Picture Upload**
   - Click on the profile picture (with + indicator) in vendor card
   - Upload single image (max 5MB)
   - Images are optimized and stored in Cloudinary

3. **Carousel Images Upload**
   - Click "Add Laari Images" button in vendor card
   - Upload multiple images (max 10 images, 5MB each)
   - Images are optimized and stored in Cloudinary

4. **Database Schema Updates**
   - Added `profilePicture` field to User model
   - Added `carouselImages` array field to User model

### API Endpoints Created:

- `POST /api/send-otp` - Send OTP to vendor phone number
- `POST /api/verify-otp` - Verify OTP and authenticate vendor
- `POST /api/upload-profile-picture` - Upload profile picture
- `POST /api/upload-carousel-images` - Upload carousel images
- `GET /api/vendor-images/:phoneNumber` - Get vendor images
- `DELETE /api/delete-carousel-image` - Delete carousel image

### Usage:

1. **For Profile Picture:**
   - Click on the profile picture in any vendor card
   - Enter your registered phone number
   - Enter the OTP received via SMS
   - Select and upload your profile picture

2. **For Carousel Images:**
   - Click "Add Laari Images" button in any vendor card
   - Enter your registered phone number
   - Enter the OTP received via SMS
   - Select multiple images and upload

### Development Notes:

- In development mode, OTP is logged to console instead of sending SMS
- Images are automatically resized and optimized by Cloudinary
- File size limit is 5MB per image
- Maximum 10 images for carousel upload
- Images are stored in organized folders on Cloudinary

### Security Features:

- OTP expires after 5 minutes
- Only registered vendors can upload images
- File type validation (images only)
- File size validation
- Secure image storage on Cloudinary

## Testing

1. Start the backend server:
```bash
cd backend
npm start
```

2. Start the frontend development server:
```bash
cd frontend
npm run dev
```

3. Test the functionality:
   - Open the app in browser
   - Click on any vendor card
   - Try uploading profile picture or carousel images
   - Check console for development OTP codes 