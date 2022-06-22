<template>
  <div>
    <!-- 面包屑区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片区域 -->
    <el-card>

      <!-- 添加分类区域 -->
      <el-row>
        <el-col>
          <el-button type="primary" @click="showAddCateDialog">添加分类</el-button>
        </el-col>
      </el-row>

      <!--分类表格  -->
      <tree-table :data="cateList" :columns="columns" :show-index="true" index-text="#" border :selection-type="false" :expand-type="false" :show-row-hover="false">
        <template slot="isOk" slot-scope="scope">
          <i class="el-icon-success" style="color: lightgreen" v-if="scope.row.cat_deleted === true"></i>
          <i class="el-icon-error" style="color: red" v-else></i>
        </template>

        <!-- 排序插槽 -->
        <template slot="isSort" slot-scope="scope">

          <el-tag size="mini" v-if="scope.row.cat_pid === 0">一级</el-tag>
          <el-tag type="success" size="mini" v-else-if="scope.row.cat_pid === 1">二级</el-tag>
          <el-tag type="warning" size="mini" v-else>三级</el-tag>
        </template>

        <!-- 按钮插槽 -->
        <template slot="operation">
          <el-button type="primary" icon="el-icon-edit" size="mini">编辑</el-button>
          <el-button type="danger" icon="el-icon-delete" size="mini">删除</el-button>
        </template>
      </tree-table>

      <!-- 分页区域 -->
      <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="this.queryinfo.pagenum" :page-sizes="[1, 3, 5, 10]" :page-size="this.queryinfo.pagesize" layout="total, sizes, prev, pager, next, jumper" :total="total">
      </el-pagination>
    </el-card>

    <!-- 点击添加按钮展开的对话框 -->
    <el-dialog title="添加分类" :visible.sync="addCateDialogVisible" width="50%" @close="addCateDialogClosed">
      <!-- 添加分类中的表单 -->
      <el-form :model="addCateForm" :rules="addCateFormRules" ref="addCateFormRef" label-width="100px">
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类">
          <!-- 级联选择器的区域 -->
          <el-cascader v-model="parentCateValue" :options="parentCateList" :props="parentCateProps" @change="parentCateChange" clearabl></el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCate">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 请求参数
      queryinfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5
      },
      // 商品列表的所有数据
      cateList: [],
      // 数据的总条数
      total: 0,
      // 指定每列的数据
      columns: [
        {
          label: '分类名称',
          prop: 'cat_name'
        },
        {
          label: '是否有效',
          type: 'template',
          template: 'isOk'
        },
        {
          label: '排序',
          type: 'template',
          template: 'isSort'
        },
        {
          abel: '排序',
          type: 'template',
          template: 'operation'
        }
      ],
      // 控制添加分类对画框的显示和隐藏
      addCateDialogVisible: false,
      // 添加分类的信息对象
      addCateForm: {
        cat_name: '',
        // 分类的父id
        cat_pid: 0,
        // 分类的等级
        cat_level: 0
      },
      // 添加分类中的验证规则
      addCateFormRules: {
        cat_name: [{ required: true, message: '请输入分类名称', trigger: 'blur' }]
      },
      // 父类列表中的数据
      parentCateList: [],
      // 指定绑定的当前项
      parentCateValue: [],
      // 级联选择器的配置选型
      parentCateProps: {
        expandTrigger: 'hover',
        // 指定选项的值为选项对象的某个属性值
        value: 'cat_id',
        // 指定选项标签为选项对象的某个属性值
        label: 'cat_name',
        // 指定选项的子选项为选项对象的某个属性值
        children: 'children',
        checkStrictly: true
        // emitPath: false
      }
    }
  },
  created() {
    this.getCateList()
  },
  methods: {
    async getCateList() {
      const { data: res } = await this.$http.get('categories', { params: this.queryinfo })

      if (res.meta.status !== 200) return this.$message.error('获取商品列表失败')

      this.cateList = res.data.result
      this.total = res.data.total
    },
    // 获取到最新的条数据
    handleSizeChange(newSize) {
      this.queryinfo.pagesize = newSize
      this.getCateList()
    },
    // 获取当前页码值
    handleCurrentChange(newPage) {
      this.queryinfo.pagenum = newPage
      this.getCateList()
    },
    // 点击添加分类按钮的事件
    showAddCateDialog() {
      this.getParentCateList()
      this.addCateDialogVisible = true
    },
    // 获取父级分类列表数据
    async getParentCateList() {
      const { data: res } = await this.$http('categories', {
        params: {
          type: 2
        }
      })

      if (res.meta.status !== 200) return this.$message.error('获取父级分类列表失败')
      console.log(res.data)
      this.parentCateList = res.data
    },
    // 当输入框的值发生变化时触发事件
    parentCateChange() {
      console.log(this.parentCateValue)
      if (this.parentCateValue.length > 0) {
        this.addCateForm.cat_pid = this.parentCateValue[this.parentCateValue - 1]

        this.addCateForm.cat_level = this.parentCateValue.length
        return
      } else {
        this.addCateForm.cat_pid = 0
        this.addCateForm.cat_level = 0
      }
    },
    // 点击添加分类确定按钮
    addCate() {
      console.log(this.addCateForm)
      this.$refs.addCateFormRef.validate(async valid => {
        if (!valid) return

        const { data: res } = await this.$http.post('categories', this.addCateForm)

        if (res.meta.status !== 201) return this.$message.error('添加分类失败')

        this.$message.success('添加分类成功')
        this.getCateList()
        this.addCateDialogVisible = false
      })
    },
    // 关闭触发的事件
    addCateDialogClosed() {
      this.$refs.addCateFormRef.resetFields()
      this.parentCateValue = []
      this.addCateForm.cat_level = 0
      this.addCateForm.cat_pid = 0
    }
  }
}
</script>

<style lang="less" scoepd>
.el-button {
  margin-bottom: 15px !important;
}

.el-cascader {
  width: 100%;
}

.el-cascader-panel .el-radio {
  width: 100%;
  height: 100%;
  z-index: 10;
  position: absolute;
  top: 10px;
  right: 10px;
}
.el-cascader-panel .el-radio__input {
  visibility: hidden !important;
}
.el-cascader-panel .el-cascader-node__postfix {
  top: 10px;
}
</style>
