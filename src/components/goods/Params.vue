<template>
  <div>
    <!-- 面包屑区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>参数列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片区域 -->
    <el-card>
      <!-- 头部的区域 -->
      <el-alert title="只允许为第三级分类设置相关的参数！" type="warning" show-icon>
      </el-alert>

      <el-row class="goods_cat">
        <el-col>
          <span>选择商品分类:</span>

          <!-- 级联选择框区域 -->
          <el-cascader v-model="selectCateKeys" :options="catelist" :props="cateProps" @change="cateChange"></el-cascader>
        </el-col>
      </el-row>

      <!-- tabs区域 -->
      <el-tabs v-model="activeName" @tab-click="tabClick">
        <!-- 添加动态参数的面板 -->
        <el-tab-pane label="动态参数" name="many">
          <el-button type="primary" size="mini" :disabled="isBtnDisabled" @click="paramsDialogVisible = true">动态参数</el-button>
          <!-- 动态参数的表格 -->
          <el-table :data="manyTableData" border stripe>
            <el-table-column type="expand">
              <template slot-scope="scope">
                <el-tag v-for="(item, i) in scope.row.attr_vals" :key="i" closable @close="handleClose(i,scope.row)">{{item}}</el-tag>
                <!-- 输入框和按钮切换 -->
                <el-input class="input-new-tag" v-if="scope.row.inputVisible" v-model="scope.row.inputValue" ref="saveTagInput" size="small" @keyup.enter.native="handleInputConfirm(scope.row)" @blur="handleInputConfirm(scope.row)">
                </el-input>
                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
              </template>
            </el-table-column>
            <el-table-column type="index" label="#"></el-table-column>
            <el-table-column label="参数名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button size="mini" type="primary" icon="el-icon-edit" @click="showEditDialog(scope.row.attr_id)">编辑</el-button>
                <el-button size="mini" type="danger" icon="el-icon-delete">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <!-- 添加静态属性的面板 -->
        <el-tab-pane label="静态属性" name="only">
          <el-button type="primary" size="mini" :disabled="isBtnDisabled" @click="paramsDialogVisible = true">静态属性</el-button>
          <!-- 静态属性的表格 -->
          <el-table :data="onlyTableData" border stripe>
            <el-table-column type="expand">
              <template slot-scope="scope">
                <el-tag v-for="(item, i) in scope.row.attr_vals" :key="i" closable @close="handleClose(i,scope.row)">{{item}}</el-tag>
                <!-- 输入框和按钮切换 -->
                <el-input class="input-new-tag" v-if="scope.row.inputVisible" v-model="scope.row.inputValue" ref="saveTagInput" size="small" @keyup.enter.native="handleInputConfirm(scope.row)" @blur="handleInputConfirm(scope.row)">
                </el-input>
                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
              </template>
            </el-table-column>
            <el-table-column type="index" label="#"></el-table-column>
            <el-table-column label="属性名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button size="mini" type="primary" icon="el-icon-edit" @click="showEditDialog(scope.row.attr_id)">编辑</el-button>
                <el-button size="mini" type="danger" icon="el-icon-delete" @click="removeParams(scope.row.attr_id)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 静态属性和动态属性的弹出框 -->
    <el-dialog :title="'添加'+ titleText" :visible.sync="paramsDialogVisible" width="50%" @close="paramsClose">
      <!-- 静态属性和动态属性的表单 -->
      <el-form :model="addFrom" :rules="addFromRules" ref="addFromRef" label-width="100px">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="addFrom.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="paramsDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addParams">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改静态属性和修改动态属性的弹出框 -->
    <el-dialog :title="'修改'+ titleText" :visible.sync="editDialogVisible" width="50%" @close="editClose">
      <!-- 静态属性和动态属性的表单 -->
      <el-form :model="editFrom" :rules="editFromRules" ref="editFromRef" label-width="100px">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="editFrom.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editParams">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 请求的列表数据
      catelist: [],
      // 级联双向绑定的数组
      selectCateKeys: [],
      // 这是级联选择框配置项
      cateProps: {
        expandTrigger: 'hover',
        // 指定选中的那个值
        value: 'cat_id',
        // 指向所看到的值
        label: 'cat_name',
        // 父子节点的嵌套
        children: 'children',
        checkStrictly: true
      },
      // 默认指向的标签
      activeName: 'many',
      // 这是动态的数据
      manyTableData: [],
      // 这是静态的数据
      onlyTableData: [],
      // 这是动态和静态框的显示和隐藏
      paramsDialogVisible: false,
      // 添加参数的对象
      addFrom: {
        attr_name: ''
      },
      // 添加参数对象的验证规则
      addFromRules: {
        attr_name: [{ required: true, message: '请输入活动名称', trigger: 'blur' }]
      },
      // 修改属性对话框的显示和隐藏
      editDialogVisible: false,
      // 修改属性的对象
      editFrom: {
        attr_name: ''
      },
      // 修改属性的验证规则
      editFromRules: {
        attr_name: [{ required: true, message: '请输入活动名称', trigger: 'blur' }]
      }
    }
  },
  created() {
    this.getCateList()
  },
  methods: {
    async getCateList() {
      const { data: res } = await this.$http.get('categories')

      if (res.meta.status !== 200) this.$message.error('获取商品列表失败')
      this.catelist = res.data
    },
    // 当输入框发生变化时触发
    async cateChange() {
      // console.log(this.selectCateKeys)
      if (this.selectCateKeys.length !== 3) {
        this.selectCateKeys = []
        this.manyTableData = []
        this.onlyTableData = []
        return
      }
      // 确定为三级分类
      const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, {
        params: {
          sel: this.activeName
        }
      })

      if (res.meta.status !== 200) return this.$message.error('获取参数列表失败')

      console.log(res.data)
      this.getParamsList()
    },
    // tabs点击标签
    tabClick() {
      console.log(this.activeName)
      this.getParamsList()
    },
    // 获取参数列表的数据
    async getParamsList() {
      const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, { params: { sel: this.activeName } })

      if (res.meta.status !== 200) return this.$message.error('获取参数列表失败')
      console.log(res.data)
      res.data.forEach(item => {
        item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
        item.inputVisible = false
        item.inputValue = ''
      })

      // 判断当前的数据是动态的还是静态
      if (this.activeName === 'many') {
        this.manyTableData = res.data
      } else {
        this.onlyTableData = res.data
      }
    },
    // 当台添加参数关闭时执行的函数
    paramsClose() {
      this.$refs.addFromRef.resetFields()
    },
    // 点击发起添加参数的请求
    addParams() {
      console.log('a')
      this.$refs.addFromRef.validate(async valid => {
        if (!valid) return

        const { data: res } = await this.$http.post(`categories/${this.cateId}/attributes`, { attr_name: this.addFrom.attr_name, attr_sel: this.activeName })
        console.log(res)
        if (res.meta.status !== 201) {
          return this.$message.error('添加参数失败')
        }

        this.$message.success('添加成功')
        this.paramsDialogVisible = false
        this.getParamsList()
      })
    },
    // 关闭时轻功表单格式
    editClose() {
      this.$refs.editFromRef.resetFields()
    },
    editParams() {
      // 发起修改请求
      this.$refs.editFromRef.validate(async valid => {
        if (!valid) return

        const { data: res } = await this.$http.put(`categories/${this.cateId}/attributes/${this.editFrom.attr_id}`, { attr_name: this.editFrom.attr_name, attr_sel: this.activeName })

        if (res.meta.status !== 200) return this.$message.error('修改失败')

        this.$message.success('修改成功')
        this.getParamsList()
        this.editDialogVisible = false
      })
    },
    async showEditDialog(attrid) {
      const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes/${attrid}`, { params: { attr_sel: this.activeName } })
      this.editDialogVisible = true

      if (res.meta.status !== 200) return

      this.editFrom = res.data
    },
    // 删除参数的处理事件
    async removeParams(id) {
      const confirmResult = await this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)

      if (confirmResult !== 'confirm') return this.$message.info('用户取消删除')
      // 执行删除操作
      const { data: res } = await this.$http.delete(`categories/${this.cateId}/attributes/${id}`)
      if (res.meta.status !== 200) return this.$message.error('删除错误')

      this.$message.success('删除成功')
      this.getParamsList()
    },
    // 当按下按钮或者失去焦点时触发
    async handleInputConfirm(row) {
      if (row.inputValue.trim().length === 0) {
        row.inputVisible = false
        row.inputValue = ''
        return
      }
      //  执行下一步操作
      row.attr_vals.push(row.inputValue.trim())
      row.inputValue = ''
      row.inputVisible = false
      this.saveAttrVals(row)
    },
    // 将tab保存到数据库中
    async saveAttrVals(row) {
      const { data: res } = await this.$http.put(`categories/${this.cateId}/attributes/${row.attr_id}`, {
        attr_name: row.attr_name,
        attr_sel: row.attr_sel,
        attr_vals: row.attr_vals.join(' ')
      })
      if (res.meta.status !== 200) return this.$message.error('添加失败')

      this.$message.success('添加成功')
    },
    // 点击按钮显示input输入框
    showInput(row) {
      row.inputVisible = true
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus()
      })
    },
    // 点击删除tab标签
    handleClose(i, row) {
      row.attr_vals.splice(i, 1)
      this.saveAttrVals(row)
    }
  },
  computed: {
    isBtnDisabled() {
      if (this.selectCateKeys.length !== 3) {
        return true
      } else {
        return false
      }
    },
    // 获取分类的id
    cateId() {
      if (this.selectCateKeys.length === 3) {
        return this.selectCateKeys[2]
      } else {
        return null
      }
    },
    //  精动弹出框的标题
    titleText() {
      if (this.activeName === 'many') {
        return '动态参数'
      }
      return '静态属性'
    }
  }
}
</script>

<style lang="less" scoped>
.goods_cat {
  margin: 15px 0;
}

.el-cascader {
  width: 300px;
}

.el-tag {
  margin: 10px;
}

.input-new-tag {
  width: 100px;
}
</style>
