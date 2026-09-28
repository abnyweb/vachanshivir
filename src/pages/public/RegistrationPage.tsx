import { PageHeader } from '../../components/public/PageHeader';
import { RegistrationWizard } from '../../components/registration/RegistrationWizard';
import { useCurrentEvent } from '../../hooks/useCurrentEvent';
import { useDocumentMeta } from '../../hooks/useDocumentMeta';

export default function RegistrationPage() {
  const event = useCurrentEvent();
  useDocumentMeta(
    `Register — ${event.name} ${event.year}`,
    'Register for Vachan Adhyayan Shivir 2026 in Puri, Odisha.'
  );

  return (
    <>
      <PageHeader
        eyebrow={`${event.edition} · ${event.year}`}
        title="Register / पंजीकरण"
        intro={event.eligibilityNotice}
      />
      <section className="shell py-6 md:py-14">
        <RegistrationWizard />
      </section>
    </>
  );
}
