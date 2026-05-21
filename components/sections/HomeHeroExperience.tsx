"use client";

import { useEffect, useRef, useState } from "react";
import { FiVolume2, FiVolumeX } from "react-icons/fi";
import { WhatsAppCta } from "@/components/cta/WhatsAppCta";
import type { Locale } from "@/lib/i18n";

interface HomeHeroExperienceProps {
  locale: Locale;
}

type SoundPreference = "auto" | "on" | "off";

const heroPoster = "/videos/ibiza-boats-header-poster.jpg";
const heroMobileVideoSrc = "/videos/ibiza-boats-header.mobile.mp4";
const heroVideoSrc = "/videos/ibiza-boats-header.web.mp4";
const heroVolume = 0.26;

const soundLabels: Record<Locale, { enable: string; disable: string; mutedState: string; enabledState: string }> = {
  es: { enable: "Activar música", disable: "Silenciar música", mutedState: "Música silenciada", enabledState: "Música activada" },
  en: { enable: "Turn music on", disable: "Mute music", mutedState: "Music muted", enabledState: "Music on" },
  de: { enable: "Musik einschalten", disable: "Musik stummschalten", mutedState: "Musik stumm", enabledState: "Musik an" },
  nl: { enable: "Muziek aanzetten", disable: "Muziek dempen", mutedState: "Muziek gedempt", enabledState: "Muziek aan" }
};

const heroCopy: Record<Locale, { pill: string; text: string; cta: string; message: string }> = {
  es: {
    pill: "FastServices Ibiza: tu contacto náutico de confianza",
    text: "Barcos, transfers privados y juguetes náuticos coordinados desde una sola conversación con Rodrigo.",
    cta: "Ponte en contacto",
    message: "Hola Rodrigo, quiero organizar una experiencia privada en Ibiza."
  },
  en: {
    pill: "FastServices Ibiza: your trusted nautical contact",
    text: "Boats, private transfers and water toys coordinated from one conversation with Rodrigo.",
    cta: "Get in touch",
    message: "Hello Rodrigo, I would like to plan a private experience in Ibiza."
  },
  de: {
    pill: "FastServices Ibiza: dein vertrauter Nautik-Kontakt",
    text: "Boote, private Transfers und Wasserspielzeug koordiniert in einem Gespräch mit Rodrigo.",
    cta: "Kontakt aufnehmen",
    message: "Hallo Rodrigo, ich möchte ein privates Erlebnis auf Ibiza planen."
  },
  nl: {
    pill: "FastServices Ibiza: je vertrouwde nautische contact",
    text: "Boten, privétransfers en waterspeelgoed geregeld vanuit één gesprek met Rodrigo.",
    cta: "Neem contact op",
    message: "Hallo Rodrigo, ik wil graag een privé-ervaring op Ibiza plannen."
  }
};

export function HomeHeroExperience({ locale }: HomeHeroExperienceProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const soundPreferenceRef = useRef<SoundPreference>("auto");
  const autoplayAttemptedRef = useRef(false);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [soundBlocked, setSoundBlocked] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let active = true;
    let resumeAfterVisibilityChange = false;

    const setSafeSoundState = (enabled: boolean, blocked: boolean) => {
      if (!active) return;
      setSoundEnabled(enabled);
      setSoundBlocked(blocked);
    };

    const playMuted = async () => {
      video.volume = heroVolume;
      video.muted = true;
      setSafeSoundState(false, soundPreferenceRef.current === "auto");

      try {
        await video.play();
      } catch {
        setSafeSoundState(false, true);
      }
    };

    const playWithSound = async () => {
      video.volume = heroVolume;
      video.muted = false;

      try {
        await video.play();
        setSafeSoundState(true, false);
      } catch {
        await playMuted();
      }
    };

    const startVideo = async () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        await playMuted();
        return;
      }

      if (soundPreferenceRef.current === "off") {
        await playMuted();
        return;
      }

      if (soundPreferenceRef.current === "on" || !autoplayAttemptedRef.current) {
        autoplayAttemptedRef.current = true;
        await playWithSound();
        return;
      }

      try {
        await video.play();
      } catch {
        await playMuted();
      }
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          void startVideo();
          return;
        }

        video.pause();
      },
      { threshold: 0.35 }
    );

    const handleVisibilityChange = () => {
      if (document.hidden) {
        resumeAfterVisibilityChange = !video.paused;
        video.pause();
        return;
      }

      if (resumeAfterVisibilityChange) {
        void startVideo();
      }
    };

    observer.observe(video);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      active = false;
      observer.disconnect();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  const handleSoundToggle = async () => {
    const video = videoRef.current;
    if (!video) return;

    video.volume = heroVolume;

    if (video.muted || !soundEnabled) {
      soundPreferenceRef.current = "on";
      video.muted = false;

      try {
        await video.play();
        setSoundEnabled(true);
        setSoundBlocked(false);
      } catch {
        video.muted = true;
        setSoundEnabled(false);
        setSoundBlocked(true);
      }

      return;
    }

    soundPreferenceRef.current = "off";
    video.muted = true;
    setSoundEnabled(false);
    setSoundBlocked(false);
  };

  const soundLabel = soundEnabled ? soundLabels[locale].disable : soundLabels[locale].enable;
  const soundStateLabel = soundEnabled ? soundLabels[locale].enabledState : soundLabels[locale].mutedState;
  const copy = heroCopy[locale];

  return (
    <section className="hero-section">
      <div className="hero-section__media">
        <video
          ref={videoRef}
          className="hero-section__video"
          autoPlay
          loop
          playsInline
          preload="metadata"
          poster={heroPoster}
          aria-hidden="true"
        >
          <source src={heroMobileVideoSrc} type="video/mp4" media="(max-width: 768px)" />
          <source src={heroVideoSrc} type="video/mp4" />
        </video>
      </div>
      <div className="hero-section__overlay" />
      <div className="container hero-section__content">
        <p className="hero-trust-pill">{copy.pill}</p>
        <h1>Ibiza Lifestyle Management</h1>
        <p>{copy.text}</p>
        <div className="hero-section__actions">
          <WhatsAppCta locale={locale} variant="light" label={copy.cta} message={copy.message} />
        </div>
      </div>
      <button
        className={`hero-sound-toggle hero-sound-toggle--corner ${soundEnabled ? "is-on" : ""} ${soundBlocked ? "is-blocked" : ""}`}
        type="button"
        aria-label={soundLabel}
        aria-pressed={soundEnabled}
        title={soundStateLabel}
        onClick={handleSoundToggle}
      >
        {soundEnabled ? <FiVolume2 aria-hidden="true" /> : <FiVolumeX aria-hidden="true" />}
      </button>
    </section>
  );
}