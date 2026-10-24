import { useEffect, useState } from "react";

const KEY = "sg-hard-mode";

/** Hard mode is stored on the device: it is a practice setting, not account data. */
export function getHardMode(): boolean {
  try {
    return localStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
}

export function setHardMode(v: boolean) {
  try {
    localStorage.setItem(KEY, v ? "1" : "0");
  } catch {
    // storage unavailable (private mode): the toggle simply will not persist
  }
}

/** Hydrated after mount so server rendering and the client agree on the first paint. */
export function useHardMode() {
  const [hard, setHard] = useState(false);
  useEffect(() => setHard(getHardMode()), []);
  const update = (v: boolean) => {
    setHardMode(v);
    setHard(v);
  };
  return [hard, update] as const;
}
