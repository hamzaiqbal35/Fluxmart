import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import ProtectedRoute from '../components/ProtectedRoute';
import { Camera, Save, KeyRound, Loader2, X, Trash2 } from 'lucide-react';
import Swal from 'sweetalert2';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const FILE_BASE_URL = API_URL.replace(/\/api$/, '');

const getAvatarUrl = (avatar) => {
  if (!avatar) return '';
  if (avatar.startsWith('http')) return avatar;
  return `${FILE_BASE_URL}${avatar}`;
};

const Profile = () => {
  const { user, isAuthenticated, updateUser, logout } = useAuth();
  const [formData, setFormData] = useState(() => ({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  }));
  const [avatarPreview, setAvatarPreview] = useState(
    user?.avatar ? getAvatarUrl(user.avatar) : ''
  );
  const [avatarFile, setAvatarFile] = useState(null);
  const [saving, setSaving] = useState(false);
  
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setStatusMessage({ type: 'error', text: 'New passwords do not match' });
      return;
    }
    if (passwordData.newPassword.length < 6) {
      setStatusMessage({ type: 'error', text: 'Password must be at least 6 characters long' });
      return;
    }

    try {
      setIsUpdatingPassword(true);
      const response = await api.put('/auth/update-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      
      setStatusMessage({ type: 'success', text: 'Password updated successfully' });
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setShowPasswordForm(false), 2000);
      

    } catch (error) {
      setStatusMessage({ type: 'error', text: error.response?.data?.message || 'Failed to update password' });
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  useEffect(() => {
    if (!user) return;
    setFormData({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || ''
    });
    setAvatarPreview(user.avatar ? getAvatarUrl(user.avatar) : '');
    setAvatarFile(null);
  }, [user]);

  if (!isAuthenticated) {
    return null;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    const url = URL.createObjectURL(file);
    setAvatarPreview(url);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      let latestUser;

      const profileRes = await api.put('/users/me', {
        name: formData.name,
        phone: formData.phone,
        email: formData.email
      });
      latestUser = profileRes.data.user;

      if (avatarFile) {
        const formDataUpload = new FormData();
        formDataUpload.append('avatar', avatarFile);
        const avatarRes = await api.put('/users/me/avatar', formDataUpload, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        latestUser = avatarRes.data.user;
      }

      if (latestUser) {
        updateUser(latestUser);
        setAvatarPreview(latestUser.avatar ? getAvatarUrl(latestUser.avatar) : avatarPreview);
        setFormData((prev) => ({
          ...prev,
          name: latestUser.name || prev.name,
          email: latestUser.email || prev.email,
          phone: latestUser.phone || prev.phone
        }));
      }

      setStatusMessage({ type: 'success', text: 'Profile updated successfully' });
    } catch (error) {
      setStatusMessage({ type: 'error', text: error.response?.data?.message || 'Failed to update profile' });
    } finally {
      setSaving(false);
      setTimeout(() => setStatusMessage({ type: '', text: '' }), 3000);
    }
  };

  const handleDeleteAccount = async () => {
    const result = await Swal.fire({
      title: 'Are you absolutely sure?',
      text: 'This action cannot be undone. This will permanently delete your account and remove your data from our servers.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete my account'
    });

    if (result.isConfirmed) {
      try {
        await api.delete('/users/me');
        await Swal.fire('Deleted!', 'Your account has been deleted.', 'success');
        logout();
      } catch (error) {
        Swal.fire('Error', error.response?.data?.message || 'Failed to delete account', 'error');
      }
    }
  };

  return (
    <ProtectedRoute>
      <div className="bg-gray-50 min-h-screen py-12 animate-fade-in">
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-black mb-1">Account Settings</h1>
              <p className="text-gray-500 text-sm">Manage your personal information and preferences.</p>
            </div>
          </div>

          {statusMessage.text && (
            <div className={`mb-6 p-4 rounded-lg text-sm flex items-center justify-between ${statusMessage.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
              <span>{statusMessage.text}</span>
              <button onClick={() => setStatusMessage({ type: '', text: '' })}><X className="w-4 h-4" /></button>
            </div>
          )}

          <div className="flex flex-col md:flex-row gap-8">
            
            <div className="md:w-1/3">
              <div className="bg-white p-8 rounded-2xl border border-border shadow-sm text-center sticky top-24">
                <div className="relative inline-block mb-6 group">
                  <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-100 border border-border flex items-center justify-center text-4xl font-semibold text-gray-400">
                    {avatarPreview ? (
                      <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      (user.name || 'U').charAt(0).toUpperCase()
                    )}
                  </div>
                  <label htmlFor="avatar-upload" className="absolute bottom-0 right-0 w-10 h-10 bg-black text-white rounded-full flex items-center justify-center cursor-pointer shadow-md hover:bg-gray-800 transition-colors opacity-0 group-hover:opacity-100">
                    <Camera className="w-4 h-4" />
                  </label>
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </div>
                <h2 className="text-xl font-bold text-black">{user?.name}</h2>
                <p className="text-sm text-gray-500 mb-6">{user?.email}</p>
                <div className="inline-flex items-center justify-center px-3 py-1 text-xs font-medium uppercase tracking-wider rounded-full bg-gray-100 text-black">
                  {user?.role} Account
                </div>
              </div>
            </div>

            <div className="md:w-2/3 space-y-8">
              <div className="bg-white p-8 rounded-2xl border border-border shadow-sm">
                <h3 className="text-lg font-bold text-black mb-6 border-b border-border pb-4">Personal Information</h3>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="profile-name" className="block text-sm font-medium text-black mb-2">Full Name</label>
                      <input id="profile-name" type="text" name="name" value={formData.name} onChange={handleChange} className="input-field bg-gray-50" />
                    </div>
                    <div>
                      <label htmlFor="profile-phone" className="block text-sm font-medium text-black mb-2">Phone Number</label>
                      <input id="profile-phone" type="tel" name="phone" value={formData.phone} onChange={handleChange} className="input-field bg-gray-50" />
                    </div>
                    <div className="md:col-span-2">
                      <label htmlFor="profile-email" className="block text-sm font-medium text-black mb-2">Email Address</label>
                      <input id="profile-email" type="email" name="email" value={formData.email} onChange={handleChange} className="input-field bg-gray-50" />
                    </div>
                  </div>
                  
                  <div className="flex justify-end pt-4">
                    <button type="submit" disabled={saving} className="btn-primary px-8 py-2.5 flex items-center shadow-sm">
                      {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                      {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              </div>

              <div className="bg-white p-8 rounded-2xl border border-border shadow-sm">
                <div className="flex justify-between items-center border-b border-border pb-4 mb-6">
                  <h3 className="text-lg font-bold text-black flex items-center">
                    <KeyRound className="w-5 h-5 mr-2 text-gray-400" /> Password & Security
                  </h3>
                  {!showPasswordForm && (
                    <button onClick={() => setShowPasswordForm(true)} className="text-sm font-medium text-gray-500 hover:text-black underline-offset-4 hover:underline">
                      Update Password
                    </button>
                  )}
                </div>

                {showPasswordForm ? (
                  <form onSubmit={handlePasswordChange} className="space-y-6 animate-fade-in">
                    <div>
                      <label className="block text-sm font-medium text-black mb-2">Current Password</label>
                      <input type="password" value={passwordData.currentPassword} onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})} required className="input-field bg-gray-50" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-black mb-2">New Password</label>
                        <input type="password" value={passwordData.newPassword} onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})} required minLength={6} className="input-field bg-gray-50" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-black mb-2">Confirm New Password</label>
                        <input type="password" value={passwordData.confirmPassword} onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})} required className="input-field bg-gray-50" />
                      </div>
                    </div>
                    <div className="flex justify-end gap-4 pt-4">
                      <button type="button" onClick={() => setShowPasswordForm(false)} className="px-6 py-2.5 text-sm font-medium text-gray-600 hover:text-black transition-colors" disabled={isUpdatingPassword}>
                        Cancel
                      </button>
                      <button type="submit" className="btn-primary px-8 py-2.5 flex items-center shadow-sm" disabled={isUpdatingPassword}>
                        {isUpdatingPassword ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                        {isUpdatingPassword ? 'Updating...' : 'Update Password'}
                      </button>
                    </div>
                  </form>
                ) : (
                  <p className="text-sm text-gray-500">
                    Ensure your account is using a long, random password to stay secure.
                  </p>
                )}
              </div>

              {/* Danger Zone */}
              {user?.role !== 'admin' && (
                <div className="bg-red-50 p-8 rounded-2xl border border-red-100 shadow-sm">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-bold text-red-700 flex items-center">
                        <Trash2 className="w-5 h-5 mr-2" /> Delete Account
                      </h3>
                      <p className="text-sm text-red-600 mt-2 max-w-lg">
                        Once you delete your account, there is no going back. Please be certain.
                        Note: You cannot delete your account if you have active orders.
                      </p>
                    </div>
                    <button 
                      onClick={handleDeleteAccount}
                      className="px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 transition-colors shadow-sm whitespace-nowrap"
                    >
                      Delete Account
                    </button>
                  </div>
                </div>
              )}

            </div>
            
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default Profile;