<script lang="ts" setup>
import type { CreateOrUpdateDeviceRequestData, DeviceData } from "@@/apis/devices/type"
import type { FormRules } from "element-plus"
import { createDeviceApi, deleteDeviceApi, getDeviceApi, updateDeviceApi } from "@@/apis/devices"
import { usePagination } from "@@/composables/usePagination"
import { CirclePlus, Delete, Download, Refresh, RefreshRight, Search } from "@element-plus/icons-vue"
import { cloneDeep } from "lodash-es"

defineOptions({
  // 命名当前组件
  name: "DeviceCrud"
})

const loading = ref<boolean>(false)

const { paginationData, handleCurrentChange, handleSizeChange } = usePagination()

// #region 增
const DEFAULT_FORM_DATA: CreateOrUpdateDeviceRequestData = {
  id: undefined,
  name: "",
  type: "",
  status: "active",
  location: ""
}

const dialogVisible = ref<boolean>(false)

const formRef = useTemplateRef("formRef")

const formData = ref<CreateOrUpdateDeviceRequestData>(cloneDeep(DEFAULT_FORM_DATA))

const formRules: FormRules<CreateOrUpdateDeviceRequestData> = {
  name: [{ required: true, trigger: "blur", message: "请输入设备名称" }],
  type: [{ required: true, trigger: "blur", message: "请输入设备类型" }],
  location: [{ required: true, trigger: "blur", message: "请输入设备位置" }]
}

function handleCreateOrUpdate() {
  formRef.value?.validate((valid) => {
    if (!valid) {
      ElMessage.error("表单校验不通过")
      return
    }
    loading.value = true
    const api = formData.value.id === undefined ? createDeviceApi : updateDeviceApi
    api(formData.value).then(() => {
      ElMessage.success("操作成功")
      dialogVisible.value = false
      getDeviceData()
    }).finally(() => {
      loading.value = false
    })
  })
}

function resetForm() {
  formRef.value?.clearValidate()
  formData.value = cloneDeep(DEFAULT_FORM_DATA)
}
// #endregion

// #region 删
function handleDelete(row: DeviceData) {
  ElMessageBox.confirm(`正在删除设备：${row.name}，确认删除？`, "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  }).then(() => {
    deleteDeviceApi(row.id).then(() => {
      ElMessage.success("删除成功")
      getDeviceData()
    })
  })
}
// #endregion

// #region 改
function handleUpdate(row: DeviceData) {
  dialogVisible.value = true
  formData.value = cloneDeep(row)
}
// #endregion

// #region 查
const tableData = ref<DeviceData[]>([])

const searchFormRef = useTemplateRef("searchFormRef")

const searchData = reactive({
  name: "",
  type: "",
  status: ""
})

function getDeviceData() {
  loading.value = true
  getDeviceApi({
    currentPage: paginationData.currentPage,
    size: paginationData.pageSize,
    name: searchData.name,
    type: searchData.type,
    status: searchData.status
  }).then(({ data }) => {
    paginationData.total = data.total
    tableData.value = data.list
  }).catch(() => {
    tableData.value = []
  }).finally(() => {
    loading.value = false
  })
}

function handleSearch() {
  paginationData.currentPage === 1 ? getDeviceData() : (paginationData.currentPage = 1)
}

function resetSearch() {
  searchFormRef.value?.resetFields()
  handleSearch()
}
// #endregion

// 监听分页参数的变化
watch([() => paginationData.currentPage, () => paginationData.pageSize], getDeviceData, { immediate: true })
</script>

<template>
  <div class="app-container">
    <el-alert
      title="数据来源"
      type="success"
      description="由 Apifox 提供在线 Mock，数据不具备真实性，仅供简单的 CRUD 操作演示"
      show-icon
    />
    <el-card v-loading="loading" shadow="never" class="search-wrapper">
      <el-form ref="searchFormRef" :inline="true" :model="searchData">
        <el-form-item prop="name" label="设备名称">
          <el-input v-model="searchData.name" placeholder="请输入" />
        </el-form-item>
        <el-form-item prop="type" label="设备类型">
          <el-input v-model="searchData.type" placeholder="请输入" />
        </el-form-item>
        <el-form-item prop="status" label="状态">
          <el-select v-model="searchData.status" placeholder="请选择">
            <el-option label="启用" value="active" />
            <el-option label="禁用" value="inactive" />
            <el-option label="维护中" value="maintenance" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleSearch">
            查询
          </el-button>
          <el-button :icon="Refresh" @click="resetSearch">
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
    <el-card v-loading="loading" shadow="never">
      <div class="toolbar-wrapper">
        <div>
          <el-button type="primary" :icon="CirclePlus" @click="dialogVisible = true">
            新增设备
          </el-button>
          <el-button type="danger" :icon="Delete">
            批量删除
          </el-button>
        </div>
        <div>
          <el-tooltip content="下载">
            <el-button type="primary" :icon="Download" circle />
          </el-tooltip>
          <el-tooltip content="刷新当前页">
            <el-button type="primary" :icon="RefreshRight" circle @click="getDeviceData" />
          </el-tooltip>
        </div>
      </div>
      <div class="table-wrapper">
        <el-table :data="tableData">
          <el-table-column type="selection" width="50" align="center" />
          <el-table-column prop="name" label="设备名称" align="center" />
          <el-table-column prop="type" label="设备类型" align="center" />
          <el-table-column prop="location" label="位置" align="center" />
          <el-table-column prop="status" label="状态" align="center">
            <template #default="scope">
              <el-tag v-if="scope.row.status === 'active'" type="success" effect="plain" disable-transitions>
                启用
              </el-tag>
              <el-tag v-else-if="scope.row.status === 'inactive'" type="danger" effect="plain" disable-transitions>
                禁用
              </el-tag>
              <el-tag v-else type="warning" effect="plain" disable-transitions>
                维护中
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="createTime" label="创建时间" align="center" />
          <el-table-column fixed="right" label="操作" width="150" align="center">
            <template #default="scope">
              <el-button type="primary" text bg size="small" @click="handleUpdate(scope.row)">
                修改
              </el-button>
              <el-button type="danger" text bg size="small" @click="handleDelete(scope.row)">
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <div class="pager-wrapper">
        <el-pagination
          background
          :layout="paginationData.layout"
          :page-sizes="paginationData.pageSizes"
          :total="paginationData.total"
          :page-size="paginationData.pageSize"
          :current-page="paginationData.currentPage"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
    <!-- 新增/修改 -->
    <el-dialog
      v-model="dialogVisible"
      :title="formData.id === undefined ? '新增设备' : '修改设备'"
      width="30%"
      @closed="resetForm"
    >
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="100px" label-position="left">
        <el-form-item prop="name" label="设备名称">
          <el-input v-model="formData.name" placeholder="请输入" />
        </el-form-item>
        <el-form-item prop="type" label="设备类型">
          <el-input v-model="formData.type" placeholder="请输入" />
        </el-form-item>
        <el-form-item prop="location" label="位置">
          <el-input v-model="formData.location" placeholder="请输入" />
        </el-form-item>
        <el-form-item prop="status" label="状态">
          <el-select v-model="formData.status">
            <el-option label="启用" value="active" />
            <el-option label="禁用" value="inactive" />
            <el-option label="维护中" value="maintenance" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">
          取消
        </el-button>
        <el-button type="primary" :loading="loading" @click="handleCreateOrUpdate">
          确认
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
.el-alert {
  margin-bottom: 20px;
}

.search-wrapper {
  margin-bottom: 20px;
  :deep(.el-card__body) {
    padding-bottom: 2px;
  }
}

.toolbar-wrapper {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.table-wrapper {
  margin-bottom: 20px;
}

.pager-wrapper {
  text-align: center;
}
</style>
