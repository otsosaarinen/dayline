import { Power } from 'lucide-react'
import { Tooltip } from './Tooltip'

/** Footer button that quits the app (there is no Dock icon or menu bar menu to quit from). */
export function QuitButton(): React.JSX.Element {
    return (
        <Tooltip label="Quit Dayline" keys={['⌘', 'Q']} side="top" align="start">
            <button
                type="button"
                aria-label="Quit Dayline"
                onClick={() => window.api.invoke('app:quit')}
                className="grid size-6 place-items-center rounded-md text-faint hover:text-fg"
            >
                <Power size={15} />
            </button>
        </Tooltip>
    )
}
