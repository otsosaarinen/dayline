import { Power } from 'lucide-react'
import { Kbd } from './Kbd'

/** Footer button that quits the app (there is no Dock icon or menu bar menu to quit from). */
export function QuitButton(): React.JSX.Element {
    return (
        <button
            type="button"
            onClick={() => window.api.invoke('app:quit')}
            className="group/quit flex items-center gap-1.5 rounded-md px-1.5 py-1 text-[13px] text-faint hover:text-fg"
        >
            <Power size={14} />
            Quit
            <span className="opacity-0 transition-opacity duration-100 group-hover/quit:opacity-100 group-hover/quit:delay-500 group-focus-visible/quit:opacity-100">
                <Kbd>⌘Q</Kbd>
            </span>
        </button>
    )
}
