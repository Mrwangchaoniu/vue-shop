<template>
  <div class="home_container">
    <el-container class="home_box">
      <!-- 头部区域 -->
      <el-header>
        <div>
          <img src="../../assets/heima.png" alt="">
          <span>电商管理后台</span>
        </div>
        <el-button type="info" @click="goBack">退出</el-button>
      </el-header>
      <!-- 内容主题区域 -->
      <el-container>
        <!-- 左侧区域 -->

        <el-aside :width="isCollapse ? '64px' : '200px'">
          <div class="open" @click="isClickShow">|||</div>
          <el-menu background-color="#333744" text-color="#fff" active-text-color="#409EFF" unique-opened :collapse="isCollapse" :collapse-transition="false" :router="true">
            <!-- 一级菜单 -->
            <el-submenu :index="item.id + ''" v-for="item in menuList" :key="item.id">
              <!-- 一级菜单的模板区域 -->
              <template slot="title">
                <i :class="iconfontObj[item.id]"></i>
                <span>{{item.authName}}</span>
              </template>

              <!-- 二级菜单 -->
              <el-menu-item :index="subItem.path + ''" v-for="subItem in item.children" :key="subItem.id">
                <!-- 二级菜单的模板区域 -->
                <template slot="title">
                  <i class="el-icon-menu"></i>
                  <span>{{subItem.authName}}</span>
                </template>
              </el-menu-item>
            </el-submenu>
          </el-menu>
        </el-aside>
        <!-- 右侧区域 -->
        <el-main>
          <!-- 路由占位符 -->
          <router-view></router-view>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script>
export default {
  name: 'MyHome',
  data() {
    return {
      menuList: [],
      iconfontObj: {
        125: 'iconfont icon-user',
        103: 'iconfont icon-tijikongjian',
        101: 'iconfont icon-shangpin',
        102: 'iconfont icon-danju',
        145: 'iconfont icon-baobiao'
      },
      // 动态的展示和隐藏侧边栏
      isCollapse: false
    }
  },
  created() {
    this.getMenuList()
  },
  methods: {
    goBack() {
      window.sessionStorage.clear('token')
      this.$router.push('/login')
    },
    async getMenuList() {
      const { data: res } = await this.$http.get('menus')
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.menuList = res.data
      console.log(res)
    },
    isClickShow() {
      this.isCollapse = !this.isCollapse
    }
  }
}
</script>

<style lang="less" scoped>
.home_container {
  height: 100%;
}
.home_box {
  height: 100%;
}

.el-header {
  background-color: #373d41;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-left: 0px;
  > div {
    display: flex;
    align-items: center;
    span {
      color: white;
      font-size: 20px;
      margin-left: 15px;
    }
  }
}

.iconfont {
  margin-right: 10px;
}

.el-aside {
  background-color: #333744;
  .el-menu {
    border-right: none;
  }
  .open {
    background-color: #4a5064;
    color: white;
    text-align: center;
    font-size: 10px;
    line-height: 24px;
    letter-spacing: 0.2em;
    cursor: pointer;
  }
}

.el-main {
  background-color: #eaedf1;
}
</style>
