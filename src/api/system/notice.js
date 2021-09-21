import request from '@/utils/request'

export function getPageData(data) {
  return request({
    url: '/SystemNotice/GetPageData',
    method: 'post',
    data
  })
}

export function deleteArticle(data) {
  return request({
    url: '/SystemNotice/Delete',
    method: 'post',
    data
  })
}

export function reExecute(data) {
  return request({
    url: '/SystemNotice/ReExecute',
    method: 'post',
    data
  })
}

export function add(data) {
  return request({
    url: '/SystemNotice/Add',
    method: 'post',
    data
  })
}

export function update(data) {
  return request({
    url: '/SystemNotice/Update',
    method: 'post',
    data
  })
}
