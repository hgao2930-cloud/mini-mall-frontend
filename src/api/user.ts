import api from '.'

export interface User {
  id: string
  username: string
}

export interface AuthResponse {
  token: string
  user: User
}

export const registerUser = function (data: { username: string; password: string }) {
    return api.post<AuthResponse>('/auth/register',data)
}

export const loginUser = function (data: { username: string; password: string }) {
  return api.post<AuthResponse>('/auth/login',data)
}
