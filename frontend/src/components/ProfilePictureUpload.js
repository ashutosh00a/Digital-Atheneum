import React, { useState } from 'react';
import { useAuth } from '../utils/AuthContext';
import api from '../utils/api';

const ProfilePictureUpload = () => {
  const { userInfo, updateUserInfo } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      setIsUploading(true);
      setError(null);

      // Get signed URL for upload
      const { data: uploadData } = await api.post('/api/users/profile/picture/upload-url', {
        fileType: file.type
      });

      // Upload file to S3
      await fetch(uploadData.uploadUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      });

      // Update user profile with new picture
      const { data: profileData } = await api.put('/api/users/profile/picture', {
        key: uploadData.key
      });

      // Update user info in context
      updateUserInfo({
        ...userInfo,
        profilePicture: profileData.profilePicture
      });

    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload profile picture');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="profile-picture-upload">
      <div className="current-picture">
        <img
          src={userInfo?.profilePicture?.url || '/default-avatar.png'}
          alt="Profile"
          className="profile-image"
        />
      </div>
      
      <div className="upload-controls">
        <label className="upload-button">
          {isUploading ? 'Uploading...' : 'Change Picture'}
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            disabled={isUploading}
            style={{ display: 'none' }}
          />
        </label>
      </div>

      {error && <div className="error-message">{error}</div>}
    </div>
  );
};

export default ProfilePictureUpload; 