import { beforeEach, describe, expect, it, vi } from 'vitest'

const { uploadFileMock } = vi.hoisted(() => ({
  uploadFileMock: vi.fn(),
}))

vi.mock('@app-name/auth/server', () => ({
  requestInterceptor: (handler: (userId: string, request: Request) => Promise<Response>) =>
    async (request: Request) => await handler('user_test', request),
}))

vi.mock('@app-name/storage', () => ({
  uploadFile: uploadFileMock,
}))

async function callPost(request: Request) {
  const { POST } = await import('../../../src/app/api/storage/upload/route')
  return await POST(request as any)
}

function createUploadRequest({
  file,
  folder,
}: {
  file?: File
  folder?: string
}) {
  const formData = new FormData()
  if (file)
    formData.set('file', file)
  if (folder !== undefined)
    formData.set('folder', folder)
  return new Request('http://localhost/api/storage/upload', {
    method: 'POST',
    body: formData,
  })
}

describe('post /api/storage/upload', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 400 when file is missing', async () => {
    const request = createUploadRequest({})

    const response = await callPost(request)
    const body = await response.json()

    expect(response.status).toBe(400)
    expect(body.error).toBe('File is required')
    expect(uploadFileMock).not.toHaveBeenCalled()
  })

  it('returns 400 when file exceeds max size', async () => {
    const largeFile = new File(
      [new Uint8Array(10 * 1024 * 1024 + 1)],
      'large.txt',
      { type: 'text/plain' },
    )
    const request = createUploadRequest({ file: largeFile })

    const response = await callPost(request)
    const body = await response.json()

    expect(response.status).toBe(400)
    expect(body.error).toBe('File size exceeds 10MB limit')
    expect(uploadFileMock).not.toHaveBeenCalled()
  })

  it('returns 400 when folder contains invalid characters', async () => {
    const file = new File(['hello'], 'hello.txt', { type: 'text/plain' })
    const request = createUploadRequest({
      file,
      folder: 'bad folder?',
    })

    const response = await callPost(request)
    const body = await response.json()

    expect(response.status).toBe(400)
    expect(body.error).toBe('Invalid folder format')
    expect(uploadFileMock).not.toHaveBeenCalled()
  })

  it('uploads file and returns payload', async () => {
    uploadFileMock.mockResolvedValueOnce({
      key: 'uploads/user_test/file.txt',
      url: 'https://cdn.example.com/uploads/user_test/file.txt',
    })

    const file = new File(['hello'], 'hello.txt', { type: 'text/plain' })
    const request = createUploadRequest({
      file,
      folder: 'uploads',
    })

    const response = await callPost(request)
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(uploadFileMock).toHaveBeenCalledWith(expect.objectContaining({
      userId: 'user_test',
      fileName: 'hello.txt',
      fileType: 'text/plain',
      folder: 'uploads',
    }))
    expect(body).toEqual({
      key: 'uploads/user_test/file.txt',
      url: 'https://cdn.example.com/uploads/user_test/file.txt',
      name: 'hello.txt',
      type: 'text/plain',
      size: 5,
    })
  })

  it('returns 500 when storage provider throws', async () => {
    uploadFileMock.mockRejectedValueOnce(new Error('upload failed'))
    const file = new File(['hello'], 'hello.txt', { type: 'text/plain' })
    const request = createUploadRequest({ file })

    const response = await callPost(request)
    const body = await response.json()

    expect(response.status).toBe(500)
    expect(body.error).toBe('upload failed')
  })
})
