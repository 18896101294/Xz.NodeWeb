import request from '@/utils/request'

export function getModules() {
  return request({
    url: '/User/GetModules',
    method: 'get'
  })
}

export function getModulesTree(data) {
  return request({
    url: '/User/GetModulesTree',
    method: 'get',
    params: data
  })
}

export function getModulesName() {
  return request({
    url: '/User/GetModulesName',
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