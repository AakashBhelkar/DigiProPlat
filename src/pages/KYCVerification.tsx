import React from 'react';
import { KYCVerification } from '../components/KYC/KYCVerification';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

interface KYCData {
  fullName: string;
  dob: string;
  address: string;
  idType: 'passport' | 'drivers_license' | 'national_id';
  idNumber: string;
}

export const KYCVerificationPage: React.FC = () => {
  const { user, updateUser } = useAuthStore();

  const handleKYCSubmit = async (_data: KYCData, _documents: File[]) => {
    try {
      // In a real implementation, this would:
      // 1. Upload documents to secure storage
      // 2. Submit KYC data to verification service
      // 3. Update user status to 'pending'
      // 4. Send confirmation email
      
      await updateUser({ kycStatus: 'pending' });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success('KYC verification submitted successfully!');
    } catch {
      toast.error('Failed to submit KYC verification');
      throw new Error('Failed to submit KYC verification');
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-white">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Identity Verification</h1>
          <p className="text-gray-600">
            Complete your identity verification to unlock all platform features and increase your withdrawal limits.
          </p>
        </div>

        <KYCVerification
          currentStatus={user?.kycStatus || 'pending'}
          onSubmit={handleKYCSubmit}
        />
      </div>
    </div>
  );
};