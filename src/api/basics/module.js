import request from '@/utils/request'
import requestBase from '@/api/request-base'

export function getModules() {
  return request({
    url: requestBase + '/User/GetModules',
    method: 'get'
  })
}

export function getModulesTree(data) {
  return request({
    url: requestBase + '/User/GetModulesTree',
    method: 'get',
    params: data
  })
}

export function getModulesName() {
  return request({
    url: requestBase + '/User/GetModulesName',
    method: 'get'
  })
}

export function createModule(data) {
  return request({
    url: requestBase + '/Module/Add',
    method: 'post',
    data
  })
}

export function updateArticle(data) {
  return request({
    url: requestBase + '/Module/Update',
    method: 'post',
    data
  })
}

export function deleteArticle(data) {
  return request({
    url: requestBase + '/Module/Delete',
    method: 'post',
    data
  })
}