import { Buffer } from 'node:buffer'
import { requestInterceptor } from '@app-name/auth/server'
import { uploadFile } from '@app-name/storage'
import { NextResponse } from 'next/server'

const MAX_FILE_SIZE = 10 * 1024 * 1024
const ALLOWED_FILE_TYPES = new Set([
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
  'text/plain',
])

export const POST = requestInterceptor(async (userId, request) => {
  const formData = await request.formData()
  const rawFile = formData.get('file')

  if (!(rawFile instanceof File))
    return NextResponse.json({ error: 'File is required' }, { status: 400 })

  if (rawFile.size <= 0)
    return NextResponse.json({ error: 'File is empty' }, { status: 400 })

  if (rawFile.size > MAX_FILE_SIZE)
    return NextResponse.json({ error: 'File size exceeds 10MB limit' }, { status: 400 })

  if (!rawFile.type || !ALLOWED_FILE_TYPES.has(rawFile.type))
    return NextResponse.json({ error: 'Unsupported file type' }, { status: 400 })

  const rawFolder = formData.get('folder')
  if (rawFolder && typeof rawFolder !== 'string')
    return NextResponse.json({ error: 'Invalid folder value' }, { status: 400 })

  const folder = rawFolder?.trim() || undefined
  if (folder && !/^[\w/-]+$/.test(folder))
    return NextResponse.json({ error: 'Invalid folder format' }, { status: 400 })

  try {
    const fileBuffer = Buffer.from(await rawFile.arrayBuffer())
    const uploaded = await uploadFile({
      userId,
      fileName: rawFile.name,
      fileType: rawFile.type,
      fileBuffer,
      folder,
    })

    return NextResponse.json({
      key: uploaded.key,
      url: uploaded.url,
      name: rawFile.name,
      type: rawFile.type,
      size: rawFile.size,
    })
  }
  catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to upload file'
    return NextResponse.json({ error: message }, { status: 500 })
  }
})
