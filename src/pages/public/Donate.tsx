import { PageHeader } from '../../components/public/PageHeader';
import { DonationSection } from '../../components/public/DonationSection';
import { useDocumentMeta } from '../../hooks/useDocumentMeta';
import { useLanguage } from '../../i18n/LanguageContext';

export default function DonatePage() {
  const { language } = useLanguage();
  const lang = language;

  useDocumentMeta(
    lang === 'hi' ? "मसीही सहयोग एवं प्रायोजन — वचन अध्ययन शिविर" : "Ministry Support & Sponsorship — Vachan Shivir 2026",
    "Sponsor rural pastors, delegates, and free study Bibles for Vachan Shivir 2026 under Satya Vachan Church."
  );

  return (
    <>
      <PageHeader
        eyebrow={lang === 'hi' ? 'मसीही सहयोग एवं प्रायोजन' : 'MINISTRY SUPPORT & SPONSORSHIP'}
        title={lang === 'hi' ? 'मसीही सहयोग एवं प्रायोजन' : 'Ministry Support & Sponsorship'}
        intro={
          lang === 'hi'
            ? 'सत्य वचन चर्च के तत्वावधान में आयोजित वचन अध्ययन शिविर 2026 के लिए ग्रामीण पास्टरों व अगुओं के पास एवं निःशुल्क बाइबल प्रायोजित करें।'
            : 'Sponsor delegate passes and free study Bibles for pastors and leaders attending Vachan Shivir 2026 under Satya Vachan Church.'
        }
      />
      <DonationSection />
    </>
  );
}
