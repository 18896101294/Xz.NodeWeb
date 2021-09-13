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

export function getRoleBindUsers(data) {
  return request({
    url: '/Role/GetRoleBindUsers',
    method: 'post',
    data
  })
}

export function roleAllocationUsers(data) {
  return request({
    url: '/Role/RoleAllocationUsers',
    method: 'post',
    data
  })
}

export function roleAllocationModules(data) {
  return request({
    url: '/Role/RoleAllocationModules',
    method: 'post',
    data
  })
}

export function roleAllocationMenus(data) {
  return request({
    url: '/Role/RoleAllocationMenus',
    method: 'post',
    data
  })
}




