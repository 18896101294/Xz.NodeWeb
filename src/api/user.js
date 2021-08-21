import request from '@/utils/request'
import requestBase from '@/api/request-base'

export function login(data) {
  return request({
    url: requestBase + '/Login/Login',
    method: 'post',
    data
  })
}

export function getInfo(token) {
  return request({
    url: requestBase + '/User/GetUserProfile',
    method: 'get',
    params: { token }
  })
}

export function logout() {
  return request({
    url: '/vue-element-admin/user/logout',
    method: 'post'
  })
}

export function getUserModulesTree() {
  return request({
    url: requestBase + '/User/GetUserModulesTree',
    method: 'get',
  })
}