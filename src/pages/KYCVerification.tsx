import React, { useState } from 'react';
import { Box, Stack, Typography } from '@mui/material';
import { KYCVerification } from '../components/KYC/KYCVerification';
import { useAuthStore } from '../store/authStore';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import { DashboardContent } from '../layouts/dashboard/main';

interface KYCData {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  nationality: string;
  address: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  phoneNumber: string;
  occupation: string;
  businessType?: string;
  taxId?: string;
}

export const KYCVerificationPage: React.FC = () => {
  const { user, updateUser, checkAuth } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleKYCSubmit = async (data: KYCData, documents: File[]) => {
    if (!user) {
      toast.error('You must be logged in to submit KYC verification');
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Upload documents to Supabase Storage
      const uploadedDocuments = [];
      for (const document of documents) {
        const fileExt = document.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}-${document.name}`;
        const filePath = `kyc-documents/${fileName}`;

        // Upload to storage
        const { error: uploadError } = await supabase.storage
          .from('kyc-documents')
          .upload(filePath, document, {
            cacheControl: '3600',
            upsert: false,
          });

        if (uploadError) {
          throw new Error(`Failed to upload ${document.name}: ${uploadError.message}`);
        }

        // Get storage path
        const { data: { publicUrl } } = supabase.storage
          .from('kyc-documents')
          .getPublicUrl(filePath);

        // Determine document type from file name or use 'other'
        let documentType = 'other';
        const fileNameLower = document.name.toLowerCase();
        if (fileNameLower.includes('passport')) {
          documentType = 'passport';
        } else if (fileNameLower.includes('driver') || fileNameLower.includes('license')) {
          documentType = 'drivers_license';
        } else if (fileNameLower.includes('id') || fileNameLower.includes('identity')) {
          documentType = 'national_id';
        } else if (fileNameLower.includes('address') || fileNameLower.includes('proof')) {
          documentType = 'proof_of_address';
        }

        // Save document metadata to database
        const { data: docData, error: docError } = await supabase
          .from('kyc_documents')
          .insert({
            user_id: user.id,
            document_type: documentType,
            file_name: document.name,
            file_type: document.type,
            file_size: document.size,
            storage_path: publicUrl,
            status: 'pending',
          })
          .select()
          .single();

        if (docError) {
          console.error('Error saving document metadata:', docError);
          // Continue even if metadata save fails
        } else {
          uploadedDocuments.push(docData);
        }
      }

      // 2. Update user profile with KYC status
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          kyc_status: 'pending',
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (updateError) {
        throw new Error(`Failed to update profile: ${updateError.message}`);
      }

      // 3. Refresh user data
      await checkAuth();

      toast.success('KYC verification submitted successfully! Your documents are under review.');
    } catch (error: any) {
      console.error('KYC submission error:', error);
      toast.error(error.message || 'Failed to submit KYC verification');
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardContent>
      <Box sx={{ maxWidth: 1200, mx: 'auto', py: 4 }}>
        <Stack spacing={3}>
          <Box>
            <Typography variant="h4" fontWeight={700} gutterBottom>
              Identity Verification
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Complete your identity verification to unlock all platform features and increase your withdrawal limits.
            </Typography>
          </Box>

          <KYCVerification
            currentStatus={user?.kycStatus || 'pending'}
            onSubmit={handleKYCSubmit}
          />
        </Stack>
      </Box>
    </DashboardContent>
  );
};