"use client";

import { useEffect, useMemo, useState } from "react";

type EventCountdownProps = {
  targetDate: string;
  title: string;
  location: string;
  eyebrow?: string;
  completedLabel?: string;
};

type Remaining = {
  isOver: boolean;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

function getRemaining(targetDate: string): Remaining {
  const now = Date.now();
  const target = new Date(targetDate).getTime();
  const delta = target - now;

  if (delta <= 0) {
    return { isOver: true, days: 0, hours: 0, minutes: 0, seconds: 0 };
  }

  const days = Math.floor(delta / (1000 * 60 * 60 * 24));
  const hours = Math.floor((delta / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((delta / (1000 * 60)) % 60);
  const seconds = Math.floor((delta / 1000) % 60);

  return { isOver: false, days, hours, minutes, seconds };
}

function CounterBox({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-[var(--line)] bg-white px-4 py-3 text-center">
      <p className="text-2xl font-extrabold text-[var(--green-deep)] sm:text-3xl">{value.toString().padStart(2, "0")}</p>
      <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--muted)]">{label}</p>
    </div>
  );
}

export function EventCountdown({
  targetDate,
  title,
  location,
  eyebrow = "Événement à venir",
  completedLabel = "L'événement est en cours.",
}: EventCountdownProps) {
  const [remaining, setRemaining] = useState<Remaining>(() => getRemaining(targetDate));

  useEffect(() => {
    const timer = setInterval(() => {
      setRemaining(getRemaining(targetDate));
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  const formattedDate = useMemo(
    () =>
      new Intl.DateTimeFormat("fr-FR", {
        dateStyle: "full",
        timeStyle: "short",
      }).format(new Date(targetDate)),
    [targetDate],
  );

  return (
    <div className="soft-card p-6 sm:p-7">
      <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--orange-strong)]">{eyebrow}</p>
      <h3 className="display-font mt-2 text-2xl font-extrabold text-[var(--green-deep)] sm:text-3xl">{title}</h3>
      <p className="mt-2 text-sm text-[var(--muted)]">{location}</p>
      <p className="mt-1 text-sm text-[var(--muted)]">{formattedDate}</p>

      {remaining.isOver ? (
        <p className="mt-6 rounded-lg bg-[rgba(19,136,74,0.12)] px-4 py-3 text-sm font-semibold text-[var(--green-deep)]">
          {completedLabel}
        </p>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <CounterBox label="Jours" value={remaining.days} />
          <CounterBox label="Heures" value={remaining.hours} />
          <CounterBox label="Minutes" value={remaining.minutes} />
          <CounterBox label="Secondes" value={remaining.seconds} />
        </div>
      )}
    </div>
  );
}
