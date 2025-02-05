import { useAuth0 } from '@auth0/auth0-react';
import { useEffect, useState, useCallback } from 'react';

export interface Auth0User {
  id: string;
  email: string;
  name: string;
  picture: string;
  organizationId?: string;
  roles: string[];
  permissions: string[];
}

export function useAuth0User() {
  const { user, isAuthenticated, isLoading, getAccessTokenSilently, loginWithRedirect, logout: auth0Logout } = useAuth0();
  const [auth0User, setAuth0User] = useState<Auth0User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  useEffect(() => {
    const getToken = async () => {
      try {
        if (isAuthenticated && user) {
          const token = await getAccessTokenSilently();
          setAccessToken(token);

          // Extract roles and permissions from Auth0 user metadata
          const roles = user['https://your-namespace/roles'] || [];
          const permissions = user['https://your-namespace/permissions'] || [];

          setAuth0User({
            id: user.sub!,
            email: user.email!,
            name: user.name!,
            picture: user.picture!,
            organizationId: user['https://your-namespace/org_id'],
            roles,
            permissions,
          });
        }
      } catch (error) {
        console.error('Error getting access token:', error);
      }
    };

    getToken();
  }, [getAccessTokenSilently, isAuthenticated, user]);

  const hasRole = (role: string) => {
    return auth0User?.roles.includes(role) || false;
  };

  const hasPermission = (permission: string) => {
    return auth0User?.permissions.includes(permission) || false;
  };

  const login = useCallback(() => {
    loginWithRedirect({
      appState: {
        returnTo: window.location.pathname,
      },
    });
  }, [loginWithRedirect]);

  const logout = useCallback(() => {
    auth0Logout({
      logoutParams: {
        returnTo: window.location.origin,
      },
    });
  }, [auth0Logout]);

  return {
    user: auth0User,
    isAuthenticated,
    isLoading,
    accessToken,
    login,
    logout: () => {
      logout();
      window.location.href = window.location.origin;
    },
    hasRole,
    hasPermission,
  };
}
