import { APPLICATION_HOMEPAGE } from '@app-name/shared'
import { GithubIcon } from 'lucide-react'
import { IconButton } from './icon-button'

export function GitHubButton() {
  return (
    <IconButton
      icon={<GithubIcon />}
      title="GitHub"
      onClick={() => window.open(APPLICATION_HOMEPAGE, '_blank')}
    />
  )
}
