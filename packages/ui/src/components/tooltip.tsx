'use client'

import type { ComponentProps, ReactNode } from 'react'
import {
  TooltipContent,
  Tooltip as TooltipPrimitive,
  TooltipTrigger,
} from '@shadcn/components/ui/tooltip'

export interface TooltipProps extends Omit<ComponentProps<typeof TooltipContent>, 'title'> {
  children: ReactNode
  title: string | ReactNode
}

export function Tooltip({ children, title, ...tooltipContentProps }: TooltipProps) {
  return (
    <TooltipPrimitive>
      <TooltipTrigger asChild>
        {children}
      </TooltipTrigger>
      <TooltipContent {...tooltipContentProps}>
        {title}
      </TooltipContent>
    </TooltipPrimitive>
  )
}
