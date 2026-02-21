import {
  TooltipContent,
  Tooltip as TooltipPrimitive,
  TooltipTrigger,
} from '@shadcn/components/ui/tooltip'

export interface TooltipProps extends Omit<React.ComponentProps<typeof TooltipContent>, 'title'> {
  children: React.ReactNode
  title: string | React.ReactNode
}

export function Tooltip({ children, title, ...tooltipContentProps }: TooltipProps) {
  return (
    <TooltipPrimitive>
      <TooltipTrigger>
        {children}
      </TooltipTrigger>
      <TooltipContent {...tooltipContentProps}>
        {title}
      </TooltipContent>
    </TooltipPrimitive>
  )
}
