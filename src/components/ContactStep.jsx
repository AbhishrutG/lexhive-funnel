import { useState } from 'react';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Loose on purpose: accepts spaces/dashes/parens/+ and 7-15 digits, since we
// can't assume a lead's country format. Real digit-count/format validation
// belongs server-side where we know which market the ad ran in.
const PHONE_RE = /^[+()\d\s-]{7,20}$/;

// submitState comes from App.jsx so this component can show the right UI for
// "idle", "submitting", and "error" without owning that state itself - the
// form doesn't know or care *why* a submission failed, only whether to show
// the retry affordance.
export default function ContactStep({ onSubmit, submitState }) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', business: '' });
  const [touched, setTouched] = useState(false);

  const errors = {
    name: form.name.trim().length < 2 ? 'Enter your name' : null,
    email: !EMAIL_RE.test(form.email) ? 'Enter a valid email' : null,
    phone: !PHONE_RE.test(form.phone) ? 'Enter a valid phone number' : null,
  };
  const isValid = !errors.name && !errors.email && !errors.phone;

  function handleSubmit(e) {
    e.preventDefault();
    setTouched(true);
    if (!isValid) return;
    onSubmit(form);
  }

  return (
    <>
      <h2>Where should we send your audit?</h2>
      <form onSubmit={handleSubmit} noValidate>
        <label className="field">
          <span>Full name</span>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          {touched && errors.name && <em className="field-error">{errors.name}</em>}
        </label>

        <label className="field">
          <span>Business name</span>
          <input
            type="text"
            value={form.business}
            onChange={(e) => setForm({ ...form, business: e.target.value })}
          />
        </label>

        <label className="field">
          <span>Email</span>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          {touched && errors.email && <em className="field-error">{errors.email}</em>}
        </label>

        <label className="field">
          <span>Phone</span>
          <input
            type="tel"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
          {touched && errors.phone && <em className="field-error">{errors.phone}</em>}
        </label>

        <button type="submit" className="primary-button" disabled={submitState === 'submitting'}>
          {submitState === 'submitting' ? 'Sending...' : 'Get My Free Audit'}
        </button>

        {submitState === 'error' && (
          <p className="submit-error">
            Something went wrong sending your info. Nothing was lost — hit the button again.
          </p>
        )}
      </form>
    </>
  );
}
