import type { StorageProvider, UploadFileParams, UploadFileResult } from './types'
import { S3StorageProvider } from './provider/s3'

let provider: StorageProvider | null = null

function getStorageProvider(): StorageProvider {
  if (!provider)
    provider = new S3StorageProvider()
  return provider
}

export async function uploadFile(params: UploadFileParams): Promise<UploadFileResult> {
  return await getStorageProvider().uploadFile(params)
}

export * from './types'
