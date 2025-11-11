import { useNavigate, useLocation } from 'react-router-dom';

// ----------------------------------------------------------------------

export function useRouter() {
  const navigate = useNavigate();
  const location = useLocation();

  return {
    pathname: location.pathname,
    query: Object.fromEntries(new URLSearchParams(location.search)),
    push: (href) => navigate(href),
    replace: (href) => navigate(href, { replace: true }),
    refresh: () => navigate(location.pathname, { replace: true }),
    back: () => navigate(-1),
  };
}

