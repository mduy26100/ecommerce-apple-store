const GUEST_ID_KEY = "apple_store_guest_id";

export const getGuestId = (): string | null => {
  return localStorage.getItem(GUEST_ID_KEY);
};

export const getOrCreateGuestId = (): string => {
  let guestId = localStorage.getItem(GUEST_ID_KEY);
  if (!guestId) {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
      guestId = crypto.randomUUID();
    } else {
      guestId = `guest_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    }
    localStorage.setItem(GUEST_ID_KEY, guestId);
  }
  return guestId;
};

export const clearGuestId = (): void => {
  localStorage.removeItem(GUEST_ID_KEY);
};
