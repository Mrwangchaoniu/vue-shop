<template>
  <div>
    <!-- 面包屑区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片区域 -->
    <el-card class="box-card">

      <!-- 搜索区域 -->
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getUserList">
            <el-button class="btn" slot="append" icon="el-icon-search" @click="getUserList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="5">
          <el-button type="primary" @click="displayDialog">添加用户</el-button>
        </el-col>
      </el-row>

      <!-- 表格区域 -->
      <el-table :data="userList" border stripe>
        <el-table-column label="#" type="index" width="50%">
        </el-table-column>
        <el-table-column label="姓名" prop="username">
        </el-table-column>
        <el-table-column label="邮箱" prop="email">
        </el-table-column>
        <el-table-column label="电话" prop="mobile">
        </el-table-column>
        <el-table-column label="角色" prop="role_name">
        </el-table-column>
        <!-- 状态开关 -->
        <el-table-column label="状态" prop="mg_state">
          <template slot-scope="scope">
            <el-switch v-model="scope.row.mg_state" @change="userStateChange(scope.row)"></el-switch>
          </template>
        </el-table-column>
        <!-- 操作类按钮 -->
        <el-table-column label="操作" width="180">
          <template slot-scope="scope">
            <!-- 这时编辑按钮 -->
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.id)"></el-button>

            <!-- 这是删除按钮 -->
            <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeUserById(scope.row.id)"></el-button>

            <!-- 这时分配角色按钮 -->
            <el-tooltip effect="dark" content="分配角色" placement="top" :enterable="false">
              <el-button type="warning" icon="el-icon-setting" size="mini" @click="showSetRolesDialog(scope.row)"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页显示区域 -->
      <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="queryInfo.pagenum" :page-sizes="[1, 2, 5, 10]" :page-size="queryInfo.pagesize" layout="total, sizes, prev, pager, next, jumper" :total="total">
      </el-pagination>
    </el-card>

    <!-- 点击添加用户展开的对话框 -->
    <el-dialog title="添加用户" :visible.sync="addDialogVisible" width="30%" @close="addDialogClose">

      <!-- 添加用户的表单区域 -->
      <el-form :model="addform" :rules="addformRules" ref="addformRef" label-width="80px">
        <el-form-item label="用户名称" prop="username">
          <el-input v-model="addform.username"></el-input>
        </el-form-item>
        <el-form-item label="用户密码" prop="password">
          <el-input v-model="addform.password" type="password"></el-input>
        </el-form-item>
        <el-form-item label="用户邮箱" prop="email">
          <el-input v-model="addform.email"></el-input>
        </el-form-item>
        <el-form-item label="用户手机" prop="mobile">
          <el-input v-model="addform.mobile"></el-input>
        </el-form-item>
      </el-form>

      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 编辑按钮的对话框 -->
    <el-dialog title="修改用户" :visible.sync="editDialogVisible" width="50%" @close="editDialogClose">

      <!-- 编辑当前用户的表单 -->
      <el-form :model="editFrom" :rules="editFromRules" ref="editFromRef" label-width="80px">
        <el-form-item label="用户名">
          <el-input v-model="editFrom.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editFrom.email"></el-input>
        </el-form-item>
        <el-form-item label="手机号" prop="mobile">
          <el-input v-model="editFrom.mobile"></el-input>
        </el-form-item>
      </el-form>
      <!-- 确定和取消按钮 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editUserinfo">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 分配角色的对话框 -->

    <el-dialog title="分配角色" :visible.sync="setRolesVisble" width="50%" @close="setRolesClose">
      <div>
        <p>用户是：{{rolesInfo.username}}</p>
        <p>角色为：{{rolesInfo.role_name}}</p>
        <p>分配最新角色:</p>
        <el-select v-model="selectRoleId" placeholder="请选择">
          <el-option v-for="item in rolesList" :key="item.id" :label="item.roleName" :value="item.id">
          </el-option>
        </el-select>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRolesVisble = false">取 消</el-button>
        <el-button type="primary" @click="setRoles">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'MyUsers',
  data() {
    //  定义验证邮箱的正则
    const checkEmail = (rules, value, cb) => {
      const regEmail = /^([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+@([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+\.[a-zA-Z]{2,3}$/
      if (regEmail.test(value)) {
        return cb()
      }
      cb(new Error('请输入正确邮箱'))
    }
    // 定义验证手机号正则
    const checkMobile = (rules, value, cb) => {
      const regMobile = /^1(3[0-9]|4[01456879]|5[0-35-9]|6[2567]|7[0-8]|8[0-9]|9[0-35-9])\d{8}$/
      if (regMobile.test(value)) {
        return cb()
      }
      cb(new Error('请输入正确手机号格式'))
    }
    return {
      // 获取用户列表数据的信息对象
      queryInfo: {
        query: '',
        // 当前的页数
        pagenum: 1,
        // 每页展示的数据
        pagesize: 2
      },
      // 用户的数据列表
      userList: [],
      // 数据的总条数
      total: 0,
      // 控制添加用户的显示和隐藏
      addDialogVisible: false,
      // 添加用户的信息对象
      addform: {
        username: '',
        password: '',
        email: '',
        mobile: ''
      },
      // 添加用户的验证规则
      addformRules: {
        username: [
          { required: true, message: '请输入用户名称', trigger: 'blur' },
          { min: 2, max: 6, message: '长度在2到6个字符之间', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入用户密码', trigger: 'blur' },
          { min: 6, max: 15, message: '长度在6到15个字符之间', trigger: 'blur' }
        ],
        email: [
          { required: true, message: '请输入用户邮箱', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '请输入用户手机号', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur' }
        ]
      },
      // 编辑用的关闭和隐藏
      editDialogVisible: false,
      // 编辑用户表单的用户信息对象
      editFrom: {},
      // 编辑用户的验证规则
      editFromRules: {
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur' }
        ]
      },
      // 展示对话框
      setRolesVisble: false,
      // 分配角色展示角色和用户
      rolesInfo: {},
      // 分配角色的列表
      rolesList: [],
      // 选择角色的id
      selectRoleId: ''
    }
  },
  created() {
    this.getUserList()
  },
  methods: {
    async getUserList() {
      const { data: res } = await this.$http.get('users', { params: this.queryInfo })
      if (res.meta.status !== 200) return this.$message.error('用户列表数据请求失败')
      this.userList = res.data.users
      this.total = res.data.total
      console.log(res)
    },
    // 每页显示多少条数据
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getUserList()
    },
    // 当前页
    handleCurrentChange(newPageNum) {
      this.queryInfo.pagenum = newPageNum
      this.getUserList()
    },
    // 修改用户当前的状态
    async userStateChange(userinfo) {
      console.log(userinfo)
      const { data: res } = await this.$http.put(`users/${userinfo.id}/state/${userinfo.mg_state}`)

      if (res.meta.status !== 200) {
        userinfo.mg_state = !userinfo.mg_state
        return this.$message.error('用户状态更新失败')
      }
      this.$message.success('用户状态更新成功')
    },
    // 点击添加用户按钮显示对话框
    displayDialog() {
      this.addDialogVisible = true
    },
    // 添加用户的对话框关闭后执行去除表单的验证功能
    addDialogClose() {
      this.$refs.addformRef.resetFields()
    },
    // 点击确定按钮对表单进行预效验，并发起添加用户请求
    addUser() {
      this.$refs.addformRef.validate(async valid => {
        if (!valid) return
        // 发起添加用户的请求
        const { data: res } = await this.$http.post('users', this.addform)
        // console.log(res)
        if (res.meta.status !== 201) {
          return this.$message.error('添加用户失败')
        }
        this.$message.success('添加用户成功')
        this.getUserList()
        this.addDialogVisible = false
      })
    },
    // 点击编辑按钮显示对话框并并展示出用户的内容
    async showEditDialog(id) {
      const { data: res } = await this.$http.get('users/' + id)
      if (res.meta.status !== 200) return
      this.editFrom = res.data
      this.editDialogVisible = true
    },
    // 编辑用户框关闭事件
    editDialogClose() {
      this.$refs.editFromRef.resetFields()
    },
    // 对编辑用户表单进行验证，并提交
    editUserinfo() {
      this.$refs.editFromRef.validate(async valid => {
        if (!valid) return
        // 提交修改的数据
        const { data: res } = await this.$http.put(`users/${this.editFrom.id}`, { email: this.editFrom.email, mobile: this.editFrom.mobile })
        if (res.meta.status !== 200) return this.$message.error('用户信息修改失败')
        this.$message.success('用户信息修改成功')
        this.getUserList()
        this.editDialogVisible = false
      })
    },
    // 根据用户的id删除对应的用户信息
    async removeUserById(id) {
      const confirmResult = await this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      // 如果用户点击了确定，会返回confirm
      // 如果用户点击了取消，会返回cancel
      if (confirmResult !== 'confirm') return this.$message.info('已取消删除')
      // 发起删除用户的请求
      const { data: res } = await this.$http.delete('users/' + id)
      if (res.meta.status !== 200) return this.$message.error('用户删除失败')
      this.$message.success('用户删除成功')
      this.getUserList()
    },
    // 点击分配按钮弹出对话框
    async showSetRolesDialog(role) {
      this.setRolesVisble = true
      console.log(role)
      this.rolesInfo = role
      // 获取角色列表
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) return this.$message.error('获取角色列表失败')

      this.rolesList = res.data
    },
    // 发送更改用户角色的请求
    async setRoles() {
      const { data: res } = await this.$http.put(`users/${this.rolesInfo.id}/role`, { rid: this.selectRoleId })

      if (res.meta.status !== 200) return this.$message.error('修改角色失败')

      this.$message.success('修改状态成功')
      this.getUserList()
      this.setRolesVisble = false
    },
    // 当分配角色的对话框关闭时
    setRolesClose() {
      this.selectRoleId = ''
      this.rolesInfo = {}
    }
  }
}
</script>

<style lang="less" scoped>
.el-breadcrumb {
  font-size: 12px;
  margin-bottom: 15px;
}

.el-card {
  box-shadow: 0 0 0.15 rgb(0, 0, 0, 0.15) !important;
}

.el-table {
  margin-top: 15px;
  font-size: 12px;
}

.el-pagination {
  margin-top: 15px;
  text-align: center;
}
</style>
