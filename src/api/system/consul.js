import request from '@/utils/request'

export function consulServices() {
  return request({
    url: '/Consul/ConsulServices',
    method: 'get'
  })
}

export function consulServiceItem(data) {
  return request({
    url: '/Consul/ConsulServiceItem?serviceName=' + data,
    method: 'get',
  })
}

export function consulSelf() {
  return request({
    url: '/Consul/ConsulSelf',
    method: 'get',
  })
}

export function consulServiceDeleteItem(data) {
  return request({
    url: '/Consul/ConsulServiceDeleteItem?serviceId=' + data,
    method: 'put',
  })
}

