"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { FaWhatsapp } from "react-icons/fa";
import { FiCalendar, FiMail, FiPhone, FiSend, FiShield, FiUsers } from "react-icons/fi";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { NoWidowText } from "@/components/typography/NoWidowText";
import type { Locale } from "@/lib/i18n";

interface ContactFormSectionProps {
  locale: Locale;
}

type ContactCopy = {
  eyebrow: string;
  title: string;
  titleAccent: string;
  description: string;
  contactTitle: string;
  whatsapp: string;
  email: string;
  name: string;
  emailField: string;
  phone: string;
  countryCode: string;
  from: string;
  to: string;
  passengers: string;
  service: string;
  message: string;
  privacy: string;
  submit: string;
  sent: string;
  required: string;
};

const contactCopy: Record<Locale, ContactCopy> = {
  es: {
    eyebrow: "Contacto privado",
    title: "Listo para organizar tu",
    titleAccent: "próxima experiencia en Ibiza",
    description: "Déjanos los datos básicos y te respondemos por WhatsApp con disponibilidad real, opciones y el siguiente paso claro.",
    contactTitle: "Contacta con nosotros",
    whatsapp: "WhatsApp",
    email: "Email",
    name: "Nombre",
    emailField: "Email",
    phone: "Teléfono",
    countryCode: "Código",
    from: "Desde",
    to: "Hasta",
    passengers: "Pasajeros",
    service: "Servicio",
    message: "Mensaje",
    privacy: "Acepto que FastServices me contacte para gestionar esta solicitud.",
    submit: "Enviar consulta",
    sent: "Abrimos WhatsApp con tu consulta lista para enviar.",
    required: "Campo obligatorio"
  },
  en: {
    eyebrow: "Private contact",
    title: "Ready to plan your",
    titleAccent: "next Ibiza experience",
    description: "Leave the basics and we will reply by WhatsApp with real availability, options and the next clear step.",
    contactTitle: "Contact us",
    whatsapp: "WhatsApp",
    email: "Email",
    name: "Name",
    emailField: "Email",
    phone: "Phone",
    countryCode: "Code",
    from: "From",
    to: "To",
    passengers: "Guests",
    service: "Service",
    message: "Message",
    privacy: "I agree that FastServices may contact me to manage this request.",
    submit: "Send request",
    sent: "We opened WhatsApp with your request ready to send.",
    required: "Required field"
  },
  de: {
    eyebrow: "Privater Kontakt",
    title: "Bereit fur dein",
    titleAccent: "nachstes Ibiza-Erlebnis",
    description: "Sende uns die wichtigsten Daten. Wir antworten per WhatsApp mit echter Verfugbarkeit, Optionen und dem nachsten Schritt.",
    contactTitle: "Kontaktiere uns",
    whatsapp: "WhatsApp",
    email: "Email",
    name: "Name",
    emailField: "Email",
    phone: "Telefon",
    countryCode: "Code",
    from: "Von",
    to: "Bis",
    passengers: "Gaste",
    service: "Service",
    message: "Nachricht",
    privacy: "Ich stimme zu, dass FastServices mich zur Bearbeitung dieser Anfrage kontaktieren darf.",
    submit: "Anfrage senden",
    sent: "WhatsApp wurde mit deiner Anfrage geoffnet.",
    required: "Pflichtfeld"
  },
  nl: {
    eyebrow: "Prive contact",
    title: "Klaar om je",
    titleAccent: "volgende Ibiza-ervaring te plannen",
    description: "Laat de basisgegevens achter. We antwoorden via WhatsApp met echte beschikbaarheid, opties en een duidelijke volgende stap.",
    contactTitle: "Neem contact op",
    whatsapp: "WhatsApp",
    email: "Email",
    name: "Naam",
    emailField: "Email",
    phone: "Telefoon",
    countryCode: "Code",
    from: "Van",
    to: "Tot",
    passengers: "Gasten",
    service: "Service",
    message: "Bericht",
    privacy: "Ik ga ermee akkoord dat FastServices contact met mij opneemt om deze aanvraag te beheren.",
    submit: "Aanvraag sturen",
    sent: "We hebben WhatsApp geopend met je aanvraag klaar om te verzenden.",
    required: "Verplicht veld"
  }
};

const countryCodes = ["+34", "+44", "+49", "+31", "+33", "+39", "+1", "+598"];

const serviceOptions: Record<Locale, string[]> = {
  es: ["Alquiler de yate", "Megayate", "Lancha rapida", "Transfer privado", "Juguetes nauticos", "Seguridad privada", "Vehiculo sin conductor"],
  en: ["Yacht rental", "Mega yacht", "Fast boat", "Private transfer", "Water toys", "Private security", "Self-drive vehicle"],
  de: ["Yacht mieten", "Megayacht", "Schnellboot", "Privattransfer", "Wasserspielzeug", "Private Sicherheit", "Fahrzeug ohne Fahrer"],
  nl: ["Jacht huren", "Megajacht", "Speedboot", "Prive transfer", "Waterspeelgoed", "Prive beveiliging", "Auto zonder chauffeur"]
};

function getFormValue(formData: FormData, fieldName: string) {
  const value = formData.get(fieldName);
  return typeof value === "string" ? value.trim() : "";
}

function buildContactMessage(formData: FormData, locale: Locale, labels: ContactCopy) {
  const name = getFormValue(formData, "name");
  const email = getFormValue(formData, "email");
  const countryCode = getFormValue(formData, "countryCode");
  const phone = getFormValue(formData, "phone");
  const fromDate = getFormValue(formData, "fromDate");
  const toDate = getFormValue(formData, "toDate");
  const passengers = getFormValue(formData, "passengers");
  const service = getFormValue(formData, "service");
  const message = getFormValue(formData, "message");

  const greeting = locale === "es" ? "Hola, quiero recibir asesoramiento para una experiencia en Ibiza." : "Hello, I would like advice for an Ibiza experience.";
  const dateRange = [fromDate, toDate].filter(Boolean).join(" - ");

  return [
    greeting,
    "",
    `${labels.name}: ${name}`,
    `${labels.emailField}: ${email}`,
    `${labels.phone}: ${countryCode} ${phone}`,
    dateRange ? `${labels.from} / ${labels.to}: ${dateRange}` : "",
    passengers ? `${labels.passengers}: ${passengers}` : "",
    service ? `${labels.service}: ${service}` : "",
    message ? `${labels.message}: ${message}` : ""
  ].filter(Boolean).join("\n");
}

export function ContactFormSection({ locale }: ContactFormSectionProps) {
  const labels = contactCopy[locale];
  const [accepted, setAccepted] = useState(false);
  const [sent, setSent] = useState(false);
  const today = new Date().toISOString().slice(0, 10);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const whatsappMessage = buildContactMessage(formData, locale, labels);
    window.open(buildWhatsAppUrl(whatsappMessage, locale), "_blank", "noopener,noreferrer");
    setSent(true);
  }

  return (
    <section className="contact-section" id="contact-form">
      <div className="container contact-section__inner">
        <div className="contact-section__content">
          <p className="eyebrow">{labels.eyebrow}</p>
          <h2>
            {labels.title}{" "}
            <span>
              <NoWidowText text={labels.titleAccent} />
            </span>
          </h2>
          <p>
            <NoWidowText text={labels.description} lockWords={3} />
          </p>

          <div className="contact-section__methods" aria-label={labels.contactTitle}>
            <h3>{labels.contactTitle}</h3>
            <dl>
              <div>
                <dt><FaWhatsapp aria-hidden="true" /> {labels.whatsapp}</dt>
                <dd><Link href="https://wa.me/34655835803" target="_blank" rel="noreferrer">+34 655 835 803</Link></dd>
              </div>
              <div>
                <dt><FiMail aria-hidden="true" /> {labels.email}</dt>
                <dd><Link href="mailto:Fastservicesibiza@gmail.com">Fastservicesibiza@gmail.com</Link></dd>
              </div>
            </dl>
          </div>
        </div>

        <form className="contact-request-form" onSubmit={handleSubmit}>
          <div className="contact-request-form__grid">
            <label className="contact-field">
              <span>{labels.name}*</span>
              <input name="name" type="text" autoComplete="name" required aria-label={labels.name} aria-describedby="contact-name-hint" />
              <small id="contact-name-hint">{labels.required}</small>
            </label>

            <label className="contact-field">
              <span>{labels.emailField}*</span>
              <input name="email" type="email" autoComplete="email" required aria-label={labels.emailField} aria-describedby="contact-email-hint" />
              <small id="contact-email-hint">{labels.required}</small>
            </label>

            <div className="contact-phone-group">
              <label className="contact-field contact-field--code">
                <span>{labels.countryCode}</span>
                <select name="countryCode" defaultValue="+34" aria-label={labels.countryCode}>
                  {countryCodes.map((countryCode) => (
                    <option value={countryCode} key={countryCode}>{countryCode}</option>
                  ))}
                </select>
              </label>

              <label className="contact-field contact-field--phone">
                <span><FiPhone aria-hidden="true" /> {labels.phone}*</span>
                <input name="phone" type="tel" autoComplete="tel" required aria-label={labels.phone} />
              </label>
            </div>

            <div className="contact-date-group">
              <label className="contact-field">
                <span>{labels.from}</span>
                <input name="fromDate" type="date" min={today} lang={locale} aria-label={labels.from} />
              </label>
              <label className="contact-field">
                <span>{labels.to}</span>
                <input name="toDate" type="date" min={today} lang={locale} aria-label={labels.to} />
              </label>
            </div>

            <label className="contact-field">
              <span><FiUsers aria-hidden="true" /> {labels.passengers}</span>
              <select name="passengers" defaultValue="">
                <option value="">--</option>
                <option value="2-6">2-6</option>
                <option value="7-10">7-10</option>
                <option value="11-12">11-12</option>
                <option value="12+">12+</option>
              </select>
            </label>

            <label className="contact-field">
              <span><FiCalendar aria-hidden="true" /> {labels.service}</span>
              <select name="service" defaultValue="">
                <option value="">--</option>
                {serviceOptions[locale].map((service) => (
                  <option value={service} key={service}>{service}</option>
                ))}
              </select>
            </label>
          </div>

          <label className="contact-field contact-field--message">
            <span>{labels.message}</span>
            <textarea name="message" rows={5} aria-label={labels.message} />
          </label>

          <label className="contact-consent">
            <input type="checkbox" required checked={accepted} aria-label={labels.privacy} onChange={(event) => setAccepted(event.target.checked)} />
            <span><FiShield aria-hidden="true" /> {labels.privacy}</span>
          </label>

          <button className="contact-submit" type="submit" disabled={!accepted}>
            <span>{labels.submit}</span>
            <FiSend aria-hidden="true" />
          </button>

          {sent ? <p className="contact-form-status" role="status">{labels.sent}</p> : null}
        </form>
      </div>
    </section>
  );
}
