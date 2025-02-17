const apiUrls = {
  register: { method: "POST", url: "/api/users/register" },
  verifyEmail: { method: "POST", url: "/api/users/verify-email" },
  checkEmail: { method: "POST", url: "/api/users/check-email" },
  checkPassword: { method: "POST", url: "/api/users/check-Password" },
  forgotPassword: { method: "PUT", url: "/api/users/forgot-Password" },
  verifyOtp: { method: "PUT", url: "/api/users/verify-otp" },
  resetPassword: { method: "PUT", url: "/api/users/reset-password" },
  logout: { method: "PUT", url: "/api/users/logout" },
  userAllDetails: { method: "GET", url: "/api/users/user-all-details" },
  userSomeDetails: { method: "GET", url: "/api/users/user-some-details" },
  search: { method: "GET", url: "/api/users/search" },
  uploadImageMedia: { method: "POST", url: "/api/messages/upload-image-media" },
  uploadGroupAvatar: { method: "POST", url: "/api/groups/upload-group-avatar" },
  changeTheme: { method: "PUT", url: "/api/users/change-theme" },
  changeLanguage: { method: "PUT", url: "/api/users/change-language" },
  resetAccessToken: { method: "PUT", url: "/api/users/reset-access-token" },
};
export default apiUrls;
