import request from '@/utils/request'

export function getOrgs() {
  return request({
    url: '/User/GetOrgs',
    method: 'get'
  })
}

export function getChildOrgs(orgId) {
  return request({
    url: '/User/GetChildOrgs?orgId=' + orgId,
    method: 'get'
  })
}

export function getOrgUsers(data) {
  return request({
    url: '/Org/GetOrgUsers',
    method: 'get',
    params: data
  })
}

export function getOrgsName() {
  return request({
    url: '/User/GetOrgsName',
    method: 'get'
  })
}

export function addOrg(data) {
  return request({
    url: '/Org/AddOrg',
    method: 'post',
    data
  })
}

export function updateOrg(data) {
  return request({
    url: '/Org/UpdateOrg',
    method: 'post',
    data
  })
}

export function deleteOrg(data) {
  return request({
    url: '/Org/DeleteOrg',
    method: 'post',
    data
  })
}