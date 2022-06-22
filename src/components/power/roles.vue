<template>
  <div>
    <!-- 面包屑区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片区域 -->
    <el-card>
      <el-row>
        <el-col>
          <el-button type="primary" @click="addRoles">添加角色</el-button>
        </el-col>
      </el-row>

      <!-- 角色信息的表 -->
      <el-table :data="rolesList" border stripe>
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-row v-for="(item1,i1) in scope.row.children" :key="item1.id" :class="['qxborder', i1 === 0 ? 'qxbt' : '','alCenter']">
              <!-- 一级权限 -->
              <el-col :span="5">
                <el-tag closable @close="removeTagById(scope.row,item1.id)">{{item1.authName}}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 二级和三级权限 -->
              <el-col :span="19">
                <el-row v-for="(item2,i2) in item1.children" :key="item2.id" :class="[i2 === 0 ? '' : 'qxbt','alCenter']">
                  <!-- 二级权限 -->
                  <el-col :span="6">
                    <el-tag type="success" closable @close="removeTagById(scope.row,item2.id)">{{item2.authName}}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="18">
                    <el-tag type="warning" v-for="item3 in item2.children" :key="item3.id" closable @close="removeTagById(scope.row,item3.id)">{{ item3.authName }}</el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
            <!-- <pre>
              {{scope.row.children}}
           </pre> -->
          </template>
        </el-table-column>
        <!-- 索引列 -->
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column label="操作" width="300px">
          <template slot-scope="scope">
            <!-- 编辑按钮 -->
            <el-button size="mini" type="primary" icon="el-icon-edit" @click="editRolesById(scope.row.id)">编辑</el-button>
            <!-- 删除按钮 -->
            <el-button size="mini" type="danger" icon="el-icon-delete" @click="removeRoles(scope.row.id)">删除</el-button>
            <!-- 分配按钮 -->
            <el-button size="mini" type="warning" icon="el-icon-setting" @click="showSetRightDialog(scope.row)">分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 添加角色的对话框 -->
    <el-dialog title="添加角色" :visible.sync="addRolesVisble" width="50%" @close="resultRolesFrom">
      <!-- 添加角色表单内容 -->
      <el-form :model="rolesForm" :rules="rolesFormRules" ref="rolesFormRef" label-width="100px">
        <el-form-item label="角色名称" prop="rolesname">
          <el-input v-model="rolesForm.rolesname"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="rolesdesc">
          <el-input v-model="rolesForm.rolesdesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addRolesVisble = false">取 消</el-button>
        <el-button type="primary" @click="addRolesInfo">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 编辑按钮的角色对话框 -->

    <el-dialog title="编辑角色" :visible.sync="editDialogVisible" width="50%" @close="resetEditRolesFrom">
      <!-- 编辑用户的表单内容 -->
      <el-form :model="editRolesInfo" :rules="editRolesRules" ref="editRolesRef" label-width="80px">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="editRolesInfo.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleName">
          <el-input v-model="editRolesInfo.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editRolesFrom">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 分配角色的对话框 -->
    <el-dialog title="分配角色" :visible.sync="setRightVisible" width="50%" @close="setRightsDialogClose">
      <!-- 树形内容展示区 -->
      <el-tree :data="setRightList" :props="treeProps" show-checkbox node-key="id" default-expand-all :default-checked-keys="defKeys" ref="treeRef"></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRightVisible = false">取 消</el-button>
        <el-button type="primary" @click="clickSetRoles">确 定</el-button>
      </span>
    </el-dialog>

  </div>
</template>

<script>
export default {
  data() {
    return {
      // 所有的角色列表
      rolesList: [],
      // 添加角色的显示和隐藏
      addRolesVisble: false,
      // 添加角色的信息对象
      rolesForm: {
        rolesname: '',
        rolesdesc: ''
      },
      // 添加对象的验证规则
      rolesFormRules: {
        rolesname: [
          { required: true, message: '请输入角色名称', trigger: 'blur' },
          { min: 2, max: 6, message: '长度在 2 到 6 个字符', trigger: 'blur' }
        ],
        rolesdesc: [
          { required: true, message: '请输入角色描述', trigger: 'blur' },
          { min: 2, max: 12, message: '长度在 2 到 12 个字符', trigger: 'blur' }
        ]
      },
      // 编辑角色对话框显示和隐藏
      editDialogVisible: false,
      // 根据id查询的编辑对象
      editRolesInfo: {},
      // 编辑对象的验证规则
      editRolesRules: {
        roleName: [
          { required: true, message: '请输入角色名称', trigger: 'blur' },
          { min: 2, max: 6, message: '长度在 2 到 6 个字符', trigger: 'blur' }
        ],
        roleDesc: [
          { required: true, message: '请输入角色名称', trigger: 'blur' },
          { min: 2, max: 6, message: '长度在 2 到 6 个字符', trigger: 'blur' }
        ]
      },
      // 分配角色对话框的显示和隐藏
      setRightVisible: false,
      // 树形结构的信息
      setRightList: [],
      // 树形控件的内容指定
      treeProps: {
        label: 'authName',
        children: 'children'
      },
      // 默认勾选的权限
      defKeys: [],
      // 分配角色的id
      roleId: ''
    }
  },
  created() {
    this.getRolesList()
  },
  methods: {
    async getRolesList() {
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) return this.$message.error('用户角色列表获取失败')
      this.rolesList = res.data
      console.log(this.rolesList)
    },
    // 添加角色按钮的事件
    addRoles() {
      this.addRolesVisble = true
    },
    // 关闭对话框重置表单
    resultRolesFrom() {
      this.$refs.rolesFormRef.resetFields()
    },
    // 点击确定对表单预校验并发送添加角色的请求
    addRolesInfo() {
      this.$refs.rolesFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.post('roles', { roleName: this.rolesForm.rolesname, roleDesc: this.rolesForm.rolesdesc })
        console.log(res)
        if (res.meta.status !== 201) return this.$message.error('添加角色信息失败')
        this.$message.success('添加用户信息成功')
        this.getRolesList()
        this.addRolesVisble = false
      })
    },
    // 点击编辑按钮弹出对话框并查询该用户的角色信息
    async editRolesById(id) {
      this.editDialogVisible = true
      const { data: res } = await this.$http.get('roles/' + id)
      if (res.meta.status !== 200) return this.$message.error('获取编辑用户失败')
      this.editRolesInfo = res.data
      console.log(this.editRolesInfo)
    },
    // 点击确定预验证并发送修改请求
    editRolesFrom() {
      this.$refs.editRolesRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.put('roles/' + this.editRolesInfo.roleId, { roleName: this.editRolesInfo.roleName, roleDesc: this.editRolesInfo.roleDesc })
        if (res.meta.status !== 200) return this.$message.error('修改角色失败')
        this.$message.success('修改角色成功')
        this.editDialogVisible = false
        this.getRolesList()
      })
    },
    resetEditRolesFrom() {
      this.$refs.editRolesRef.resetFields()
    },
    async removeRoles(id) {
      const confirmRoles = await this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      console.log(confirmRoles)
      // 点击确定返回 confirm
      // 点击取消返回 cancel
      if (confirmRoles !== 'confirm') return this.$message.info('用户已取消删除')
      // 发起删除请求
      const { data: res } = await this.$http.delete('roles/' + id)
      if (res.meta.status !== 200) return this.$message.error('删除用户失败')
      this.$message.success('删除用户成功')
      this.getRolesList()
    },
    // 根据id删除对应的权限
    async removeTagById(role, right) {
      const confirmTag = await this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)

      if (confirmTag !== 'confirm') return this.$message.info('用户取消删除')

      // 发起删除权限请求
      const { data: res } = await this.$http.delete(`roles/${role.id}/rights/${right}`)
      if (res.meta.status !== 200) return this.$message.error('删除用户失败')
      this.$message.success('删除用户成功')
      role.children = res.data
    },
    // 点击弹出分配角色的对话框
    async showSetRightDialog(role) {
      this.roleId = role.id
      // 获取权限列表
      const { data: res } = await this.$http.get('rights/tree')
      if (res.meta.status !== 200) return this.$message.error('获取树形权限列表失败')
      this.setRightList = res.data
      console.log(this.setRightList)
      this.getLeafKeys(role, this.defKeys)
      this.setRightVisible = true
    },
    // 定义一个递归函数来获取所有三级权限
    getLeafKeys(node, arr) {
      if (!node.children) {
        return arr.push(node.id)
      }
      node.children.forEach(item => this.getLeafKeys(item, arr))
    },
    // 监听关闭时候的对话框
    setRightsDialogClose() {
      this.defKeys = []
    },
    // 点击确定分配角色权限
    async clickSetRoles() {
      // 先拿到已勾选的id和半勾选的id
      const keys = [...this.$refs.treeRef.getCheckedKeys(), this.$refs.treeRef.getHalfCheckedKeys()]

      const keyStr = keys.join(',')

      // 发起角色授权的请求
      const { data: res } = await this.$http.post(`roles/${this.roleId}/rights`, { rids: keyStr })

      if (res.meta.status !== 200) return this.$message.error('分配权限失败')

      this.$message.success('分配权限成功')
      this.setRightVisible = false
      this.getRolesList()
    }
  }
}
</script>

<style lang="less" scoped>
.el-table {
  margin-top: 20px;
}

.el-tag {
  margin: 7px;
  cursor: pointer;
}

.qxborder {
  border-bottom: 1px solid #eee;
}

.qxbt {
  border-top: 1px solid #eee;
}

// 设置一级权限和二级权限剧中
.alCenter {
  display: flex;
  align-items: center;
}
</style>
