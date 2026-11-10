import { REPO_URL } from '@shared/constants'
import { GithubIcon } from './GithubIcon'
import { Tooltip } from './Tooltip'

/** Small GitHub icon for the footer. Opens the repository once `REPO_URL` is set. */
export function GithubLink(): React.JSX.Element {
    return (
        <Tooltip
            label={REPO_URL ? 'View on GitHub' : 'GitHub link coming soon'}
            side="top"
            align="end"
        >
            <button
                type="button"
                aria-label="GitHub"
                onClick={() => window.api.invoke('app:openRepo')}
                className="grid size-6 place-items-center rounded-md text-faint hover:text-fg"
            >
                <GithubIcon size={15} />
            </button>
        </Tooltip>
    )
}
