import { useEffect, useState, type SyntheticEvent } from 'react';
import type { Dictionary } from '../../i18n';
import { contactSchema, projectTypes } from './schema';
type Field = 'name' | 'email' | 'company' | 'type' | 'message' | 'consent';
export default function ContactForm({ copy }: { copy: Dictionary['contact'] }) {
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});
  const [status, setStatus] = useState<'idle' | 'invalid' | 'valid'>('idle');
  function submit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const values = new FormData(form);
    const result = contactSchema(copy.errors).safeParse({
      ...Object.fromEntries(values),
      consent: values.get('consent') === 'on',
    });
    if (!result.success) {
      const next: Partial<Record<Field, string>> = {};
      for (const issue of result.error.issues)
        next[issue.path[0] as Field] ??= issue.message;
      setErrors(next);
      setStatus('invalid');
      const first = Object.keys(next)[0];
      (form.elements.namedItem(first) as HTMLElement | null)?.focus();
      return;
    }
    setErrors({});
    setStatus('valid');
  }
  function described(field: Field) {
    return {
      'aria-invalid': !!errors[field],
      'aria-describedby': field + '-error',
    };
  }
  return (
    <form
      className="contact-form"
      noValidate
      onSubmit={submit}
      onChange={() => status !== 'idle' && setStatus('idle')}
    >
      <div className="form-row">
        {(['name', 'email'] as const).map((field) => (
          <div className="field" key={field}>
            <label htmlFor={field}>
              {copy[field]} <span aria-hidden="true">*</span>
            </label>
            <input
              id={field}
              name={field}
              type={field === 'email' ? 'email' : 'text'}
              autoComplete={field === 'email' ? 'email' : 'name'}
              required
              maxLength={field === 'email' ? 254 : 100}
              placeholder={
                copy[field === 'email' ? 'emailPlaceholder' : 'namePlaceholder']
              }
              {...described(field)}
            />
            <span className="field-error" id={field + '-error'}>
              {errors[field]}
            </span>
          </div>
        ))}
      </div>
      <div className="form-row">
        <div className="field">
          <label htmlFor="company">
            {copy.company} <span>{copy.optional}</span>
          </label>
          <input
            id="company"
            name="company"
            autoComplete="organization"
            maxLength={150}
            placeholder={copy.companyPlaceholder}
            {...described('company')}
          />
          <span className="field-error" id="company-error">
            {errors.company}
          </span>
        </div>
        <div className="field">
          <label htmlFor="type">
            {copy.type} <span aria-hidden="true">*</span>
          </label>
          <select
            id="type"
            name="type"
            required
            defaultValue=""
            {...described('type')}
          >
            <option value="" disabled>
              {copy.select}
            </option>
            {projectTypes.map((value, i) => (
              <option value={value} key={value}>
                {copy.types[i]}
              </option>
            ))}
          </select>
          <span className="field-error" id="type-error">
            {errors.type}
          </span>
        </div>
      </div>
      <div className="field">
        <label htmlFor="message">
          {copy.message} <span aria-hidden="true">*</span>
        </label>
        <textarea
          id="message"
          name="message"
          className="resize-none"
          required
          rows={5}
          maxLength={3000}
          placeholder={copy.messagePlaceholder}
          {...described('message')}
          onInput={(event) => {
            const el = event.currentTarget;
            el.style.height = 'auto';
            el.style.height = el.scrollHeight + 'px';
          }}
        />
        <span className="field-error" id="message-error">
          {errors.message}
        </span>
      </div>
      <div className="consent-field">
        <label className="checkbox-label" htmlFor="consent">
          <input
            type="checkbox"
            id="consent"
            name="consent"
            required
            {...described('consent')}
          />
          <span>{copy.consent}</span>
        </label>
        <span className="field-error" id="consent-error">
          {errors.consent}
        </span>
      </div>
      <button
        className="button form-submit js-only"
        type="submit"
        disabled={!ready}
      >
        {copy.submit}
        <span aria-hidden="true">↗</span>
      </button>
      <p
        className={'form-status ' + (status === 'valid' ? 'is-success' : '')}
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {status === 'valid'
          ? copy.success
          : status === 'invalid'
            ? copy.invalid
            : ''}
      </p>
    </form>
  );
}
