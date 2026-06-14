import { useState, useEffect, useCallback } from "react";

export type WidgetKey = "insights" | "calendar" | "metas" | "charts";

export type WidgetPrefs = Record<WidgetKey, boolean>;

const defaultPrefs: WidgetPrefs = {
  insights: true,
  calendar: true,
  metas: true,
  charts: true,
};

function getStorageKey(userId: string): string {
  return `sm_widgets_${userId}`;
}

export function loadPrefs(userId: string): WidgetPrefs {
  try {
    const raw = localStorage.getItem(getStorageKey(userId));
    if (raw) return { ...defaultPrefs, ...JSON.parse(raw) };
  } catch {}
  return { ...defaultPrefs };
}

export function savePrefs(userId: string, prefs: WidgetPrefs) {
  try {
    localStorage.setItem(getStorageKey(userId), JSON.stringify(prefs));
  } catch {}
}

export function useDashboardPrefs(userId: string | null) {
  const [prefs, setPrefs] = useState<WidgetPrefs>({ ...defaultPrefs });

  useEffect(() => {
    if (userId) setPrefs(loadPrefs(userId));
  }, [userId]);

  const toggle = useCallback(
    (key: WidgetKey) => {
      setPrefs((prev) => {
        const next = { ...prev, [key]: !prev[key] };
        if (userId) savePrefs(userId, next);
        return next;
      });
    },
    [userId]
  );

  return { prefs, toggle };
}
