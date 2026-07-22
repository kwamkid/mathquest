// lib/useDeviceClass.ts
//
// Classifies the current device as 'phone' | 'tablet' | 'desktop' for features
// that need a real keyboard (the typing tutor). There is NO web API that
// reports "is a physical keyboard attached", so we infer from pointer + screen:
//
//   • A device whose PRIMARY pointer is a mouse/trackpad (hover-capable) is a
//     'desktop' — this deliberately includes an iPad with a Magic Keyboard /
//     trackpad, which reports `hover: hover` and is a perfectly good typing
//     station.
//   • A touch-primary device (coarse pointer, no hover) is a phone or tablet,
//     split by its shorter screen edge: phones are < 600 CSS px on the short
//     side, tablets ≥ 600. (iPhone ≈ 390, iPad ≈ 768+.)
//
// Returns null until mounted so server render / first paint never flashes a
// device-specific screen (avoids hydration mismatch).

'use client';

import { useEffect, useState } from 'react';

export type DeviceClass = 'phone' | 'tablet' | 'desktop';

const PHONE_MAX_SHORT_EDGE = 600; // CSS px on the shorter screen dimension

function detect(): DeviceClass {
  const touchPrimary =
    window.matchMedia('(pointer: coarse)').matches &&
    window.matchMedia('(hover: none)').matches;
  if (!touchPrimary) return 'desktop';
  const shortEdge = Math.min(window.screen.width, window.screen.height);
  return shortEdge < PHONE_MAX_SHORT_EDGE ? 'phone' : 'tablet';
}

export function useDeviceClass(): DeviceClass | null {
  const [cls, setCls] = useState<DeviceClass | null>(null);

  useEffect(() => {
    const update = () => setCls(detect());
    update();
    // Re-classify if the pointer capability changes (e.g. a keyboard/trackpad
    // is attached to or removed from a tablet).
    const mq = window.matchMedia('(pointer: coarse)');
    mq.addEventListener?.('change', update);
    return () => mq.removeEventListener?.('change', update);
  }, []);

  return cls;
}
