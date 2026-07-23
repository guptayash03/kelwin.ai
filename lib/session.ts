"use client";

import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";

export function initSessionSync() {
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      const token = await user.getIdToken();
      document.cookie = `__session=${token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
    } else {
      document.cookie = "__session=; path=/; max-age=0";
    }
  });
}
