import request from '@/utils/request'

export function fetchList(data) {
  return request({
    url: 'http://192.168.1.109:80/ocelot/Test/GetPageData',
    method: 'post',
    data
  })
}

export function createArticle(data) {
  return request({
    url: 'http://192.168.1.109:80/ocelot/Test/Edit',
    method: 'post',
    data
  })
}

export function updateArticle(data) {
  return request({
    url: 'http://192.168.1.109:80/ocelot/Test/Edit',
    method: 'post',
    data
  })
}

export function deleteArticle(data) {
  return request({
    url: 'http://192.168.1.109:80/ocelot/Test/Delete',
    method: 'post',
    data
  })
}

export function uploadArticle(data) {
  return request({
    url: 'http://192.168.1.109:80/ocelot/Test/Import',
    method: 'post',
    data
  })
}