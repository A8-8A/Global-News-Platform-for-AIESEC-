// App chrome for the inner pages: sticky TopNav + routed outlet +
// masthead footer. The landing page and the admin console bypass this
// layout (they have their own full-bleed chrome).

import { Outlet, useLocation } from 'react-router-dom';
import { TopNav } from './ui/TopNav';
import { Logo } from './ui/Logo';

const NAV_ACTIVE = {
  '/feed': 'feed',
  '/compose': 'feed',
};

export default function Layout() {
  const { pathname } = useLocation();
  const active = NAV_ACTIVE[pathname] ?? (pathname.startsWith('/feed') ? 'feed' : '');

  return (
    <div className="min-h-full bg-paper flex flex-col">
      <TopNav active={active} />

      <div className="flex-1">
        <Outlet />
      </div>

      <footer className="border-t border-line bg-paper-soft">
        <div className="mx-auto max-w-feed px-10 py-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between font-sans text-ink-faint" style={{ fontSize: 12 }}>
          <div className="flex items-center gap-3.5">
            <Logo height={18} />
            <span>· an internal publication of the AIESEC network</span>
          </div>
          <div className="flex gap-[22px]">
            <span className="cursor-pointer hover:text-ink-soft">Style guide</span>
            <span className="cursor-pointer hover:text-ink-soft">Press</span>
            <span className="cursor-pointer hover:text-ink-soft">Privacy</span>
            <span className="cursor-pointer hover:text-ink-soft">RSS</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
