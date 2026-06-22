import { FaCheck } from "react-icons/fa";
import NcbLayout from "../components/NcbLayout";

export default function SuccessPage() {
  return (
    <NcbLayout>
      <div className="ncb-success">
        <div className="ncb-success__icon">
          <FaCheck color="#fff" />
        </div>
        <p className="ncb-success__text">تم قبول طلبك بنجاح</p>
      </div>
    </NcbLayout>
  );
}
