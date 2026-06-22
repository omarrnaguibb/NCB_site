import "../ncb.css";

export default function NcbLayout({ children, showHeader = true }) {
  return (
    <div className="ncb-page" dir="rtl">
      <div className="ncb-page__bg" aria-hidden="true" />
      <div className="ncb-page__watermark" aria-hidden="true" />
      <div className="ncb-page__content">
        {children}
      </div>
    </div>
  );
}
