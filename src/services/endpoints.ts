const BASE_URL = "https://apitest.korrektor.az/api";

export const Endpoints = {
  login: `${BASE_URL}/v1/auth/login/`,  
  logout: `${BASE_URL}/v1/auth/logout/`,
  register: `${BASE_URL}/v1/auth/register/`,
  me: `${BASE_URL}/v1/auth/me/`,
  tokenRefresh: `${BASE_URL}/v1/auth/token/refresh/`,
  tokenVerify: `${BASE_URL}/v1/auth/token/verify/`,
  users: `${BASE_URL}/v1/auth/users/`,
  userById: (id: number) => `${BASE_URL}/v1/auth/users/${id}/`,
  checkText: `${BASE_URL}/v1/correction/check-text/`,
};