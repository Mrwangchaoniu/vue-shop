<template>
  <div class="login-container">
    <div class="login-box">
      <div class="logo-box">
        <img src="../../assets/logo.png" alt="">
      </div>
      <!-- 表单内容 -->
      <el-form class="abc" :model="loginFrom" :rules="loginFromRules" ref="loginRef" label-width="0px">
        <!--账号区域 -->
        <el-form-item prop="username">
          <el-input v-model="loginFrom.username" placeholder="请输入账号" prefix-icon="el-icon-user-solid">
          </el-input>
        </el-form-item>
        <!-- 密码区域 -->
        <el-form-item prop="password">
          <el-input type="password" v-model="loginFrom.password" placeholder="请输入密码" prefix-icon="el-icon-s-cooperation">
          </el-input>
        </el-form-item>
        <!-- 登录按钮区域 -->
        <el-form-item class="btn">
          <el-button type="primary" size="samll" @click="login">登录</el-button>
          <el-button type="info" size="samll" @click="resetLoginFrom">重置</el-button>
        </el-form-item>
      </el-form>

    </div>
  </div>
</template>

<script>
export default {
  name: 'MyLogin',
  data() {
    return {
      // 用户名的账号密码
      loginFrom: {
        username: 'admin',
        password: '123456'
      },
      // 表单的验证规则
      loginFromRules: {
        // 用户名称的验证规则
        username: [
          { required: true, message: '请输入用户名称', trigger: 'blur' },
          { min: 3, max: 8, message: '长度在 3 到 8 个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入用户名称', trigger: 'blur' },
          { min: 6, max: 12, message: '长度在 6 到 12 个字符', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    // 重置表单的事件
    resetLoginFrom() {
      this.$refs.loginRef.resetFields()
    },
    // 点击登录对表单进行预效验
    login() {
      this.$refs.loginRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.post('login', this.loginFrom)
        console.log(res)
        if (res.meta.status !== 200) return this.$message.error('登录失败')
        // 登录成功
        this.$message.success('登录成功')
        // 将服务器返回token存储到sessionStotage中
        // console.log(res)
        window.sessionStorage.setItem('token', res.data.token)
        // 通过编程试导航跳转到后台主页
        this.$router.push('/home')
      })
    }
  }
}
</script>

<style lang="less" scoped>
.login-container {
  height: 100%;
  background-color: #2b4b6b;
  display: flex;
  justify-content: center;
  align-items: center;
  .login-box {
    width: 450px;
    height: 300px;
    background-color: white;
    border-radius: 5px;
    display: flex;
    flex-direction: column;
    align-items: center;
    // justify-content: flex-end;
    // justify-content: space-between;
    justify-content: space-around;
    .abc {
      transform: translate(0px, -25px) !important;
      // margin-top: -50px;
    }
    .logo-box {
      width: 130px;
      height: 130px;
      border-radius: 50%;
      padding: 10px;
      background-color: white;
      border: 1px solid #eee;
      transform: translate(0, -40%);
      box-shadow: 0 0 10px 5px rgba(0, 0, 0, 0.2);
      img {
        width: 100%;
        height: 100%;
        border-radius: 50%;
        background-color: #eee;
      }
    }
  }
  .el-form {
    width: 100%;
    // height: 100%;
    // margin-top: 0px;
    padding: 0 20px;
    box-sizing: border-box;
  }
  .btn {
    display: flex;
    justify-content: flex-end;
    margin-top: -15px;
  }
}
</style>
