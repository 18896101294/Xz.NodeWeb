import request from '@/utils/request'

export function getRolesPage(data) {
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