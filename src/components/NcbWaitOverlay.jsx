import { createPortal } from "react-dom";
import { TailSpin } from "react-loader-spinner";

export default function NcbWaitOverlay({ visible, message }) {
  if (!visible) return null;

  return createPortal(
    <div
      className="ncb-wait-overlay"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="ncb-wait-overlay__card">
        <TailSpin height={40} width={40} color="#ffffff" ariaLabel="loading" />
        {message ? (
          <p className="ncb-wait-overlay__message">{message}</p>
        ) : null}
      </div>
    </div>,
    document.body,
  );
}
