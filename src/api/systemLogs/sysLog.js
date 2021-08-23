import request from '@/utils/request'
import requestBase from '@/api/request-base'

export function getPageData(data) {
  return request({
    url: requestBase + '/SysLog/GetPageData',
    method: 'post',
    data
  })
}


