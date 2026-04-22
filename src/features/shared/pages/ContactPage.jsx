import { useEffect, useState } from 'react';
import { MapPin, Mail, Phone, Send, Facebook, Instagram, Twitter } from 'lucide-react';
import { getPublicSettings, submitContact } from '../../../shared/api/index.js';
import '../contact.css';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: 'general', message: '' });
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [publicSettings, setPublicSettings] = useState({ allowContact: true, maintenanceMode: false });
  const [settingsLoaded, setSettingsLoaded] = useState(false);

  useEffect(() => {
    let mounted = true;
    getPublicSettings()
      .then(({ data }) => {
        if (!mounted) return;
        const settings = data?.settings || {};
        setPublicSettings({
          allowContact: settings.allowContact ?? true,
          maintenanceMode: settings.maintenanceMode ?? false,
        });
      })
      .catch(() => {})
      .finally(() => { if (mounted) setSettingsLoaded(true); });
    return () => { mounted = false; };
  }, []);

  const validate = () => {
    if (!form.name.trim()) return 'Introdu numele tău.';
    if (form.name.trim().length < 2) return 'Numele trebuie să aibă minim 2 caractere.';
    if (!form.email.trim()) return 'Introdu adresa de email.';
    if (!EMAIL_REGEX.test(form.email.trim())) return 'Adresa de email nu este validă.';
    if (!form.message.trim()) return 'Scrie un mesaj înainte de a trimite.';
    if (form.message.trim().length < 10) return 'Mesajul trebuie să aibă minim 10 caractere.';
    return null;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSent(false);
    if (!publicSettings.allowContact) {
      setError('Formularul de contact este dezactivat momentan.');
      return;
    }
    const validationError = validate();
    if (validationError) { setError(validationError); return; }
    setSending(true);
    try {
      await submitContact({ ...form, type: 'contact' });
      setSent(true);
      setForm((current) => ({ ...current, message: '' }));
    } catch (err) {
      setError(err.response?.data?.error || 'Mesajul nu a putut fi trimis acum.');
    } finally {
      setSending(false);
    }
  };

  const INFO_CARDS = [
    { icon: <MapPin size={20} />, label: 'Adresă', value: 'București, România', color: '#c5f135' },
    { icon: <Mail size={20} />, label: 'Email', value: 'contact@forja.ro', color: '#1a56ff' },
    { icon: <Phone size={20} />, label: 'Telefon', value: '+40 700 000 000', color: '#ff4d1c' },
    { icon: <Send size={20} />, label: 'Program', value: 'Luni-Vineri 9-18', color: '#7B2FBE' },
  ];

  const SOCIAL_LINKS = [
    { icon: <Facebook size={20} />, label: 'Facebook', href: 'https://facebook.com', color: '#1877F2' },
    { icon: <Instagram size={20} />, label: 'Instagram', href: 'https://instagram.com', color: '#E4405F' },
    { icon: <Twitter size={20} />, label: 'X / Twitter', href: 'https://twitter.com', color: 'var(--c-ink)' },
  ];

  const submitClass = `contact-submit${sending ? ' sending' : ''}${sent ? ' sent' : ''}`;

  return (
    <div className="contact-page">
      <section className="contact-hero">
        <div className="contact-hero-glow" aria-hidden="true" />
        <div className="contact-hero-inner">
          <a href="/landing.html" className="contact-back-link" aria-label="Înapoi la pagina principală">← FORJA</a>
          <h1 className="contact-heading">CONTACTEAZĂ-NE</h1>
          <p className="contact-subtitle">Ai întrebări despre FORJA? Suntem aici să te ajutăm.</p>
          {settingsLoaded && !publicSettings.allowContact && (
            <div className="contact-banner-warning" role="alert">Formularul de contact este dezactivat momentan din setările platformei.</div>
          )}
          {publicSettings.maintenanceMode && (
            <div className="contact-banner-maintenance" role="status">Platforma este în mentenanță. Răspunsurile pot întârzia.</div>
          )}
        </div>
      </section>

      <div className="contact-grid">
        <article className="contact-form-card">
          <h2 className="contact-form-title">Trimite un mesaj</h2>
          <form onSubmit={handleSubmit} className="contact-form" noValidate>
            <div>
              <label htmlFor="contact-name" className="contact-label">Nume</label>
              <input id="contact-name" className="contact-input" value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Numele tău" required minLength={2} autoComplete="name" />
            </div>
            <div>
              <label htmlFor="contact-email" className="contact-label">Email</label>
              <input id="contact-email" type="email" className="contact-input" value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                placeholder="email@exemplu.ro" required autoComplete="email" />
            </div>
            <div>
              <label htmlFor="contact-subject" className="contact-label">Subiect</label>
              <select id="contact-subject" className="contact-select" value={form.subject}
                onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}>
                <option value="general">Întrebare generală</option>
                <option value="business">Business / Ofertă echipă</option>
                <option value="coach">Onboarding Coach</option>
                <option value="support">Suport tehnic</option>
                <option value="partnership">Parteneriat</option>
              </select>
            </div>
            <div>
              <label htmlFor="contact-message" className="contact-label">Mesaj</label>
              <textarea id="contact-message" className="contact-textarea" value={form.message}
                onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                placeholder="Spune-ne cum te putem ajuta..." rows={5} required minLength={10} />
            </div>
            {sent && <div className="contact-success" role="status">✓ Mesaj trimis. Revenim cât mai clar și concret.</div>}
            {error && <div className="contact-error" role="alert">✕ {error}</div>}
            <button type="submit" className={submitClass} disabled={sending || !publicSettings.allowContact}>
              {sending ? 'SE TRIMITE...' : sent ? '✓ MESAJ TRIMIS' : !publicSettings.allowContact ? 'CONTACT OPRIT' : <><Send size={16} /> TRIMITE MESAJUL</>}
            </button>
          </form>
        </article>

        <aside className="contact-right">
          <div className="contact-map">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2848.8!2d26.1025!3d44.4268!2m3!1f0!2f0!3f0!2f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNDTCsDI1JzM2LjUiTiAyNsKwMDYnMDkuMCJF!5e0!3m2!1sro!2sro!4v1700000000000!5m2!1sro!2sro"
              title="Locația FORJA pe Google Maps" width="100%" height="100%" allowFullScreen loading="lazy" />
          </div>

          <div className="contact-info-grid">
            {INFO_CARDS.map((item, i) => (
              <div key={i} className="contact-info-card">
                <div className="contact-info-icon" style={{ color: item.color }}>{item.icon}</div>
                <div>
                  <div className="contact-info-label">{item.label}</div>
                  <div className="contact-info-value">{item.value}</div>
                </div>
              </div>
            ))}
          </div>

          <nav className="contact-social-row" aria-label="Rețele sociale">
            {SOCIAL_LINKS.map((s, i) => (
              <a key={i} href={s.href} target="_blank" rel="noopener noreferrer"
                className="contact-social-link" aria-label={`Vizitează ${s.label}`}>
                <span style={{ color: s.color }}>{s.icon}</span> {s.label}
              </a>
            ))}
          </nav>
        </aside>
      </div>

      <img src="/img/wave-bg.svg" alt="" className="contact-wave" aria-hidden="true" />
    </div>
  );
}
