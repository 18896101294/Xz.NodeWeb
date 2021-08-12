import request from '@/utils/request'
import requestBase from '@/api/request-base'

export function consulServices(data) {
  return request({
    url: requestBase + '/Consul/ConsulServices',
    method: 'post',
    data
  })
}

export function createArticle(data) {
  return request({
    url: requestBase + '/Test/Edit',
    method: 'post',
    data
  })
}

export function updateArticle(data) {
  return request({
    url: requestBase + '/Test/Edit',
    method: 'post',
    data
  })
}

export function deleteArticle(data) {
  return request({
    url: requestBase + '/Test/Delete',
    method: 'post',
    data
  })
}

export function uploadArticle(data) {
  return request({
    url: requestBase + '/Test/Import',
    method: 'post',
    data
  })
}
