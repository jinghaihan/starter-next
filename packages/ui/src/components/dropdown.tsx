import type { CommonOptions } from '../types'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@shadcn/components/ui/dropdown-menu'

export interface DropdownProps {
  children: React.ReactNode
  options?: CommonOptions[]
  title?: string | React.ReactNode
  value?: string
  onChange?: (value: string) => void
}

export function Dropdown({ children, options = [], title, value, onChange }: DropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>{children}</DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuGroup>
          {title && <DropdownMenuLabel>{title}</DropdownMenuLabel>}
          <DropdownMenuRadioGroup value={value} onValueChange={onChange}>
            {options.map(option => (
              <DropdownMenuRadioItem key={option.value} value={option.value}>
                {option.label || option.value}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
