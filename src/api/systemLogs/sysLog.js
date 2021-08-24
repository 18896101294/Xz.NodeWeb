import request from '@/utils/request'

export function getPageData(data) {
  return request({
    url: '/SysLog/GetPageData',
    method: 'post',
    data
  })
}


export function clearData() {
  return request({
    url: '/SysLog/ClearData',
    method: 'post',
  })
}


