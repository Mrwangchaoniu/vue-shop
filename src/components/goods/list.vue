<template>
  <div>
    <!-- 面包屑区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片区域 -->
    <el-card>
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getGoodsList">
            <el-button slot="append" icon="el-icon-search" class="btn" @click="getGoodsList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="gotoAdd">添加商品</el-button>
        </el-col>
      </el-row>

      <!-- 表格区域 -->
      <el-table :data="goodsList" border stripe>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column label="商品名称" prop="goods_name"></el-table-column>
        <el-table-column label="商品价格(元)" prop="goods_price" width="95px"></el-table-column>
        <el-table-column label="商品重量" prop="goods_weight" width="70px"></el-table-column>
        <el-table-column label="创建时间" prop="add_time" width="160px">
          <template slot-scope="scope">
            {{scope.row.add_time | dataFormat}}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="130px">
          <template slot-scope="scope">
            <el-button type="primary" icon="el-icon-edit" size="mini"></el-button>
            <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeById(scope.row.goods_id)"></el-button>
          </template>
        </el-table-column>

      </el-table>

      <!-- 分页器 -->
      <el-pagination @size-change="goodsHandleSizeChange" @current-change="goodsHandleCurrentChange" :current-page="queryInfo.pagenum" :page-sizes="[1, 5, 10, 20]" :page-size="queryInfo.pagesize" layout="total, sizes, prev, pager, next, jumper" :total="total" background>
      </el-pagination>
    </el-card>

  </div>
</template>

<script>
export default {
  data() {
    return {
      // 发起请求定义的参数
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 10
      },
      // 当前的商品数据
      goodsList: [],
      // 数据的总条数
      total: 0
    }
  },
  created() {
    this.getGoodsList()
  },
  methods: {
    // 获取商品列表
    async getGoodsList() {
      const { data: res } = await this.$http.get('goods', { params: this.queryInfo })

      if (res.meta.status !== 200) return this.$message.error('商品列表获取失败')
      console.log(res)
      this.goodsList = res.data.goods
      this.total = res.data.total
    },
    // 每页显示的个数发生变化时
    goodsHandleSizeChange(pageSize) {
      console.log(pageSize)
      this.queryInfo.pagesize = pageSize
      this.getGoodsList()
    },
    // 每页改变时触发
    goodsHandleCurrentChange(pagenum) {
      console.log(pagenum)
      this.queryInfo.pagenum = pagenum
      this.getGoodsList()
    },
    // 删除对应的商品
    async removeById(id) {
      const confirmResult = await this.$confirm('此操作将永久删除该商品, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)

      if (confirmResult !== 'confirm') return this.$message.info('用户取消了删除')

      const { data: res } = await this.$http.delete('goods/' + id)

      if (res.meta.status !== 200) return this.$message.error('用户取消了删除')
      this.$message.success('用户删除成功')
      this.getGoodsList()
    },
    gotoAdd() {
      this.$router.push('/goods/addgoods')
    }
  }
}
</script>

<style lang="less" scoped>
.btn {
  width: 100%;
  height: 30px;
  box-sizing: border-box;
  padding-top: 20px;
}
</style>
