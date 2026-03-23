// Mock File Service for Testing File Upload System
// This provides sample data when the backend is not available

export interface MockFileInfo {
  id: string;
  filename: string;
  original_filename: string;
  url: string;
  type: string;
  mime_type: string;
  size: number;
  uploaded_at: string;
  context: string;
}

// Singleton class to maintain state across imports
class MockFileServiceClass {
  private static instance: MockFileServiceClass;
  private files: MockFileInfo[] = [
    {
      id: '1',
      filename: 'sample-document.pdf',
      original_filename: 'Course Syllabus.pdf',
      url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      type: 'document',
      mime_type: 'application/pdf',
      size: 13264,
      uploaded_at: '2024-01-15T10:30:00Z',
      context: 'course'
    },
    {
      id: '2',
      filename: 'sample-image.jpg',
      original_filename: 'Course Banner.jpg',
      url: 'https://picsum.photos/800/600?random=1',
      type: 'image',
      mime_type: 'image/jpeg',
      size: 245760,
      uploaded_at: '2024-01-16T14:20:00Z',
      context: 'course'
    },
    {
      id: '3',
      filename: 'sample-video.mp4',
      original_filename: 'Introduction Video.mp4',
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      type: 'video',
      mime_type: 'video/mp4',
      size: 5510872,
      uploaded_at: '2024-01-17T09:15:00Z',
      context: 'topic'
    },
    {
      id: '4',
      filename: 'sample-presentation.pptx',
      original_filename: 'Lecture Slides.pptx',
      url: '', // No URL to test fallback
      type: 'document',
      mime_type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      size: 1024000,
      uploaded_at: '2024-01-18T16:45:00Z',
      context: 'module'
    },
    {
      id: '5',
      filename: 'sample-audio.mp3',
      original_filename: 'Audio Lecture.mp3',
      url: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
      type: 'resource',
      mime_type: 'audio/mpeg',
      size: 3145728,
      uploaded_at: '2024-01-19T11:30:00Z',
      context: 'topic'
    }
  ];

  private constructor() {}

  static getInstance(): MockFileServiceClass {
    if (!MockFileServiceClass.instance) {
      MockFileServiceClass.instance = new MockFileServiceClass();
    }
    return MockFileServiceClass.instance;
  }
  // Simulate API delay
  private delay(ms: number = 500): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Get files for a specific context
  async getFiles(params: {
    courseId?: string;
    moduleId?: string;
    topicId?: string;
    context?: string;
  }): Promise<MockFileInfo[]> {
    await this.delay();
    
    // Filter files based on context if provided
    if (params.context) {
      return this.files.filter(file => file.context === params.context);
    }
    
    return [...this.files]; // Return a copy
  }

  // Upload file (mock)
  async uploadFile(
    file: File,
    type: string,
    context: any
  ): Promise<MockFileInfo> {
    await this.delay(1000); // Simulate upload time
    
    const mockFile: MockFileInfo = {
      id: Date.now().toString(),
      filename: file.name.toLowerCase().replace(/\s+/g, '-'),
      original_filename: file.name,
      url: URL.createObjectURL(file), // Create a blob URL for preview
      type: this.getFileType(file),
      mime_type: file.type,
      size: file.size,
      uploaded_at: new Date().toISOString(),
      context: context.type || 'general'
    };
    
    // Add to files array
    this.files.push(mockFile);
    
    return mockFile;
  }

  // Delete file (mock)
  async deleteFile(fileId: string): Promise<void> {
    await this.delay();
    const index = this.files.findIndex(file => file.id === fileId);
    if (index > -1) {
      this.files.splice(index, 1);
      console.log(`Mock: Deleted file ${fileId}. Remaining files:`, this.files.length);
    } else {
      console.warn(`Mock: File ${fileId} not found`);
    }
  }

  private getFileType(file: File): string {
    if (file.type.startsWith('image/')) return 'image';
    if (file.type.startsWith('video/')) return 'video';
    if (file.type.includes('pdf') || file.type.includes('document')) return 'document';
    return 'resource';
  }
}

// Export singleton instance
export const mockFileService = MockFileServiceClass.getInstance();