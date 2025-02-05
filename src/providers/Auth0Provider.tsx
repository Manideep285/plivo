import { Auth0Provider as Auth0ProviderBase } from '@auth0/auth0-react';
import { useNavigate } from 'react-router-dom';
import { auth0Config } from '@/lib/auth0-config';

export function Auth0Provider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const isAuth0Enabled = import.meta.env.VITE_AUTH0_ENABLED === 'true';

  const onRedirectCallback = (appState: any) => {
    navigate(appState?.returnTo || window.location.pathname);
  };

  if (!isAuth0Enabled) {
    return <>{children}</>;
  }

  return (
    <Auth0ProviderBase
      domain={auth0Config.domain}
      clientId={auth0Config.clientId}
      authorizationParams={{
        redirect_uri: auth0Config.redirectUri,
        scope: auth0Config.scope,
        audience: auth0Config.audience,
      }}
      onRedirectCallback={onRedirectCallback}
    >
      {children}
    </Auth0ProviderBase>
  );
}
