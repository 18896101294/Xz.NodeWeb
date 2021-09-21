import request from '@/utils/request'
import requestBase from '@/api/request-base'

export function getPageData(data) {
  return request({
    url: '/SystemConfiguration/GetPageData',
    method: 'post',
    data
  })
}

export function getAllCategory() {
    return request({
      url: '/SystemConfiguration/GetAllCategory',
      method: 'get'
    })
  }

export function createArticle(data) {
  return request({
    url: '/SystemConfiguration/Edit',
    method: 'post',
    data
  })
}

export function updateArticle(data) {
  return request({
    url: '/SystemConfiguration/Edit',
    method: 'post',
    data
  })
}

export function deleteArticle(data) {
  return request({
    url: '/SystemConfiguration/Delete',
    method: 'post',
    data
  })
}

export function getSysConfigurations(query) {
  return request({
    url: '/SystemConfiguration/GetSysConfigurations',
    method: 'get',
    params: query
  })
}

