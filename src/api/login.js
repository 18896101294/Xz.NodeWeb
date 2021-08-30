import request from '@/utils/request'

export function login(data) {
  return request({
    url: '/Login/Login',
    method: 'post',
    data
  })
}

export function getInfo(token) {
  return request({
    url: '/UserSession/GetUserProfile',
    method: 'get',
    params: { token }
  })
}

export function logout() {
  return request({
    url: '/Login/logout',
    method: 'post'
  })
}

export function getUserModulesTree() {
  return request({
    url: '/UserSession/GetUserModulesTree',
    method: 'get',
  })
}