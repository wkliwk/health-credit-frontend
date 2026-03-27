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
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import LockIcon from '@mui/icons-material/Lock';
import { encryptFile } from '../services/crypto';
import { uploadDocument } from '../services/documents';

export default function Upload() {
  const [files, setFiles] = useState<File[]>([]);
  const [password, setPassword] = useState('');
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

  const handleUpload = async () => {
    if (!files.length || !password) return;

    setUploading(true);
    setError('');
    setSuccess('');

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setProgress(`Encrypting ${file.name}... (${i + 1}/${files.length})`);

        const { encrypted } = await encryptFile(file, password);

        setProgress(`Uploading ${file.name}... (${i + 1}/${files.length})`);
        await uploadDocument(encrypted, file.name, file.type);
      }

      setSuccess(`${files.length} document(s) encrypted and uploaded successfully.`);
      setFiles([]);
      setPassword('');
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
