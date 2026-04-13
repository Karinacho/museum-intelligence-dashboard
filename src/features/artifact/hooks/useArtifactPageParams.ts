import { useEffect } from 'react';
import { useLocation, useParams } from 'react-router-dom';

export function useArtifactPageParams() {
  const { id: idParam } = useParams<{ id: string }>();
  const location = useLocation();
  const backTo =
    typeof (location.state as { from?: unknown } | null)?.from === 'string'
      ? (location.state as { from: string }).from || '/'
      : '/';
  const objectId = idParam != null ? Number.parseInt(idParam, 10) : Number.NaN;
  const validId = Number.isFinite(objectId) && objectId > 0;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [objectId]);

  return { objectId, validId, backTo };
}
