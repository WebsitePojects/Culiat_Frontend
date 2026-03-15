const VISITOR_ID_KEY = "visitorId";
const GUEST_PROFILE_KEY = "guestProfile";

export const getOrCreateVisitorId = () => {
  if (typeof window === "undefined") return null;

  let visitorId = localStorage.getItem(VISITOR_ID_KEY);
  if (!visitorId) {
    visitorId = `visitor_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
    localStorage.setItem(VISITOR_ID_KEY, visitorId);
  }
  return visitorId;
};

export const getGuestProfile = () => {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(GUEST_PROFILE_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

export const saveGuestProfile = (profile = {}) => {
  if (typeof window === "undefined") return;
  const existing = getGuestProfile() || {};

  const merged = {
    ...existing,
    ...profile,
    firstName: profile.firstName ?? existing.firstName ?? "",
    lastName: profile.lastName ?? existing.lastName ?? "",
    email: profile.email ?? existing.email ?? "",
    phoneNumber: profile.phoneNumber ?? existing.phoneNumber ?? "",
    residentType: "Unregistered",
    updatedAt: new Date().toISOString(),
  };

  localStorage.setItem(GUEST_PROFILE_KEY, JSON.stringify(merged));
};

export const getGuestRegisterPrefill = () => {
  const profile = getGuestProfile();
  if (!profile) return null;

  return {
    firstName: profile.firstName || "",
    lastName: profile.lastName || "",
    email: profile.email || "",
  };
};
