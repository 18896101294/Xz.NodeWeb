import request from '@/utils/request'

export function getRolesPage(data) {
  return request({
    url: '/Role/LoadRolesPage',
    method: 'post',
    data
  })
}

export function addRole(data) {
  return request({
    url: '/Role/AddRole',
    method: 'post',
    data
  })
}

export function updateRole(data) {
  return request({
    url: '/Role/UpdateRole',
    method: 'post',
    data
  })
}

export function deleteRole(data) {
  return request({
    url: '/Role/Delete',
    method: 'post',
    data
  })
}

export function disableRole(data) {
  return request({
    url: '/Role/DisableRole',
    method: 'post',
    data
  })
}

