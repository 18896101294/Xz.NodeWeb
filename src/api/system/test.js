import request from '@/utils/request'

export function fetchList(data) {
  return request({
    url: '/Test/GetPageData',
    method: 'post',
    data
  })
}

export function createArticle(data) {
  return request({
    url: '/Test/Edit',
    method: 'post',
    data
  })
}

export function updateArticle(data) {
  return request({
    url: '/Test/Edit',
    method: 'post',
    data
  })
}

export function deleteArticle(data) {
  return request({
    url: '/Test/Delete',
    method: 'post',
    data
  })
}

export function uploadArticle(data) {
  return request({
    url: '/Test/Import',
    method: 'post',
    data
  })
}

export function getMyErrorTest() {
  return request({
    url: '/Test/GetMyErrorTest',
    method: 'get'
  })
}
