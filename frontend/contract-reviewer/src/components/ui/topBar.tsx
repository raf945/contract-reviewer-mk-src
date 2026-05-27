import { ModeToggle } from "../mode-toggle"
import { LogOut } from '@/components/login/LogOut'

interface Props {
  pageControls: React.ReactNode;
  showPage: boolean
}

export function TopBar({pageControls, showPage}: Props) {
  return (
    <header className="border-b bg-background text-foreground sticky top-0 z-50">
      {/* Changed py-4 to py-2 to reduce top and bottom padding */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold leading-none tracking-tight">Contract Reviewer</h1>
        </div>
        {showPage && pageControls}
        <div className="flex items-end gap-20 ml-auto">
          <ModeToggle />
          <LogOut />
        </div>
      </div>
    </header>
  )
}