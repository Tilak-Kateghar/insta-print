import { apiFetch } from "./apiFetch";

export async function logoutUser() {
  try {
    await apiFetch("/users/logout", {
      method: "POST",
    });
  } catch (error) {
    console.log("User logout attempted");
  }
}

export async function logoutVendor() {
  try {
    await apiFetch("/vendors/logout", {
      method: "POST",
    });
  } catch (error) {
    console.log("Vendor logout attempted");
  }
}

/**
 * Verify user authentication by calling /user/me
 * Uses credentials: "include" to send cookies
 * Returns true if authenticated (200), false otherwise
 */
export async function verifyUserAuth(): Promise<boolean> {
  try {
    await apiFetch("/user/me", {
      method: "GET",
    });
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Verify vendor authentication by calling /vendor/me
 * Uses credentials: "include" to send cookies
 * Returns true if authenticated (200), false otherwise
 */
export async function verifyVendorAuth(): Promise<boolean> {
  try {
    await apiFetch("/vendor/me", {
      method: "GET",
    });
    return true;
  } catch (error) {
    return false;
  }
}
