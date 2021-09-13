import request from '@/utils/request'

export function getModules() {
  return request({
    url: '/UserSession/GetModules',
    method: 'get'
  })
}

export function getModulesTree(data) {
  return request({
    url: '/UserSession/GetModulesTree',
    method: 'get',
    params: data
  })
}

export function loadMenus(data) {
  return request({
    url: '/Module/LoadMenus',
    method: 'get',
    params: data
  })
}

export function getModulesName() {
  return request({
    url: '/UserSession/GetModulesName',
    method: 'get'
  })
}

export function createModule(data) {
  return request({
    url: '/Module/Add',
    method: 'post',
    data
  })
}

export function updateModule(data) {
  return request({
    url: '/Module/Update',
    method: 'post',
    data
  })
}

export function deleteModule(data) {
  return request({
    url: '/Module/Delete',
    method: 'post',
    data
  })
}

export function addElement(data) {
  return request({
    url: '/Module/AddMenu',
    method: 'post',
    data
  })
}

export function updateElement(data) {
  return request({
    url: '/Module/UpdateMenu',
    method: 'post',
    data
  })
}

export function deleteElement(data) {
  return request({
    url: '/Module/DelMenu',
    method: 'post',
    data
  })
}

export function loadForRole(roleId) {
  return request({
    url: '/Module/LoadForRole?firstId=' + roleId,
    method: 'get'
  })
}

export function loadMenusForRole(roleId) {
  return request({
    url: '/Module/LoadMenusForRole?firstId=' + roleId,
    method: 'get'
  })
}

export function loadPropertiesForRole(data) {
  return request({
    url: '/Module/LoadPropertiesForRole',
    method: 'post',
    data
  })
}

export function getCheckedModules(data) {
  return request({
    url: '/Module/GetCheckedModules',
    method: 'post',
    data
  })
}

export function getCheckedProperties(data) {
  return request({
    url: '/Module/GetCheckedProperties',
    method: 'post',
    data
  })
}

