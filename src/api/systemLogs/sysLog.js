import request from '@/utils/request'

export function getPageData(data) {
  return request({
    url: '/SysLog/GetPageData',
    method: 'post',
    data
  })
}


