import { useState, useEffect, useCallback } from 'react';

/**
 * Returns `isDirty` (true once any store change fires since mount or last save)
 * and `markClean` (call after a successful file save to reset the flag).
 */
export function useDirty() {
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    const handleChange = () => setIsDirty(true);
    window.addEventListener('eyit-store-change', handleChange);
    return () => window.removeEventListener('eyit-store-change', handleChange);
  }, []);

  const markClean = useCallback(() => setIsDirty(false), []);

  return { isDirty, markClean };
}
