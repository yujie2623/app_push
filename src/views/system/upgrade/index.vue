<template>
  <div class="dashboard-container">
    <div class="page-server">
      <div class="page-server-fl">
        <el-select v-model="listQuery.uid" clearable :placeholder="$t('upgradePage.selectUpgrade')" style="width: 100%;margin-right: 20px;">
          <el-option
            v-for="item in upgradetype"
            :key="item.uid"
            :label="item.name"
            :value="item.uid"
          />
        </el-select>
        <el-input v-model="listQuery.key" clearable :placeholder="$t('upgradePage.enterUpgrade')" />
        <el-button type="primary" size="small" @click.native="getUpgradeList">{{ $t('search') }}</el-button>
      </div>
      <div class="page-server-fr">
        <el-button type="primary" size="small" @click.native="add({}, 'add')">{{ $t('add') }}</el-button>
        <el-button type="primary" size="small" @click.native="del()">{{ $t('del') }}</el-button>
      </div>
    </div>
    <div class="loglist">
      <el-table ref="upgraderef" :data="slice" max-height="500" border style="width: 100%" @selection-change="handleSelectionChange" @cell-click="cellClick">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column prop="t_name" :label="$t('upgradePage.upgradetype')" min-width="100" align="center" />
        <el-table-column prop="name" :label="$t('upgradePage.upgradeName')" min-width="100" align="center" />
        <el-table-column prop="version" :label="$t('upgradePage.ver')" min-width="100" align="center" />
        <el-table-column prop="opt_time" :label="$t('upgradePage.uploadTime')" min-width="100" align="center" />
        <el-table-column prop="remarks" :label="$t('upgradePage.uploadDesc')" min-width="100" align="center" />
        <el-table-column prop="is_public" :label="$t('upgradePage.uploadStatus')" min-width="100" align="center">
          <template slot-scope="scope">
            <span v-if="scope.row.is_public === true">是</span>
            <span v-else>否</span>
          </template>
        </el-table-column>
        <el-table-column fixed="right" :label="$t('operation')" align="center" min-width="120">
          <template slot-scope="scope">
            <el-button type="text" size="small" @click.native="add(scope.row, 'edit')">{{ $t('edit') }}</el-button>
            <el-button v-if="scope.row.is_public === false" type="text" size="small" @click.native="ispublicfile(scope.row, 1)">{{ $t('upgradePage.publish') }}</el-button>
            <el-button v-else type="text" size="small" @click.native="ispublicfile(scope.row, 0)">{{ $t('upgradePage.cancelPublic') }}</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <!-- 分页 -->
    <div v-if="items.length" class="pagination-container fr">
      <el-pagination
        :current-page.sync="listQuery.pageNo"
        layout="total, sizes, prev, pager, next, jumper"
        :total="items.length"
        :page-sizes="[10,20,50,100]"
        :page-size="listQuery.pageSize"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
    <!-- 添加编辑弹框 -->
    <el-dialog :title="addEditTit" :visible.sync="addEditDialog" :close-on-click-modal="false" custom-class="dialogCss" width="800px">
      <el-form ref="ruleForm" :model="addEditForm" :rules="rules" label-width="100px">
        <el-form-item label="升级包名称" prop="name">
          <el-input v-model="addEditForm.name" autocomplete="off" />
        </el-form-item>
        <el-form-item label="升级包类别" prop="client_uid">
          <el-select v-model="addEditForm.client_uid" placeholder="请选择升级包类别" style="width:100%">
            <el-option v-for="item in upgradetype" :key="item.uid" :label="item.name" :value="item.uid" />
          </el-select>
        </el-form-item>
        <el-form-item v-if="addEditTit === '添加升级包'" label="升级包" prop="file_path">
          <el-upload
            ref="uploadref"
            class="upload-demo"
            :action="fileurl"
            :on-remove="handleRemove"
            :on-success="handSuccess"
            :before-upload="beforeAvatarUpload"
            multiple
            :limit="1"
            :file-list="fileList"
          >
            <el-button size="small" type="primary">选择上传文件</el-button>
          </el-upload>
        </el-form-item>
        <el-form-item v-if="addEditTit === '添加升级包'" label="是否发布" prop="is_public">
          <el-switch v-model="addEditForm.is_public" />
        </el-form-item>
        <el-form-item label="版本号" prop="version">
          <el-input v-model="addEditForm.version" autocomplete="off" />
        </el-form-item>
        <el-form-item label="更新说明" prop="remarks">
          <el-input v-model="addEditForm.remarks" autocomplete="off" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="addEditDialog = false">取 消</el-button>
        <el-button type="primary" @click="sureAdd">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import * as upgrade from '@/api/upgrade'
import { verson } from '@/utils/validate'
export default {
  data() {
    const varson = (rule, value, callback) => {
      if (!value) {
        callback(new Error('请输入版本号'))
      } else {
        if (!verson(value)) {
          callback(new Error('请输入正确的版本号'))
        }
        callback()
      }
      callback()
    }
    const validateNull = (rule, value, callback) => {
      if (!value) {
        callback(new Error('请选择升级包'))
      }
      callback()
    }
    return {
      // 分页
      slice: [],
      items: [],
      listQuery: {
        pageNo: 1,
        pageSize: 10,
        uid: '',
        key: ''
      },
      multipleSelection: [],
      // 终端类型
      upgradetype: [],
      // 上传升级包
      fileurl: process.env.VUE_APP_BASE_API + '/upgrade/upload_upgrade', // process.env.VUE_APP_BASE_API
      fileList: [],
      // 添加编辑
      addEditDialog: false,
      addEditTit: '添加升级包',
      addEditForm: {
        name: '',
        client_uid: '',
        is_public: false,
        version: '',
        remarks: '',
        file_path: ''
      },
      rules: {
        name: [
          { required: true, message: '请输入升级包名称', trigger: 'blur' }
        ],
        client_uid: [
          { required: true, message: '请选择升级包类别', trigger: 'change' }
        ],
        is_public: [
          { required: true, message: '请选择是否发布', trigger: 'change' }
        ],
        version: [
          { required: true, validator: varson, trigger: 'blur' }
        ],
        file_path: [
          { required: true, message: '请选择升级包', trigger: 'change', validator: validateNull }
        ],
        remarks: [
          { message: '请输入更新说明', trigger: 'blur' },
          { min: 0, max: 200, message: '更新说明不超过200字符', trigger: 'blur' }
        ]
      }
    }
  },
  mounted() {
    this.getUpgradeList()
    this.get_all_clinet_type()
  },
  methods: {
    // 获取终端类型
    get_all_clinet_type() {
      upgrade.get_all_clinet_type().then(res => {
        if (res.code === 0) {
          this.upgradetype = res.list
        }
      })
    },
    // 表格全选及点击行选中
    handleSelectionChange(row, selected) {
      this.multipleSelection = row
    },
    cellClick(row, column, cell, event) {
      if (column.label === this.$t('operation') || column.type === 'selection') return
      this.$refs.upgraderef.toggleRowSelection(row)
    },
    // 分页操作
    handleSizeChange(v) {
      this.listQuery.pageSize = v
      this.slice = this.items.slice((this.listQuery.pageNo - 1) * this.listQuery.pageSize, this.listQuery.pageNo * this.listQuery.pageSize)
    },
    handleCurrentChange(v) {
      this.listQuery.pageNo = v
      this.slice = this.items.slice((this.listQuery.pageNo - 1) * this.listQuery.pageSize, this.listQuery.pageNo * this.listQuery.pageSize)
    },
    // 上传所用的方法
    handSuccess(file) {
      if (file.code === 0) {
        this.addEditForm.file_path = file.file_path
      } else {
        this.$message.error('请上传正确的升级包')
      }
      if (this.addEditForm.file_path !== '') {
        this.$refs.ruleForm.clearValidate('file_path')
      }
    },
    handleRemove(file, fileList) {
      this.addEditForm.file_path = ''
    },
    // 上传格式判断
    beforeAvatarUpload(file) {
      var testmsg = file.name.substring(file.name.lastIndexOf('.') + 1)
      const extension = (testmsg === 'zip' || testmsg === 'deb')
      if (!extension) {
        this.$message({
          message: this.$t('升级包仅支持zip，deb格式'),
          type: 'warning'
        })
      }
      return extension
    },
    // 获取页面list
    getUpgradeList() {
      // 后台不能根据key查询到列表 必须带有uid  做个判断
      if (this.listQuery.key !== '') {
        if (this.listQuery.uid === '') {
          this.$message.error('请选择升级包类型')
          return
        }
      }
      var q = Object.assign({}, this.listQuery)
      upgrade.get_all_pack(q).then(res => {
        if (res.code === 0) {
          this.items = res.list
          this.slice = this.items.slice((this.listQuery.pageNo - 1) * this.listQuery.pageSize, this.listQuery.pageNo * this.listQuery.pageSize)
        }
      })
    },
    // 添加编辑
    add(data, obj) {
      this.addEditDialog = true
      if (this.$refs.ruleForm !== undefined) {
        this.$refs.ruleForm.resetFields()
      }
      if (this.$refs.uploadref !== undefined) {
        this.$refs.uploadref.clearFiles()
      }
      if (obj === 'edit') {
        this.addEditTit = '编辑升级包'
        this.addEditForm.name = data.name
        this.addEditForm.client_uid = data.t_uid
        this.addEditForm.version = data.version
        this.addEditForm.remarks = data.remarks
        this.addEditForm.id = data.id
      } else {
        this.addEditTit = '添加升级包'
        Object.keys(this.addEditForm).forEach(ele => { this.addEditForm[ele] = '' })
        // this.addEditForm.name = ''
        // this.addEditForm.client_uid = ''
        // this.addEditForm.version = ''
        this.addEditForm.is_public = false
        // this.addEditForm.remarks = ''
        // this.addEditForm.file_path = ''
      }
    },
    sureAdd() {
      let api
      if (this.addEditTit === '添加升级包') {
        api = upgrade.addUpgrade
      } else {
        api = upgrade.editUpgrade
      }
      this.$refs.ruleForm.validate((valid) => {
        if (valid) {
          api(this.addEditForm).then(res => {
            if (res.code === 0) {
              // this.$message.success('操作完成')
              if (this.addEditTit === '添加升级包') {
                this.$message.success('添加升级包成功')
              } else {
                this.$message.success('编辑升级包成功')
              }
              this.addEditDialog = false
              this.getUpgradeList()
            } else {
              this.$message.error(res.msg)
            }
          })
        }
      })
    },
    // 发布1，取消发布0
    ispublicfile(data, v) {
      let tit = ''
      let title = ''
      if (v === 0) {
        tit = '是否取消发布？'
        title = '点击确定按钮时，将取消发布您选择的升级包'
      } else {
        tit = '是否发布升级包？'
        title = '点击确定按钮时，将发布您选择的升级包'
      }
      this.$confirm(title, tit, {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        upgrade.ispublic({ 'is_public': v, 'id': data.id }).then(res => {
          if (res.code === 0) {
            // this.$message.success('操作完成')
            if (v === 0) {
              this.$message.success('取消发布成功')
            } else {
              this.$message.success('发布成功')
            }
            this.getUpgradeList()
          } else {
            this.$message.error(res.msg)
            this.getUpgradeList()
          }
        })
      }).catch(() => {})
    },
    // 删除
    del() {
      const id_list = []
      if (this.multipleSelection.length <= 0) {
        this.$message.error('请选择要删除的升级包')
        return
      }
      for (const i of this.multipleSelection) {
        id_list.push(i.id)
      }
      this.$confirm('点击确定按钮时，将删除您选择的升级包', '是否删除升级包？', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        upgrade.del({ id_list }).then(res => {
          if (res.code === 0) {
            this.$message.success('删除升级包成功')
            this.getUpgradeList()
          } else {
            this.$message.error(res.msg)
          }
        })
      }).catch(() => {})
    }
  }
}
</script>
<style lang="scss" scoped>
  .loglist {
    padding: 20px;
  }
  .page {
    text-align: right;
    padding-right: 20px;
  }
</style>
