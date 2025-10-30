import { removeAccessToken } from "@/services/tokenService";

export const logout = () => {
  try {
    // Remove access token using your existing helper
    removeAccessToken();

    // Remove stored User ID
    localStorage.removeItem("UserID");
    localStorage.clear();

    console.log("User logged out successfully. Token and UserID cleared.");

    // Redirect to login page
    window.location.href = "/login";
  } catch (error) {
    console.error("Error during logout:", error);
  }
};
