import request from '@/utils/request'
import requestBase from '@/api/request-base'

export function consulServices() {
  return request({
    url: requestBase + '/Consul/ConsulServices',
    method: 'get'
  })
}

export function consulServiceItem(data) {
  return request({
    url: requestBase + '/Consul/ConsulServiceItem?serviceName=' + data,
    method: 'get',
  })
}

export function consulServiceDeleteItem(data) {
  return request({
    url: requestBase + '/Consul/ConsulServiceDeleteItem?serviceId=' + data,
    method: 'put',
  })
}

