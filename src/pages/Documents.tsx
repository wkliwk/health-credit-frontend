import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Alert,
  Chip,
  CircularProgress,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import DescriptionIcon from '@mui/icons-material/Description';
import ImageIcon from '@mui/icons-material/Image';
import { listDocuments, deleteDocument, DocumentMeta } from '../services/documents';

export default function Documents() {
  const [docs, setDocs] = useState<DocumentMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDocs = async () => {
    try {
      setLoading(true);
      const data = await listDocuments();
      setDocs(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await deleteDocument(id);
      setDocs((prev) => prev.filter((d) => d.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete');
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return <ImageIcon />;
    return <DescriptionIcon />;
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto' }}>
      <Typography variant="h5" gutterBottom>
        My Documents
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {docs.length === 0 ? (
        <Alert severity="info">No documents yet. Upload your first health document.</Alert>
      ) : (
        <List>
          {docs.map((doc) => (
            <ListItem key={doc.id} divider>
              <Box sx={{ mr: 2, color: 'text.secondary' }}>{getIcon(doc.mimeType)}</Box>
              <ListItemText
                primary={doc.fileName}
                secondary={
                  <Box component="span" sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                    <Chip label={formatSize(doc.size)} size="small" variant="outlined" />
                    <Chip label={formatDate(doc.createdAt)} size="small" variant="outlined" />
                    {doc.expiresAt && (
                      <Chip
                        label={`Expires ${formatDate(doc.expiresAt)}`}
                        size="small"
                        color="warning"
                        variant="outlined"
                      />
                    )}
                  </Box>
                }
              />
              <ListItemSecondaryAction>
                <IconButton edge="end" onClick={() => handleDelete(doc.id)} color="error">
                  <DeleteIcon />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  );
}
