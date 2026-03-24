"use client";

import { useId, useState } from "react";

export function MoodIntensitySlider() {
  const id = useId();
  const [value, setValue] = useState(5);
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground" htmlFor={id}>
        Intensity (1–10)
      </label>
      <input
        id={id}
        name="intensity"
        type="range"
        min={1}
        max={10}
        value={value}
        onChange={(e) => setValue(Number(e.target.value))}
        className="mt-2 w-full accent-[color:var(--accent)]"
        aria-valuemin={1}
        aria-valuemax={10}
        aria-valuenow={value}
        aria-valuetext={`${value} out of 10`}
      />
      <p className="text-xs text-muted-foreground" aria-live="polite">
        Selected: <span className="font-medium text-foreground">{value}</span> / 10
      </p>
    </div>
  );
}
