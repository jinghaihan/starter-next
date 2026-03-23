import { Buffer } from 'node:buffer'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

function setBaseS3Env() {
  vi.stubEnv('S3_ACCESS_KEY_ID', 'access_key')
  vi.stubEnv('S3_SECRET_ACCESS_KEY', 'secret_key')
  vi.stubEnv('S3_BUCKET_NAME', 'bucket-a')
  vi.stubEnv('S3_REGION', 'auto')
}

async function createProviderWithSendMock() {
  const { S3StorageProvider } = await import('../../packages/storage/src/provider/s3')
  const provider = new S3StorageProvider() as any
  const sendMock = vi.fn().mockResolvedValue({})
  provider.client = { send: sendMock }
  return { provider, sendMock }
}

describe('s3 storage provider', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('throws when required env is missing', async () => {
    vi.stubEnv('S3_ACCESS_KEY_ID', '')
    vi.stubEnv('S3_SECRET_ACCESS_KEY', 'secret_key')
    vi.stubEnv('S3_BUCKET_NAME', 'bucket-a')
    vi.stubEnv('S3_REGION', 'auto')

    const { S3StorageProvider } = await import('../../packages/storage/src/provider/s3')
    expect(() => new S3StorageProvider()).toThrow('[env:storage] S3_ACCESS_KEY_ID is required')
  })

  it('uploads and prefers S3_PUBLIC_URL when available', async () => {
    setBaseS3Env()
    vi.stubEnv('S3_ENDPOINT', 'https://r2.example.com')
    vi.stubEnv('S3_PUBLIC_URL', 'https://cdn.example.com/public')

    const { provider, sendMock } = await createProviderWithSendMock()
    const result = await provider.uploadFile({
      userId: 'user_test',
      fileName: 'resume.pdf',
      fileType: 'application/pdf',
      fileBuffer: Buffer.from('hello'),
      folder: 'uploads/docs',
    })

    expect(result.key).toMatch(/^uploads\/docs\/user_test\//)
    expect(result.key.endsWith('.pdf')).toBe(true)
    expect(result.url.startsWith('https://cdn.example.com/public/')).toBe(true)

    const putCommand = sendMock.mock.calls[0]?.[0]
    expect(putCommand.input).toEqual(expect.objectContaining({
      Bucket: 'bucket-a',
      Key: result.key,
      ContentType: 'application/pdf',
    }))
  })

  it('falls back to endpoint URL when S3_PUBLIC_URL is empty', async () => {
    setBaseS3Env()
    vi.stubEnv('S3_ENDPOINT', 'https://r2.example.com')
    vi.stubEnv('S3_PUBLIC_URL', '')

    const { provider } = await createProviderWithSendMock()
    const result = await provider.uploadFile({
      userId: 'user_test',
      fileName: 'avatar.png',
      fileType: 'image/png',
      fileBuffer: Buffer.from('img'),
    })

    expect(result.url.startsWith('https://r2.example.com/bucket-a/')).toBe(true)
  })

  it('falls back to aws host when endpoint and public url are empty', async () => {
    vi.stubEnv('S3_ACCESS_KEY_ID', 'access_key')
    vi.stubEnv('S3_SECRET_ACCESS_KEY', 'secret_key')
    vi.stubEnv('S3_BUCKET_NAME', 'bucket-a')
    vi.stubEnv('S3_REGION', 'us-east-1')
    vi.stubEnv('S3_ENDPOINT', '')
    vi.stubEnv('S3_PUBLIC_URL', '')

    const { provider } = await createProviderWithSendMock()
    const result = await provider.uploadFile({
      userId: 'user_test',
      fileName: 'avatar.webp',
      fileType: 'image/webp',
      fileBuffer: Buffer.from('img'),
    })

    expect(result.url.startsWith('https://bucket-a.s3.us-east-1.amazonaws.com/')).toBe(true)
  })
})
