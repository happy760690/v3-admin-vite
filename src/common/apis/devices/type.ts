export interface CreateOrUpdateDeviceRequestData {
  id?: number
  name: string
  type: string
  status: string
  location: string
}

export interface DeviceRequestData {
  /** 当前页码 */
  currentPage: number
  /** 查询条数 */
  size: number
  /** 查询参数：名称 */
  name?: string
  /** 查询参数：类型 */
  type?: string
  /** 查询参数：状态 */
  status?: string
}

export interface DeviceData {
  createTime: string
  id: number
  location: string
  name: string
  status: string
  type: string
}

export type DeviceResponseData = ApiResponseData<{
  list: DeviceData[]
  total: number
}>
