// Login page.
//
// "Log in with AIESEC" does NOT submit a form. It redirects the browser
// to AIESEC's authorize endpoint. AIESEC handles the actual sign-in;
// the user comes back to /auth/callback with a ?code=... which the
// OAuthCallback page then exchanges (via our backend) for a session.

import { Link } from 'react-router-dom';

const AUTHORIZE_URL = import.meta.env.VITE_AIESEC_AUTHORIZE_URL;
const CLIENT_ID = import.meta.env.VITE_AIESEC_CLIENT_ID;
const REDIRECT_URI = import.meta.env.VITE_AIESEC_REDIRECT_URI;

export default function Login() {
  function loginWithAiesec() {
    // Build the OAuth authorize URL.
    //   response_type=code  -> authorization-code flow
    //   client_id           -> our developer application's UID (public)
    //   redirect_uri        -> must EXACTLY match the registered URI
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: CLIENT_ID,
      redirect_uri: REDIRECT_URI,
    });
    window.location.href = `${AUTHORIZE_URL}?${params.toString()}`;
  }

  return (
    <div className="max-w-sm mx-auto mt-10 bg-white rounded-lg border border-gray-200 p-6">
      <h1 className="text-xl font-bold text-gray-900 mb-1">Log in</h1>
      <p className="text-sm text-gray-500 mb-6">
        MCPs and members sign in with their AIESEC account.
      </p>

      <button
        onClick={loginWithAiesec}
        className="w-full bg-aiesec text-white py-2.5 rounded font-medium hover:bg-aiesec-dark"
      >
        Log in with AIESEC
      </button>

      <div className="mt-6 pt-4 border-t border-gray-100 text-center">
        <Link to="/admin/login" className="text-sm text-gray-500 hover:text-aiesec">
          Admin login
        </Link>
      </div>
    </div>
  );
}
