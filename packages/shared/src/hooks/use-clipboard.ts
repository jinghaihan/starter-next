'use client'

import { useState } from 'react'
import { useCopyToClipboard, useTimeout } from 'usehooks-ts'

interface UseClipboardOptions {
  /**
   * Milliseconds to reset state of `copied` ref
   *
   * @default 1500
   */
  copiedDuring?: number
  /**
   * Whether fallback to document.execCommand('copy') if clipboard is undefined.
   *
   * @default false
   */
  legacy?: boolean
}

type UseClipboardReturn = [(text: string) => void, boolean]

export function useClipboard(options?: UseClipboardOptions): UseClipboardReturn {
  const {
    copiedDuring = 1500,
    legacy = false,
  } = options || {}

  const [_, copyToClipboard] = useCopyToClipboard()
  const [copied, setCopied] = useState(false)

  useTimeout(() => setCopied(false), copiedDuring)

  const legacyCopy = (value: string) => {
    const ta = document.createElement('textarea')
    ta.value = value
    ta.style.position = 'absolute'
    ta.style.opacity = '0'
    ta.setAttribute('readonly', '')
    document.body.appendChild(ta)
    ta.select()
    document.execCommand('copy')
    ta.remove()
  }

  const copy = (text: string) => {
    if (legacy)
      legacyCopy(text)
    else
      copyToClipboard(text)

    setCopied(true)
    setTimeout(() => setCopied(false), copiedDuring)
  }

  return [copy, copied]
}
