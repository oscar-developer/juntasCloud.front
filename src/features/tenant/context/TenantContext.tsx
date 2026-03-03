import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../../auth/useAuth';
import { HttpError } from '../../../shared/api/httpClient';
import { getTenantById } from '../services/tenantApi';
import type { TenantMembership, TenantSummary } from '../types';

type TenantContextValue = {
  tenantId: string;
  tenant: TenantSummary | null;
  membership: TenantMembership | null;
  loading: boolean;
  error: string | null;
  isAdmin: boolean;
  leaveTenant: () => void;
  refreshTenant: () => void;
};

const TenantContext = createContext<TenantContextValue | undefined>(undefined);

function getErrorMessage(error: unknown) {
  if (error instanceof HttpError) {
    return error.message;
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return 'No se pudo cargar la información de la junta.';
}

export function TenantProvider({ children }: PropsWithChildren) {
  const { tenantId } = useParams<{ tenantId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [tenant, setTenant] = useState<TenantSummary | null>(null);
  const [membership, setMembership] = useState<TenantMembership | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!tenantId) {
      navigate('/app/juntas', { replace: true });
    }
  }, [navigate, tenantId]);

  useEffect(() => {
    if (!tenantId) {
      return;
    }

    const controller = new AbortController();

    const loadTenant = async () => {
      setLoading(true);
      setError(null);

      try {
        const tenantResponse = await getTenantById(tenantId, controller.signal);

        if (controller.signal.aborted) {
          return;
        }

        setTenant(tenantResponse);
        setMembership(null);
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }

        if (error instanceof DOMException && error.name === 'AbortError') {
          return;
        }

        if (error instanceof HttpError && (error.status === 403 || error.status === 404)) {
          navigate('/app/juntas', { replace: true });
          return;
        }

        setError(getErrorMessage(error));
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    void loadTenant();

    return () => {
      controller.abort();
    };
  }, [navigate, reloadKey, tenantId]);

  const value = useMemo<TenantContextValue>(() => {
    const currentTenantId = tenantId ?? '';
    // TODO: Replace this owner-only fallback when the backend exposes real tenant membership roles.
    const isOwner =
      user?.id != null &&
      tenant?.ownerUserId != null &&
      String(tenant.ownerUserId) === String(user.id);

    return {
      tenantId: currentTenantId,
      tenant,
      membership,
      loading,
      error,
      isAdmin: isOwner,
      leaveTenant: () => {
        navigate('/app/juntas');
      },
      refreshTenant: () => {
        setReloadKey((current) => current + 1);
      },
    };
  }, [error, loading, membership, navigate, tenant, tenantId, user]);

  return <TenantContext.Provider value={value}>{children}</TenantContext.Provider>;
}

export function useTenant() {
  const context = useContext(TenantContext);

  if (!context) {
    throw new Error('useTenant must be used within a TenantProvider');
  }

  return context;
}
