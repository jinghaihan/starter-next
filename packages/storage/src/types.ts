import type { Buffer } from 'node:buffer'

export interface UploadFileParams {
  userId: string
  fileName: string
  fileType: string
  fileBuffer: Buffer
  folder?: string
}

export interface UploadFileResult {
  key: string
  url: string
}

export interface StorageProvider {
  uploadFile: (params: UploadFileParams) => Promise<UploadFileResult>
}
