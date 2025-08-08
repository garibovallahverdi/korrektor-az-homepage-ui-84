const BASE_URL = "https://apitest.korrektor.az/api";

export const Endpoints = {
  login: `${BASE_URL}/v1/users/login/`,  
  passwordResetRequest: `${BASE_URL}/v1/users/password-reset-request/`,  
  passwordResetConfirm: `${BASE_URL}/v1/users/password-reset-confirm/`,  
  googleAuth: `${BASE_URL}/v1/auth/google/`,  
  logout: `${BASE_URL}/v1/users/logout/`,
  register: `${BASE_URL}/v1/users/register/`,
  verifyAccount: (token: string, verifyToken: string) => `${BASE_URL}/v1/users/verify/${token}/${verifyToken}/`,
  tokenVerify: `${BASE_URL}/v1/users/token/verify/`,
  me: `${BASE_URL}/v1/users/me/`,
  tokenRefresh: `${BASE_URL}/v1/users/token/refresh/`,
  users: `${BASE_URL}/v1/auth/users/`,
  userById: (id: number) => `${BASE_URL}/v1/users/users/${id}/`,
  checkText: `${BASE_URL}/v1/correction/check-text-gemini/`,
};