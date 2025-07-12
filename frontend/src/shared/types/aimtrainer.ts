// AimTrainer 相關類型定義

export interface AimTrainerRecord {
  id: number;
  userId: number;
  fileTimestamp: string;
  fileName: string;
  challengeName: string;
  shotsHit: number;
  kills: number;
  weapon: string;
  accuracy: number;
  damage: number;
  criticalShots: number;
  totalShots: number;
  roundTime: number;
  uploadedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface AimTrainerUploadResult {
  totalFiles: number;
  processedFiles: number;
  skippedFiles: number;
  totalRecords: number;
  duplicatesRemoved: number;
  newRecords: number;
  errors: string[];
}

export interface AimTrainerStatistics {
  totalRecords: number;
  totalShots: number;
  totalHits: number;
  totalDamage: number;
  totalCrits: number;
  avgAccuracy: number;
  weapons: Array<{
    weapon: string;
    count: number;
    avgAccuracy: number;
  }>;
  challenges: Array<{
    challengeName: string;
    count: number;
    avgAccuracy: number;
  }>;
  recentUploads: Array<{
    fileName: string;
    fileTimestamp: string;
    uploadedAt: string;
    recordCount: number;
  }>;
}

export interface AimTrainerUploadProps {
  onUploadComplete: (result: AimTrainerUploadResult) => void;
  onError: (error: string) => void;
}

export interface AimTrainerStatsProps {
  statistics: AimTrainerStatistics;
}

export interface AimTrainerRecordsProps {
  records: AimTrainerRecord[];
  onRecordsChange: () => void;
} 