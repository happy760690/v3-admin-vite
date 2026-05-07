import type * as Devices from "./type"
import { request } from "@/http/axios"

/** 增 */
export function createDeviceApi(data: Devices.CreateOrUpdateDeviceRequestData) {
  return request({
    url: "devices",
    method: "post",
    data
  })
}

/** 删 */
export function deleteDeviceApi(id: number) {
  return request({
    url: `devices/${id}`,
    method: "delete"
  })
}

/** 改 */
export function updateDeviceApi(data: Devices.CreateOrUpdateDeviceRequestData) {
  return request({
    url: "devices",
    method: "put",
    data
  })
}

/** 查 */
export function getDeviceApi(params: Devices.DeviceRequestData) {
  return request<Devices.DeviceResponseData>({
    url: "devices",
    method: "get",
    params
  })
}
