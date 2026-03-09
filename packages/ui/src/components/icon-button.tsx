import type { TooltipProps } from './tooltip'
import { Button } from '@shadcn/components/ui/button'
import { Tooltip } from './tooltip'

export interface IconButtonProps extends Omit<React.ComponentProps<typeof Button>, 'title'> {
  icon?: React.ReactNode
  title?: string | React.ReactNode
  tooltipSide?: TooltipProps['side']
}

export function IconButton({
  ref,
  icon,
  title,
  tooltipSide,
  ...buttonProps
}: IconButtonProps) {
  if (!title) {
    return (
      <Button ref={ref} variant="ghost" size="icon" {...buttonProps}>
        {icon}
      </Button>
    )
  }

  return (
    <Tooltip title={title} side={tooltipSide}>
      <Button ref={ref} variant="ghost" size="icon" {...buttonProps}>
        {icon}
      </Button>
    </Tooltip>
  )
}

IconButton.displayName = 'IconButton'
