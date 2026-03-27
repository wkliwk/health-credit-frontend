import { useState, useCallback } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  LinearProgress,
  TextField,
  Typography,
  Alert,
  Chip,
  ToggleButtonGroup,
  ToggleButton,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import LockIcon from '@mui/icons-material/Lock';
import { encryptFile } from '../services/crypto';
import { uploadDocument } from '../services/documents';
import {
  type DocumentType,
  CARD_ICONS,
  DOCUMENT_TYPE_LABELS,
} from '../constants/gradients';

const DOCUMENT_TYPES: DocumentType[] = [
  'STI_PANEL',
  'HIV',
  'STI_PARTIAL',
  'HEPATITIS',
  'VACCINE',
  'BLOOD_WORK',
  'OTHER',
];

export default function Upload() {
  const [files, setFiles] = useState<File[]>([]);
  const [password, setPassword] = useState('');
  const [documentType, setDocumentType] = useState<DocumentType>('OTHER');
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const dropped = Array.from(e.dataTransfer.files).filter(
      (f) => f.type.startsWith('image/') || f.type === 'application/pdf',
    );
    setFiles((prev) => [...prev, ...dropped]);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selected = Array.from(e.target.files).filter(
        (f) => f.type.startsWith('image/') || f.type === 'application/pdf',
      );
      setFiles((prev) => [...prev, ...selected]);
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleTypeChange = (_: React.MouseEvent<HTMLElement>, value: DocumentType | null) => {
    // Prevent deselecting — always keep a type selected
    if (value !== null) {
      setDocumentType(value);
    }
  };

  const handleUpload = async () => {
    if (!files.length || !password) return;

    setUploading(true);
    setError('');
    setSuccess('');

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setProgress(`Encrypting ${file.name}... (${i + 1}/${files.length})`);

        const { encrypted, salt, iv } = await encryptFile(file, password);

        setProgress(`Uploading ${file.name}... (${i + 1}/${files.length})`);
        await uploadDocument(encrypted, file.name, salt, iv, documentType);
      }

      setSuccess(`${files.length} document(s) encrypted and uploaded successfully.`);
      setFiles([]);
      setPassword('');
      setDocumentType('OTHER');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
      setProgress('');
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto' }}>
      <Typography variant="h5" gutterBottom>
        Upload Documents
      </Typography>

      <Alert severity="info" icon={<LockIcon />} sx={{ mb: 3 }}>
        Your documents are encrypted in your browser before upload. The server never sees your
        unencrypted files.
      </Alert>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      <Card
        variant="outlined"
        sx={{
          mb: 3,
          border: '2px dashed',
          borderColor: 'divider',
          textAlign: 'center',
          p: 4,
          cursor: 'pointer',
          '&:hover': { borderColor: 'primary.main' },
        }}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
      >
        <CardContent>
          <CloudUploadIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
          <Typography variant="body1" gutterBottom>
            Drag & drop files here, or click to select
          </Typography>
          <Typography variant="body2" color="text.secondary">
            PDF and image files (JPG, PNG) accepted
          </Typography>
          <Button variant="outlined" component="label" sx={{ mt: 2 }}>
            Select Files
            <input
              type="file"
              hidden
              multiple
              accept="image/*,.pdf"
              onChange={handleFileSelect}
            />
          </Button>
        </CardContent>
      </Card>

      {files.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            Selected files ({files.length}):
          </Typography>
          {files.map((file, i) => (
            <Chip
              key={i}
              label={`${file.name} (${formatSize(file.size)})`}
              onDelete={() => removeFile(i)}
              sx={{ m: 0.5 }}
            />
          ))}
        </Box>
      )}

      {/* Document type selector */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" gutterBottom>
          Document Type
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
          Choose the type that best describes your document.
        </Typography>
        <ToggleButtonGroup
          value={documentType}
          exclusive
          onChange={handleTypeChange}
          aria-label="document type"
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 1,
            '& .MuiToggleButtonGroup-grouped': {
              border: '1px solid rgba(255,255,255,0.1) !important',
              borderRadius: '8px !important',
              mx: 0,
            },
          }}
        >
          {DOCUMENT_TYPES.map((type) => (
            <ToggleButton
              key={type}
              value={type}
              aria-label={DOCUMENT_TYPE_LABELS[type]}
              sx={{
                px: 1.5,
                py: 0.75,
                color: 'text.secondary',
                fontSize: '13px',
                fontWeight: 500,
                textTransform: 'none',
                backgroundColor: 'rgba(255,255,255,0.03)',
                '&.Mui-selected': {
                  backgroundColor: 'rgba(99,102,241,0.18)',
                  color: 'primary.light',
                  borderColor: 'primary.main !important',
                  '&:hover': {
                    backgroundColor: 'rgba(99,102,241,0.25)',
                  },
                },
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.06)',
                },
              }}
            >
              <Box component="span" sx={{ mr: 0.75, fontSize: '16px', lineHeight: 1 }}>
                {CARD_ICONS[type]}
              </Box>
              {DOCUMENT_TYPE_LABELS[type]}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </Box>

      <TextField
        fullWidth
        type="password"
        label="Encryption Password"
        helperText="This password encrypts your files. You'll need it to decrypt them later."
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        sx={{ mb: 3 }}
        disabled={uploading}
      />

      {uploading && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {progress}
          </Typography>
          <LinearProgress />
        </Box>
      )}

      <Button
        variant="contained"
        fullWidth
        size="large"
        onClick={handleUpload}
        disabled={!files.length || !password || uploading}
        startIcon={<LockIcon />}
      >
        Encrypt & Upload
      </Button>
    </Box>
  );
}
