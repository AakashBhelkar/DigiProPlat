import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Stack,
  TextField,
  Button,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar,
  CircularProgress,
  Alert,
  alpha,
  useTheme,
  ImageList,
  ImageListItem,
} from '@mui/material';
import { Iconify } from '../../components/iconify';
import { DashboardContent } from '../../layouts/dashboard/main';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';
import { format, parseISO } from 'date-fns';
import { CheckCircle, XCircle, Eye, MoreVertical, X, Download } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

interface KYCDocument {
  id: string;
  user_id: string;
  document_type: string;
  file_name: string;
  file_type: string;
  file_size: number;
  storage_path: string;
  status: 'pending' | 'approved' | 'rejected';
  admin_notes: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
  profiles?: {
    username: string;
    first_name: string;
    last_name: string;
    email: string;
    kyc_status: string;
  };
}

export const AdminKYCVerification: React.FC = () => {
  const theme = useTheme();
  const { user: adminUser } = useAuthStore();
  const [documents, setDocuments] = useState<KYCDocument[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [isReviewing, setIsReviewing] = useState(false);
  const [reviewAction, setReviewAction] = useState<'approve' | 'reject'>('approve');
  const [reviewNotes, setReviewNotes] = useState('');
  const [selectedDocument, setSelectedDocument] = useState<KYCDocument | null>(null);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('kyc_documents')
        .select(`
          *,
          profiles!kyc_documents_user_id_fkey (
            username,
            first_name,
            last_name,
            email,
            kyc_status
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDocuments(data || []);
    } catch (error: any) {
      console.error('Error fetching KYC documents:', error);
      toast.error(error.message || 'Failed to fetch KYC documents');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch =
      doc.file_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.profiles?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.profiles?.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || doc.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, documentId: string) => {
    setAnchorEl(event.currentTarget);
    setSelectedDocumentId(documentId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedDocumentId(null);
  };

  const handleView = (document: KYCDocument) => {
    setSelectedDocument(document);
    setViewDialogOpen(true);
    handleMenuClose();
  };

  const handleReview = (document: KYCDocument, action: 'approve' | 'reject') => {
    setSelectedDocument(document);
    setReviewAction(action);
    setReviewNotes('');
    setReviewDialogOpen(true);
    handleMenuClose();
  };

  const handleReviewSubmit = async () => {
    if (!selectedDocument || !adminUser) return;

    setIsReviewing(true);
    try {
      // Update document status
      const { error: docError } = await supabase
        .from('kyc_documents')
        .update({
          status: reviewAction === 'approve' ? 'approved' : 'rejected',
          admin_notes: reviewNotes.trim() || null,
          reviewed_by: adminUser.id,
          reviewed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', selectedDocument.id);

      if (docError) throw docError;

      // Update user profile KYC status if approving
      if (reviewAction === 'approve') {
        // Check if all user's documents are approved
        const { data: userDocs } = await supabase
          .from('kyc_documents')
          .select('status')
          .eq('user_id', selectedDocument.user_id);

        const allApproved = userDocs?.every((doc) => doc.status === 'approved');

        if (allApproved) {
          const { error: profileError } = await supabase
            .from('profiles')
            .update({
              kyc_status: 'verified',
              updated_at: new Date().toISOString(),
            })
            .eq('id', selectedDocument.user_id);

          if (profileError) {
            console.error('Error updating profile:', profileError);
            // Continue even if profile update fails
          }
        }
      } else if (reviewAction === 'reject') {
        // Update profile to rejected if rejecting
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            kyc_status: 'rejected',
            updated_at: new Date().toISOString(),
          })
          .eq('id', selectedDocument.user_id);

        if (profileError) {
          console.error('Error updating profile:', profileError);
        }
      }

      toast.success(`Document ${reviewAction === 'approve' ? 'approved' : 'rejected'} successfully!`);
      setReviewDialogOpen(false);
      setSelectedDocument(null);
      await fetchDocuments();
    } catch (error: any) {
      console.error('Error reviewing document:', error);
      toast.error(error.message || 'Failed to review document');
    } finally {
      setIsReviewing(false);
    }
  };

  const getStatusChip = (status: string) => {
    switch (status) {
      case 'approved':
        return <Chip label="Approved" color="success" size="small" />;
      case 'rejected':
        return <Chip label="Rejected" color="error" size="small" />;
      case 'pending':
        return <Chip label="Pending" color="warning" size="small" />;
      default:
        return <Chip label={status} size="small" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <DashboardContent>
      <Stack spacing={4}>
        {/* Header */}
        <Box>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            KYC Verification
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Review and verify user identity documents
          </Typography>
        </Box>

        {/* Filters */}
        <Card>
          <CardContent>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                fullWidth
                placeholder="Search documents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Iconify icon="solar:magnifer-bold-duotone" />
                    </InputAdornment>
                  ),
                }}
              />
              <FormControl sx={{ minWidth: 200 }}>
                <InputLabel>Status</InputLabel>
                <Select
                  value={statusFilter}
                  label="Status"
                  onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
                >
                  <MenuItem value="all">All Status</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="approved">Approved</MenuItem>
                  <MenuItem value="rejected">Rejected</MenuItem>
                </Select>
              </FormControl>
            </Stack>
          </CardContent>
        </Card>

        {/* Documents Table */}
        <Card>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, color: 'primary.main' }}>User</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: 'primary.main' }}>Document</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: 'primary.main' }}>Type</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: 'primary.main' }}>Size</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: 'primary.main' }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: 'primary.main' }}>Submitted</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700, color: 'primary.main' }}>
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                      <CircularProgress />
                    </TableCell>
                  </TableRow>
                ) : filteredDocuments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                      <Stack spacing={2} alignItems="center">
                        <Iconify icon="solar:document-bold-duotone" width={64} sx={{ color: 'text.disabled' }} />
                        <Typography variant="h6" color="text.secondary">
                          No KYC documents found
                        </Typography>
                        <Typography variant="body2" color="text.disabled">
                          {searchTerm || statusFilter !== 'all'
                            ? 'Try adjusting your search or filters'
                            : 'No documents have been submitted yet'}
                        </Typography>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredDocuments.map((doc) => (
                    <TableRow
                      key={doc.id}
                      sx={{
                        '&:hover': {
                          bgcolor: alpha(theme.palette.primary.main, 0.04),
                        },
                      }}
                    >
                      <TableCell>
                        <Stack direction="row" alignItems="center" spacing={2}>
                          <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                            {doc.profiles?.first_name?.[0] || doc.profiles?.username?.[0] || 'U'}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight={600}>
                              {doc.profiles?.first_name} {doc.profiles?.last_name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {doc.profiles?.email || doc.profiles?.username}
                            </Typography>
                          </Box>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>
                          {doc.file_name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {doc.document_type.replace('_', ' ')}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={doc.document_type.replace('_', ' ')}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {formatFileSize(doc.file_size)}
                        </Typography>
                      </TableCell>
                      <TableCell>{getStatusChip(doc.status)}</TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {format(parseISO(doc.created_at), 'MMM dd, yyyy')}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <IconButton size="small" onClick={(e) => handleMenuOpen(e, doc.id)}>
                          <MoreVertical size={18} />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>

        {/* Actions Menu */}
        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
          <MenuItem onClick={() => selectedDocumentId && handleView(documents.find((d) => d.id === selectedDocumentId)!)}>
            <Iconify icon="solar:eye-bold-duotone" sx={{ mr: 1 }} />
            View Document
          </MenuItem>
          {selectedDocumentId && documents.find((d) => d.id === selectedDocumentId)?.status === 'pending' && (
            <>
              <MenuItem
                onClick={() =>
                  selectedDocumentId && handleReview(documents.find((d) => d.id === selectedDocumentId)!, 'approve')
                }
                sx={{ color: 'success.main' }}
              >
                <Iconify icon="solar:check-circle-bold-duotone" sx={{ mr: 1 }} />
                Approve
              </MenuItem>
              <MenuItem
                onClick={() =>
                  selectedDocumentId && handleReview(documents.find((d) => d.id === selectedDocumentId)!, 'reject')
                }
                sx={{ color: 'error.main' }}
              >
                <Iconify icon="solar:close-circle-bold-duotone" sx={{ mr: 1 }} />
                Reject
              </MenuItem>
            </>
          )}
        </Menu>

        {/* View Document Dialog */}
        <Dialog open={viewDialogOpen} onClose={() => setViewDialogOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Typography variant="h6" fontWeight={700}>
                View Document
              </Typography>
              <IconButton onClick={() => setViewDialogOpen(false)} size="small">
                <X size={20} />
              </IconButton>
            </Stack>
          </DialogTitle>
          <DialogContent>
            {selectedDocument && (
              <Stack spacing={3} sx={{ mt: 1 }}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    User Information
                  </Typography>
                  <Card variant="outlined">
                    <CardContent>
                      <Stack spacing={1}>
                        <Typography variant="body2">
                          <strong>Name:</strong> {selectedDocument.profiles?.first_name} {selectedDocument.profiles?.last_name}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Email:</strong> {selectedDocument.profiles?.email}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Username:</strong> {selectedDocument.profiles?.username}
                        </Typography>
                        <Typography variant="body2">
                          <strong>KYC Status:</strong> {selectedDocument.profiles?.kyc_status}
                        </Typography>
                      </Stack>
                    </CardContent>
                  </Card>
                </Box>

                <Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Document Information
                  </Typography>
                  <Card variant="outlined">
                    <CardContent>
                      <Stack spacing={1}>
                        <Typography variant="body2">
                          <strong>File Name:</strong> {selectedDocument.file_name}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Type:</strong> {selectedDocument.document_type.replace('_', ' ')}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Size:</strong> {formatFileSize(selectedDocument.file_size)}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Status:</strong> {getStatusChip(selectedDocument.status)}
                        </Typography>
                        {selectedDocument.admin_notes && (
                          <Typography variant="body2">
                            <strong>Admin Notes:</strong> {selectedDocument.admin_notes}
                          </Typography>
                        )}
                      </Stack>
                    </CardContent>
                  </Card>
                </Box>

                <Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Document Preview
                  </Typography>
                  <Card variant="outlined">
                    <CardContent>
                      {selectedDocument.file_type.startsWith('image/') ? (
                        <Box
                          component="img"
                          src={selectedDocument.storage_path}
                          alt={selectedDocument.file_name}
                          sx={{
                            maxWidth: '100%',
                            maxHeight: 400,
                            objectFit: 'contain',
                            borderRadius: 1,
                          }}
                        />
                      ) : (
                        <Stack spacing={2} alignItems="center" sx={{ py: 4 }}>
                          <Iconify icon="solar:file-bold-duotone" width={64} sx={{ color: 'text.disabled' }} />
                          <Typography variant="body2" color="text.secondary">
                            PDF Document
                          </Typography>
                          <Button
                            variant="outlined"
                            startIcon={<Download size={16} />}
                            href={selectedDocument.storage_path}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Download PDF
                          </Button>
                        </Stack>
                      )}
                    </CardContent>
                  </Card>
                </Box>
              </Stack>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 3, pt: 2 }}>
            <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
            {selectedDocument?.status === 'pending' && (
              <>
                <Button
                  variant="outlined"
                  color="error"
                  onClick={() => {
                    setViewDialogOpen(false);
                    handleReview(selectedDocument, 'reject');
                  }}
                >
                  Reject
                </Button>
                <Button
                  variant="contained"
                  color="success"
                  onClick={() => {
                    setViewDialogOpen(false);
                    handleReview(selectedDocument, 'approve');
                  }}
                >
                  Approve
                </Button>
              </>
            )}
          </DialogActions>
        </Dialog>

        {/* Review Dialog */}
        <Dialog open={reviewDialogOpen} onClose={() => setReviewDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Alert severity={reviewAction === 'approve' ? 'success' : 'error'} icon={reviewAction === 'approve' ? <CheckCircle size={20} /> : <XCircle size={20} />}>
                {reviewAction === 'approve' ? 'Approve Document' : 'Reject Document'}
              </Alert>
              <IconButton onClick={() => setReviewDialogOpen(false)} size="small">
                <X size={20} />
              </IconButton>
            </Stack>
          </DialogTitle>
          <DialogContent>
            <Stack spacing={3} sx={{ mt: 1 }}>
              <Typography variant="body2">
                Are you sure you want to <strong>{reviewAction}</strong> this document?
              </Typography>
              {selectedDocument && (
                <Typography variant="body2" color="text.secondary">
                  Document: <strong>{selectedDocument.file_name}</strong>
                  <br />
                  User: <strong>{selectedDocument.profiles?.first_name} {selectedDocument.profiles?.last_name}</strong>
                </Typography>
              )}
              <TextField
                fullWidth
                label="Notes (Optional)"
                multiline
                rows={3}
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                placeholder={reviewAction === 'approve' ? 'Add any notes about this approval...' : 'Explain why this document was rejected...'}
                helperText={reviewAction === 'reject' ? 'Please provide a reason for rejection' : ''}
              />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 3, pt: 2 }}>
            <Button onClick={() => setReviewDialogOpen(false)} disabled={isReviewing}>
              Cancel
            </Button>
            <Button
              variant="contained"
              color={reviewAction === 'approve' ? 'success' : 'error'}
              onClick={handleReviewSubmit}
              disabled={isReviewing || (reviewAction === 'reject' && !reviewNotes.trim())}
              startIcon={isReviewing ? <CircularProgress size={16} /> : reviewAction === 'approve' ? <CheckCircle size={16} /> : <XCircle size={16} />}
            >
              {isReviewing ? 'Processing...' : reviewAction === 'approve' ? 'Approve' : 'Reject'}
            </Button>
          </DialogActions>
        </Dialog>
      </Stack>
    </DashboardContent>
  );
};

