// Backend DocumentType enum — must match health-credit-backend Document model
export type DocumentType =
  | 'STI_PANEL'
  | 'HIV'
  | 'STI_PARTIAL'
  | 'HEPATITIS'
  | 'VACCINE'
  | 'BLOOD_WORK'
  | 'OTHER';

// Legacy local type used by detectDocumentType filename fallback
type LegacyDocumentType = 'sti' | 'vaccine' | 'blood' | 'general';

const LEGACY_TO_BACKEND: Record<LegacyDocumentType, DocumentType> = {
  sti: 'STI_PANEL',
  vaccine: 'VACCINE',
  blood: 'BLOOD_WORK',
  general: 'OTHER',
};

export const CARD_GRADIENTS: Record<DocumentType, string> = {
  STI_PANEL: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
  HIV: 'linear-gradient(135deg, #7C3AED 0%, #C026D3 100%)',
  STI_PARTIAL: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
  HEPATITIS: 'linear-gradient(135deg, #EA580C 0%, #F59E0B 100%)',
  VACCINE: 'linear-gradient(135deg, #10B981 0%, #06B6D4 100%)',
  BLOOD_WORK: 'linear-gradient(135deg, #F59E0B 0%, #EF4444 100%)',
  OTHER: 'linear-gradient(135deg, #3B82F6 0%, #6366F1 100%)',
};

export const CARD_ICONS: Record<DocumentType, string> = {
  STI_PANEL: '🔬',
  HIV: '🧬',
  STI_PARTIAL: '🔬',
  HEPATITIS: '🫀',
  VACCINE: '💉',
  BLOOD_WORK: '🩸',
  OTHER: '📋',
};

export const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  STI_PANEL: 'STI Panel',
  HIV: 'HIV Test',
  STI_PARTIAL: 'Individual STI',
  HEPATITIS: 'Hepatitis',
  VACCINE: 'Vaccine',
  BLOOD_WORK: 'Blood Work',
  OTHER: 'Other',
};

export function detectDocumentType(fileName: string): DocumentType {
  const lower = fileName.toLowerCase();
  if (lower.includes('sti') || lower.includes('std') || lower.includes('sexual')) {
    const legacy: LegacyDocumentType = 'sti';
    return LEGACY_TO_BACKEND[legacy];
  }
  if (lower.includes('hiv')) return 'HIV';
  if (lower.includes('hepatitis')) return 'HEPATITIS';
  if (lower.includes('vaccine') || lower.includes('vaccination') || lower.includes('immuniz')) {
    return LEGACY_TO_BACKEND['vaccine'];
  }
  if (lower.includes('blood') || lower.includes('cbc') || lower.includes('hematol')) {
    return LEGACY_TO_BACKEND['blood'];
  }
  return 'OTHER';
}
