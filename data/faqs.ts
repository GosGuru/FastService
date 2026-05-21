import type { FaqItem } from "@/types/content";

export const faqs: FaqItem[] = [
  {
    id: "availability",
    serviceId: "boats",
    question: {
      es: "¿Cómo consulto disponibilidad de un barco?",
      en: "How do I check boat availability?",
      de: "Wie frage ich die Verfügbarkeit eines Boots an?",
      nl: "Hoe controleer ik de beschikbaarheid van een boot?"
    },
    answer: {
      es: "Pulsa en consultar disponibilidad o escríbeme por WhatsApp. Te pediré fecha, número de personas, tipo de barco y estilo de ruta para proponerte opciones reales.",
      en: "Tap check availability or message me on WhatsApp. I will ask for date, group size, boat type and route style so I can suggest real options.",
      de: "Tippe auf Verfügbarkeit prüfen oder schreibe mir per WhatsApp. Ich frage Datum, Gruppengröße, Bootstyp und Routenstil ab, um echte Optionen vorzuschlagen.",
      nl: "Tik op beschikbaarheid checken of stuur mij een WhatsApp. Ik vraag datum, groepsgrootte, boottype en routestijl om echte opties voor te stellen."
    }
  },
  {
    id: "boat-rental-price",
    serviceId: "boats",
    question: {
      es: "¿Cuánto cuesta alquilar un barco en Ibiza?",
      en: "How much does it cost to rent a boat in Ibiza?",
      de: "Was kostet es, ein Boot auf Ibiza zu mieten?",
      nl: "Wat kost het om een boot te huren op Ibiza?"
    },
    answer: {
      es: "Depende de la embarcación, temporada, ruta y extras. Las lanchas suelen empezar desde presupuestos más bajos, mientras que yates y megayates suben según tamaño, tripulación y servicios.",
      en: "It depends on the boat, season, route and extras. Fast boats usually start from lower budgets, while yachts and mega yachts increase with size, crew and services.",
      de: "Es hängt von Boot, Saison, Route und Extras ab. Schnellboote starten meist günstiger, Yachten und Megayachten steigen je nach Größe, Crew und Service.",
      nl: "Dat hangt af van boot, seizoen, route en extra's. Snelle boten starten meestal lager, terwijl jachten en megajachten stijgen door grootte, bemanning en services."
    }
  },
  {
    id: "boat-rental-included",
    serviceId: "boats",
    question: {
      es: "¿Qué incluye normalmente el precio?",
      en: "What is usually included in the price?",
      de: "Was ist normalerweise im Preis enthalten?",
      nl: "Wat is meestal inbegrepen in de prijs?"
    },
    answer: {
      es: "Normalmente incluye barco, seguro, equipamiento de seguridad y coordinación de la reserva. Según la embarcación puede incluir patrón, bebidas, toallas o amarre; te lo confirmo antes de reservar.",
      en: "It usually includes the boat, insurance, safety equipment and booking coordination. Depending on the boat it may include skipper, drinks, towels or mooring; I confirm it before booking.",
      de: "Normalerweise sind Boot, Versicherung, Sicherheitsausrüstung und Buchungskoordination enthalten. Je nach Boot können Skipper, Getränke, Handtücher oder Liegeplatz inklusive sein; ich bestätige es vor der Buchung.",
      nl: "Meestal zijn boot, verzekering, veiligheidsuitrusting en boekingscoördinatie inbegrepen. Afhankelijk van de boot kunnen schipper, drankjes, handdoeken of ligplaats inbegrepen zijn; ik bevestig dit vooraf."
    }
  },
  {
    id: "boat-rental-extras",
    serviceId: "boats",
    question: {
      es: "¿Qué gastos adicionales debo tener en cuenta?",
      en: "Which extra costs should I consider?",
      de: "Welche Zusatzkosten sollte ich einplanen?",
      nl: "Met welke extra kosten moet ik rekening houden?"
    },
    answer: {
      es: "Los extras habituales son combustible, catering, bebidas premium, juguetes náuticos, traslados o propina de tripulación. Te doy una estimación clara antes de confirmar.",
      en: "Common extras are fuel, catering, premium drinks, water toys, transfers or crew gratuity. I give you a clear estimate before confirmation.",
      de: "Typische Extras sind Treibstoff, Catering, Premium-Getränke, Wasserspielzeug, Transfers oder Trinkgeld für die Crew. Ich gebe dir vorab eine klare Schätzung.",
      nl: "Veelvoorkomende extra's zijn brandstof, catering, premium drankjes, waterspeelgoed, transfers of fooi voor de bemanning. Ik geef vooraf een duidelijke schatting."
    }
  },
  {
    id: "boat-rental-license",
    serviceId: "boats",
    question: {
      es: "¿Necesito licencia para alquilar un barco?",
      en: "Do I need a licence to rent a boat?",
      de: "Brauche ich einen Führerschein, um ein Boot zu mieten?",
      nl: "Heb ik een vaarbewijs nodig om een boot te huren?"
    },
    answer: {
      es: "No necesitas licencia si reservas con patrón, que suele ser la opción más cómoda en Ibiza. Si quieres alquilar sin patrón, tendrás que presentar licencia válida y experiencia.",
      en: "You do not need a licence when booking with a skipper, which is usually the easiest option in Ibiza. Bareboat rentals require a valid licence and experience.",
      de: "Mit Skipper brauchst du keinen Führerschein, das ist auf Ibiza meist die bequemste Option. Ohne Skipper brauchst du eine gültige Lizenz und Erfahrung.",
      nl: "Met schipper heb je geen vaarbewijs nodig, meestal de makkelijkste optie op Ibiza. Zonder schipper heb je een geldig vaarbewijs en ervaring nodig."
    }
  },
  {
    id: "boat-rental-route",
    serviceId: "boats",
    question: {
      es: "¿Podemos elegir la ruta?",
      en: "Can we choose the route?",
      de: "Können wir die Route wählen?",
      nl: "Kunnen we de route kiezen?"
    },
    answer: {
      es: "Sí. Podemos preparar Formentera, calas de Ibiza, beach clubs o una ruta más tranquila. El capitán ajustará el plan según mar, viento y horario.",
      en: "Yes. We can plan Formentera, Ibiza coves, beach clubs or a quieter route. The captain adapts the plan to sea, wind and timing.",
      de: "Ja. Wir können Formentera, Buchten auf Ibiza, Beach Clubs oder eine ruhigere Route planen. Der Kapitän passt den Plan an Meer, Wind und Zeit an.",
      nl: "Ja. We kunnen Formentera, baaien van Ibiza, beachclubs of een rustigere route plannen. De kapitein past het plan aan zee, wind en timing aan."
    }
  },
  {
    id: "boat-rental-duration",
    serviceId: "boats",
    question: {
      es: "¿Cuánto dura normalmente un charter?",
      en: "How long does a charter usually last?",
      de: "Wie lange dauert ein Charter normalerweise?",
      nl: "Hoe lang duurt een charter meestal?"
    },
    answer: {
      es: "Lo habitual es un día completo de unas 7 u 8 horas. También podemos consultar sunset charter, medio día o varios días según barco y disponibilidad.",
      en: "A full day of about 7 or 8 hours is standard. We can also check sunset charters, half days or multi-day options depending on boat and availability.",
      de: "Üblich ist ein ganzer Tag mit etwa 7 bis 8 Stunden. Sunset-Charter, Halbtage oder mehrere Tage können wir je nach Boot und Verfügbarkeit prüfen.",
      nl: "Een volledige dag van ongeveer 7 of 8 uur is standaard. Sunset charters, halve dagen of meerdere dagen kunnen we afhankelijk van boot en beschikbaarheid bekijken."
    }
  },
  {
    id: "boat-rental-weather",
    serviceId: "boats",
    question: {
      es: "¿Qué pasa si hace mal tiempo?",
      en: "What happens if the weather is bad?",
      de: "Was passiert bei schlechtem Wetter?",
      nl: "Wat gebeurt er bij slecht weer?"
    },
    answer: {
      es: "La seguridad manda. Si el mar no permite navegar, revisamos cambio de fecha, ruta protegida o la política concreta de la embarcación antes de confirmar.",
      en: "Safety comes first. If the sea is not suitable, we review date changes, protected routes or the specific policy of the boat before confirmation.",
      de: "Sicherheit geht vor. Wenn das Meer nicht geeignet ist, prüfen wir Terminwechsel, geschützte Routen oder die konkrete Policy des Boots vor der Bestätigung.",
      nl: "Veiligheid staat voorop. Als de zee niet geschikt is, bekijken we een datumwijziging, beschutte route of het specifieke beleid van de boot vóór bevestiging."
    }
  },
  {
    id: "water-toys-prices",
    serviceId: "water-toys",
    question: { es: "¿Por qué no se muestran precios en juguetes náuticos?", en: "Why are water toy prices not displayed?" },
    answer: { es: "La disponibilidad depende del barco, fecha, logística y condiciones. Cerramos la propuesta por WhatsApp o teléfono.", en: "Availability depends on boat, date, logistics and conditions. We close the proposal by WhatsApp or phone." }
  }
];