import { auth, toNextJsHandler } from '@app-name/auth/server'

export const { GET, POST } = toNextJsHandler(auth)
