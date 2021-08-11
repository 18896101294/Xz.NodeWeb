import request from '@/utils/request'

export function login(data) {
  return request({
    url: 'http://192.168.1.109:80/ocelot/Login/Login',
    method: 'post',
    data
  })
}

export function getInfo(token) {
  return request({
    url: '/vue-element-admin/user/info',
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
