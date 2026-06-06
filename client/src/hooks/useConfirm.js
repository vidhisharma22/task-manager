/**
 * hooks/useConfirm.js
 * Returns a `confirm` async function that resolves to true/false.
 * Used for the delete-confirmation dialog.
 */

import { useCallback, useRef, useState } from "react";

export function useConfirm() {
  const [state, setState] = useState({ open: false, message: "" });
  const resolveRef = useRef(null);

  const confirm = useCallback((message) => {
    setState({ open: true, message });
    return new Promise((resolve) => {
      resolveRef.current = resolve;
    });
  }, []);

  const handleConfirm = useCallback(() => {
    setState({ open: false, message: "" });
    resolveRef.current?.(true);
  }, []);

  const handleCancel = useCallback(() => {
    setState({ open: false, message: "" });
    resolveRef.current?.(false);
  }, []);

  return { confirmState: state, confirm, handleConfirm, handleCancel };
}
