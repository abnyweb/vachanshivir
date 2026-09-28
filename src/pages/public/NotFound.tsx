import { Button } from '../../components/common/Button';
import { useDocumentMeta } from '../../hooks/useDocumentMeta';

export default function NotFound() {
  useDocumentMeta('Page not found — Vachan Shivir');
  return (
    <section className="shell flex min-h-[60vh] flex-col justify-center py-20">
      <p className="text-xs font-mono font-bold tracking-widest text-amber-800 uppercase">404</p>
      <h1 className="mt-3 font-serif text-4xl sm:text-5xl font-bold text-slate-900">This page does not exist</h1>
      <p className="mt-4 max-w-md text-base leading-relaxed text-slate-600 font-sans">
        The link may be out of date. Start from the homepage, or go straight to registration.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Button to="/">Go to the homepage</Button>
        <Button to="/registration" variant="outline">Register</Button>
      </div>
    </section>
  );
}
