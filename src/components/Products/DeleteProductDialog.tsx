import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Alert,
} from '@mui/material';
import { AlertTriangle } from 'lucide-react';

interface DeleteProductDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  productTitle?: string;
  isDeleting?: boolean;
}

export const DeleteProductDialog: React.FC<DeleteProductDialogProps> = ({
  open,
  onClose,
  onConfirm,
  productTitle,
  isDeleting = false,
}) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Alert severity="warning" icon={<AlertTriangle size={20} />}>
          Delete Product
        </Alert>
      </DialogTitle>
      <DialogContent>
        <DialogContentText>
          Are you sure you want to delete <strong>{productTitle || 'this product'}</strong>?
          <br />
          <br />
          This action cannot be undone. All associated files and data will be permanently deleted.
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ p: 3, pt: 2 }}>
        <Button onClick={onClose} disabled={isDeleting}>
          Cancel
        </Button>
        <Button
          onClick={onConfirm}
          color="error"
          variant="contained"
          disabled={isDeleting}
        >
          {isDeleting ? 'Deleting...' : 'Delete Product'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

