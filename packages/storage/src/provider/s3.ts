import type { StorageProvider, UploadFileParams, UploadFileResult } from '../types'
import { randomUUID } from 'node:crypto'
import process from 'node:process'
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'

const S3_KEY_SANITIZE_PATTERN = /[^\w/-]/g

export class S3StorageProvider implements StorageProvider {
  private client: S3Client
  private bucketName: string
  private region: string
  private endpoint?: string
  private publicUrl?: string

  constructor() {
    const accessKeyId = process.env.S3_ACCESS_KEY_ID
    if (!accessKeyId)
      throw new Error('Missing S3_ACCESS_KEY_ID')

    const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY
    if (!secretAccessKey)
      throw new Error('Missing S3_SECRET_ACCESS_KEY')

    const bucketName = process.env.S3_BUCKET_NAME
    if (!bucketName)
      throw new Error('Missing S3_BUCKET_NAME')

    const region = process.env.S3_REGION
    if (!region)
      throw new Error('Missing S3_REGION')

    const endpoint = process.env.S3_ENDPOINT?.trim() || undefined
    const publicUrl = process.env.S3_PUBLIC_URL?.trim() || undefined

    this.client = new S3Client({
      region,
      endpoint,
      forcePathStyle: Boolean(endpoint),
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    })

    this.bucketName = bucketName
    this.region = region
    this.endpoint = endpoint
    this.publicUrl = publicUrl
  }

  public async uploadFile(params: UploadFileParams): Promise<UploadFileResult> {
    const key = this.buildObjectKey(params)
    await this.client.send(new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      Body: params.fileBuffer,
      ContentType: params.fileType,
    }))

    return {
      key,
      url: this.buildPublicUrl(key),
    }
  }

  private buildObjectKey(params: UploadFileParams): string {
    const extension = this.getFileExtension(params.fileName)
    const folder = this.sanitizePathSegment(params.folder ?? 'uploads')
    const userId = this.sanitizePathSegment(params.userId)
    const fileId = `${Date.now()}-${randomUUID()}${extension}`
    return `${folder}/${userId}/${fileId}`
  }

  private buildPublicUrl(key: string): string {
    const normalizedKey = key.split('/').map(encodeURIComponent).join('/')
    if (this.publicUrl)
      return `${this.publicUrl.replace(/\/$/, '')}/${normalizedKey}`

    if (this.endpoint)
      return `${this.endpoint.replace(/\/$/, '')}/${this.bucketName}/${normalizedKey}`

    return `https://${this.bucketName}.s3.${this.region}.amazonaws.com/${normalizedKey}`
  }

  private getFileExtension(fileName: string): string {
    const lastDot = fileName.lastIndexOf('.')
    if (lastDot < 0)
      return ''
    return fileName.slice(lastDot)
  }

  private sanitizePathSegment(value: string): string {
    return value
      .split('/')
      .map(part => part.trim().replace(S3_KEY_SANITIZE_PATTERN, ''))
      .filter(Boolean)
      .join('/')
  }
}
