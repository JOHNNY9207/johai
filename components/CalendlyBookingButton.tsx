"use client";

import { useEffect, useState } from "react";
import { CalendarCheck } from "lucide-react";

type CalendlyBookingButtonProps = {
  className?: string;
  label?: string;
  icon?: boolean;
};

export default function CalendlyBookingButton({
  className,
  label = "Book Free AI Audit",
  icon = true,
}: CalendlyBookingButtonProps) {
  const [bookingUrl, setBookingUrl] = useState("https://calendly.com/");

  useEffect(() => {
    let active = true;

    async function loadBookingUrl() {
      try {
        const res = await fetch("/api/calendly/public");

        if (!res.ok) {
          return;
        }

        const data = (await res.json()) as { defaultBookingUrl?: string };

        if (active && data.defaultBookingUrl) {
          setBookingUrl(data.defaultBookingUrl);
        }
      } catch {
        setBookingUrl("https://calendly.com/");
      }
    }

    loadBookingUrl();

    return () => {
      active = false;
    };
  }, []);

  return (
    <a
      href={bookingUrl}
      target="_blank"
      rel="noreferrer"
      className={
        className ??
        "inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-bold text-white transition hover:bg-blue-500"
      }
    >
      {icon && <CalendarCheck size={18} />}
      {label}
    </a>
  );
}
