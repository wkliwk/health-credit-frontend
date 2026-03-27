export type DocumentType = 'sti' | 'vaccine' | 'blood' | 'general';

export const CARD_GRADIENTS: Record<DocumentType, string> = {
  sti: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
  vaccine: 'linear-gradient(135deg, #10B981 0%, #06B6D4 100%)',
  blood: 'linear-gradient(135deg, #F59E0B 0%, #EF4444 100%)',
  general: 'linear-gradient(135deg, #3B82F6 0%, #6366F1 100%)',
};

export const CARD_ICONS: Record<DocumentType, string> = {
  sti: '🔬',
  vaccine: '💉',
  blood: '🩸',
  general: '📋',
};

export function detectDocumentType(fileName: string): DocumentType {
  const lower = fileName.toLowerCase();
  if (lower.includes('sti') || lower.includes('std') || lower.includes('sexual')) return 'sti';
  if (lower.includes('vaccine') || lower.includes('vaccination') || lower.includes('immuniz')) return 'vaccine';
  if (lower.includes('blood') || lower.includes('cbc') || lower.includes('hematol')) return 'blood';
  return 'general';
}
