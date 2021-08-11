import Cookies from 'js-cookie'

const TokenKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI0OWRmMTYwMi1mNWYzLTRkNTItYWZiNy0zODAyZGE2MTk1NTgiLCJhY2NvdW50IjoiYWRtaW4iLCJuYmYiOjE2Mjg1MDEzNTEsImV4cCI6MTYyOTM2NTM1MSwiaXNzIjoiWHouTm9kZSIsImF1ZCI6Inh6In0.GGZMFui28W3ieHBJUiI-Yy7KbdL_6JvfrzjXdGxa2h4'

export function getToken() {
  return Cookies.get(TokenKey)
}

export function setToken(token) {
  return Cookies.set(TokenKey, token)
}

export function removeToken() {
  return Cookies.remove(TokenKey)
}
