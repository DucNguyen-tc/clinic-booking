"use client";

import { useState } from "react";
import type { NotificationSettings } from "@/types/doctor";

// ── Props ─────────────────────────────────────────────────────────────────────

interface NotificationSettingsProps {
  defaultValues: NotificationSettings;
  onChange?: (settings: NotificationSettings) => void;
}

// ── Toggle Switch ─────────────────────────────────────────────────────────────

function ToggleSwitch({
  checked,
  onToggle,
}: {
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onToggle}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0 ${
        checked ? "bg-primary" : "bg-outline-variant"
      }`}
    >
      <span
        className={`inline-block h-4 w-4 rounded-full bg-white transition-transform shadow-sm ${
          checked ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );
}

// ── Notification Item ─────────────────────────────────────────────────────────

interface NotificationItemProps {
  title: string;
  description: string;
  checked: boolean;
  onToggle: () => void;
  highlighted?: boolean;
}

function NotificationItem({
  title,
  description,
  checked,
  onToggle,
  highlighted,
}: NotificationItemProps) {
  return (
    <label
      className={`flex items-start gap-4 p-4 rounded-2xl cursor-pointer transition-colors ${
        highlighted
          ? "bg-secondary-container/20 border border-secondary-container"
          : "hover:bg-surface-container"
      }`}
    >
      <ToggleSwitch checked={checked} onToggle={onToggle} />
      <div className="flex-1 min-w-0">
        <p
          className={`font-semibold text-sm ${highlighted ? "text-on-secondary-container" : "text-on-surface"}`}
        >
          {title}
        </p>
        <p
          className={`text-xs mt-0.5 ${highlighted ? "text-on-secondary-container/80" : "text-on-surface-variant"}`}
        >
          {description}
        </p>
      </div>
    </label>
  );
}
