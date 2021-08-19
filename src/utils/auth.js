import Cookies from 'js-cookie'

const TokenKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI0OWRmMTYwMi1mNWYzLTRkNTItYWZiNy0zODAyZGE2MTk1NTgiLCJhY2NvdW50IjoiYWRtaW4iLCJuYmYiOjE2MjkzNjU0MjUsImV4cCI6MTYzMDIyOTQyNSwiaXNzIjoiWHouTm9kZSIsImF1ZCI6Inh6In0.drYOl5cDIhyXErCTyDfuJ41Kitqs8RYBgArZTEtMHxI'

export function getToken() {
  return Cookies.get(TokenKey)
}

export function setToken(token) {
  return Cookies.set(TokenKey, token)
}

export function removeToken() {
  return Cookies.remove(TokenKey)
}
