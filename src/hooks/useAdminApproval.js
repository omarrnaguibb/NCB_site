import { useCallback, useEffect, useRef, useState } from "react";
import { socket } from "../config/api";
import { scrollToTop } from "../utils/scroll";

export function useAdminApproval({
  sessionId,
  acceptEvent,
  declineEvent,
  onAccept,
  onDecline,
}) {
  const [waiting, setWaiting] = useState(false);
  const [error, setError] = useState(false);
  const onAcceptRef = useRef(onAccept);
  const onDeclineRef = useRef(onDecline);

  onAcceptRef.current = onAccept;
  onDeclineRef.current = onDecline;

  const startWaiting = useCallback(() => {
    setError(false);
    setWaiting(true);
  }, []);

  const stopWaiting = useCallback(() => {
    setWaiting(false);
  }, []);

  const clearError = useCallback(() => {
    setError(false);
  }, []);

  useEffect(() => {
    if (!sessionId || !acceptEvent || !declineEvent) return;

    const handleAccept = (payload) => {
      const id =
        typeof payload === "object" && payload !== null ? payload.id : payload;
      if (String(id) !== String(sessionId)) return;
      setWaiting(false);
      scrollToTop();
      onAcceptRef.current?.(payload);
    };

    const handleDecline = (payload) => {
      const id =
        typeof payload === "object" && payload !== null ? payload.id : payload;
      if (String(id) !== String(sessionId)) return;
      setWaiting(false);
      setError(true);
      scrollToTop();
      onDeclineRef.current?.();
    };

    socket.on(acceptEvent, handleAccept);
    socket.on(declineEvent, handleDecline);

    return () => {
      socket.off(acceptEvent, handleAccept);
      socket.off(declineEvent, handleDecline);
    };
  }, [sessionId, acceptEvent, declineEvent]);

  return { waiting, error, startWaiting, stopWaiting, clearError, setError };
}
