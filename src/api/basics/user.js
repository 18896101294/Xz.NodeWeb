import request from '@/utils/request'

export function loadUsersPage(data) {
  return request({
    url: '/User/LoadUsersPage',
    method: 'post',
    data
  })
}

export function saveUser(data) {
  return request({
    url: '/User/SaveUser',
    method: 'post',
    data
  })
}

export function changePassword(data) {
  return request({
    url: '/User/ChangePassword',
    method: 'post',
    data
  })
}

export function changeProfile(data) {
  return request({
    url: '/User/ChangeProfile',
    method: 'post',
    data
  })
}

export function deleteUser(data) {
  return request({
    url: '/User/Delete',
    method: 'post',
    data
  })
}

export function disableUser(data) {
  return request({
    url: '/User/DisableUser',
    method: 'post',
    data
  })
}

export function loadUserAll() {
  return request({
    url: '/User/LoadAll',
    method: 'get'
  })
}