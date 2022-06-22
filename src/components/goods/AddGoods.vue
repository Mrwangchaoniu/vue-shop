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
      <!-- 提示区域 -->
      <el-alert title="消息提示的文案" type="info" center show-icon>
      </el-alert>

      <!-- 步骤条 -->
      <el-steps :space="200" :active="activeIndex - 0" finish-status="success" align-center>
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>

      <!-- tabs渲染 -->
      <el-form :model="addForm" :rules="addFormrules" ref="addFormRef" label-width="100px" label-position='top'>
        <el-tabs v-model="activeIndex" :tab-position="'left'" :before-leave="beforeTabLeave" @tab-click="tabClicked">
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input v-model="addForm.goods_price" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input v-model="addForm.goods_weight" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_price">
              <el-input v-model="addForm.goods_number" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品分类" prop="goods_cat">
              <el-cascader v-model="addForm.goods_cat" :options="catelist" :props="cateProps" @change="handleChange"></el-cascader>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品参数" name="1">
            <!-- 表单的item项 -->
            <el-form-item :label="item.attr_name" v-for="item in manyTableData" :key="item.attr_id">
              <!-- 复选框区域 -->
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox :label="cb" v-for="(cb, i) in item.attr_vals" :key="i" border></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name="2">
            <el-form-item :label="item.attr_name" v-for="item in onlyTableData" :key="item.attr_id">
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="3">
            <el-upload :action="uploadHttp" :on-preview="handlePreview" :on-remove="handleRemove" list-type="picture" :headers="headersObj" :on-success="handleSuccess">
              <el-button size="small" type="primary">点击上传</el-button>

            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">

            <quill-editor v-model="addForm.goods_introduce"></quill-editor>

            <el-row>
              <el-col>
                <el-button type="primary" @click="quillCate" class="btnAdd">添加商品</el-button>
              </el-col>
            </el-row>
          </el-tab-pane>

        </el-tabs>

      </el-form>

      <!--  图片预览 -->
      <el-dialog title="图片预览" :visible.sync="previewVisible" width="50%">

        <img :src="previewImg" alt="" class="previewimg">
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
import _ from 'lodash'

export default {
  data() {
    return {
      activeIndex: '0',
      // 添加对象的表单
      addForm: {
        goods_name: '',
        goods_price: 0,
        goods_weight: 0,
        goods_number: 0,
        // 商品所属的分类数组
        goods_cat: [],
        // 图片的数组
        pics: [],
        goods_introduce: '',
        attrs: []
      },
      // 表单对象的验证规则
      addFormrules: {
        goods_name: [{ required: true, message: '请输入活动名称', trigger: 'blur' }],
        goods_price: [{ required: true, message: '请输入活动名称', trigger: 'blur' }],
        goods_weight: [{ required: true, message: '请输入活动名称', trigger: 'blur' }],
        goods_number: [{ required: true, message: '请输入活动名称', trigger: 'blur' }],
        goods_cat: [{ required: true, message: '请输入活动名称', trigger: 'blur' }]
      },
      // 分类列表数据
      catelist: [],
      cateProps: {
        expandTrigger: 'hover',
        label: 'cat_name',
        value: 'cat_id',
        children: 'children'
      },
      // 动态参数
      manyTableData: [],
      // 静态参数
      onlyTableData: [],
      // 图片上传的服务器
      uploadHttp: 'http://127.0.0.1:8888/api/private/v1/upload',
      // 上传图片时的token
      headersObj: {
        Authorization: window.sessionStorage.getItem('token')
      },
      // 图片预览的显示和隐藏
      previewVisible: false,
      previewImg: ''
    }
  },
  created() {
    this.getCateList()
  },
  computed: {
    cateId() {
      if (this.addForm.goods_cat.length === 3) {
        return this.addForm.goods_cat[2]
      }
      return false
    }
  },
  methods: {
    async getCateList() {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) return this.$message.error('获取分类列表错误')
      this.catelist = res.data
    },
    // 级联选择器选中发生变化触发
    handleChange() {
      if (this.addForm.goods_cat.length !== 3) {
        this.addForm.goods_cat = []
      }
    },
    // 监听切换的标签
    beforeTabLeave(activeName, oldActiveName) {
      if (oldActiveName === '0' && this.addForm.goods_cat.length !== 3) {
        this.$message.error('请选择分类')
        return false
      }
    },
    // 获取动态参数的事件
    async tabClicked() {
      if (this.activeIndex === '1') {
        const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, { params: { sel: 'many' } })
        if (res.meta.status !== 200) return this.$message.error('商品参数获取失败')
        res.data.forEach(item => {
          item.attr_vals = item.attr_vals.length === 0 ? [] : item.attr_vals.split(' ')
        })
        this.manyTableData = res.data
        console.log(this.manyTableData)
      } else if (this.activeIndex === '2') {
        const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, { params: { sel: 'only' } })

        if (res.meta.status !== 200) return this.$message.error('获取属性失败')

        console.log(res.data)
        this.onlyTableData = res.data
      }
    },
    // 处理图片的预览效果
    handlePreview(file) {
      console.log(file)
      this.previewImg = file.response.data.url
      this.previewVisible = true
    },
    // 移除图片的效果
    handleRemove(file) {
      console.log(file)
      // 1拿到服务器上的临时路径
      const filePath = file.response.data.tmp_path
      // 2 根据临时路径拿到当前数组中的索引
      const i = this.addForm.pics.findIndex(x => {
        return x.pic === filePath
      })
      // 3 根据索引删除数组中的值
      this.addForm.pics.splice(i, 1)
      console.log(this.addForm.pics)
    },
    // 监听图片上传成功的事件
    handleSuccess(response) {
      console.log(response)
      const responseObj = {
        pic: response.data.tmp_path
      }
      this.addForm.pics.push(responseObj)
      console.log(this.addForm.pics)
    },
    quillCate() {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) {
          return this.$message.error('请将必要的表单填写完整')
        }
        const from = _.cloneDeep(this.addForm)
        from.goods_cat = from.goods_cat.join(',')

        // 处理动态参数的数据
        this.manyTableData.forEach(item => {
          const newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals.join(' ')
          }
          this.addForm.attrs.push(newInfo)
        })
        console.log(valid)
        // 处理静态数据
        this.onlyTableData.forEach(item => {
          const newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals
          }
          this.addForm.attrs.push(newInfo)
        })
        from.attrs = this.addForm.attrs
        // 发起添加商品的请求
        const { data: res } = await this.$http.post('goods', from)
        if (res.meta.status !== 201) return this.$message.error('商品添加失败')
        this.$message.success('商品添加成功')
        this.$router.push('goods')
      })
    }
  }
}
</script>

<style lang="less" scoped>
.el-cascader {
  width: 200px;
}

.el-checkbox {
  margin: 0 10px 0 0 !important;
}

.previewimg {
  width: 100%;
  height: 100%;
}
.btnAdd {
  margin-top: 50px;
}
</style>
