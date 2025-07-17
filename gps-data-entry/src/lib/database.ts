// Simple database simulation using localStorage
export interface GPSRecord {
  id: string;
  projectId: string;
  projectName: string;
  taskName: string;
  latitude: number;
  longitude: number;
  altitude: number | null;
  accuracy: number | null;
  description: string;
  workType: string;
  dateCollected: string;
  collectedBy: string;
  attachmentNames: string[];
  timestamp: string;
}

export class GPSDatabase {
  private static readonly STORAGE_KEY = 'gps_data_records';

  static async saveRecord(record: Omit<GPSRecord, 'id' | 'timestamp'>): Promise<GPSRecord> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const newRecord: GPSRecord = {
      ...record,
      id: `gps-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
    };

    const existingRecords = this.getAllRecords();
    const updatedRecords = [...existingRecords, newRecord];

    if (typeof window !== 'undefined') {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedRecords));
    }

    return newRecord;
  }

  static getAllRecords(): GPSRecord[] {
    if (typeof window === 'undefined') return [];

    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error reading GPS records:', error);
      return [];
    }
  }

  static getRecordsByProject(projectId: string): GPSRecord[] {
    return this.getAllRecords().filter(record => record.projectId === projectId);
  }

  static deleteRecord(id: string): boolean {
    const records = this.getAllRecords();
    const filteredRecords = records.filter(record => record.id !== id);

    if (typeof window !== 'undefined') {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filteredRecords));
    }

    return filteredRecords.length < records.length;
  }

  static getRecordCount(): number {
    return this.getAllRecords().length;
  }

  static exportToCSV(): string {
    const records = this.getAllRecords();
    if (records.length === 0) return '';

    const headers = [
      'ID', 'Project Name', 'Task Name', 'Latitude', 'Longitude',
      'Altitude', 'Accuracy', 'Work Type', 'Description',
      'Date Collected', 'Collected By', 'Attachments', 'Timestamp'
    ];

    const csvContent = [
      headers.join(','),
      ...records.map(record => [
        record.id,
        `"${record.projectName}"`,
        `"${record.taskName}"`,
        record.latitude,
        record.longitude,
        record.altitude || '',
        record.accuracy || '',
        `"${record.workType}"`,
        `"${record.description}"`,
        record.dateCollected,
        `"${record.collectedBy}"`,
        `"${record.attachmentNames.join('; ')}"`,
        record.timestamp
      ].join(','))
    ].join('\n');

    return csvContent;
  }
}
