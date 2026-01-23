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