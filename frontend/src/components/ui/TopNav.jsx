import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Logo } from './Logo';
import { Avatar } from './Avatar';
import { Btn } from './Btn';

export function TopNav() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <header
      className="sticky top-0 z-20 border-b border-line"
      style={{ background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(8px)' }}
    >
      <div className="mx-auto max-w-feed px-10 h-[64px] flex items-center justify-between gap-6">
        <Link to="/" aria-label="AIESEC News home">
          <Logo height={22} />
        </Link>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              {user.role === 'MCP' && (
                <Btn size="sm" variant="primary" onClick={() => navigate('/compose')}>
                  Write
                </Btn>
              )}
              <button
                type="button"
                onClick={() => navigate(user.role === 'ADMIN' ? '/admin' : '/profile/me')}
                aria-label="Your profile"
                className="rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                <Avatar
                  name={user.fullName || user.name}
                  src={user.photoUrl || undefined}
                  size={36}
                />
              </button>
            </>
          ) : (
            <Btn size="sm" variant="primary" onClick={() => navigate('/login')}>
              Login
            </Btn>
          )}
        </div>
      </div>
    </header>
  );
}

export default TopNav;
