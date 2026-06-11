# MySQL 配置说明

本项目后台数据库名称使用 `mhxx`。服务端会在启动时尝试创建数据库和数据表。

## 1. 创建数据库用户

可以使用已有 MySQL 用户，也可以单独创建项目用户：

```sql
CREATE DATABASE IF NOT EXISTS mhxx DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'mhxx_user'@'localhost' IDENTIFIED BY '请替换为强密码';
GRANT ALL PRIVILEGES ON mhxx.* TO 'mhxx_user'@'localhost';
FLUSH PRIVILEGES;
```

## 2. 环境变量

复制 `.env.example` 为 `.env`，再填写自己的数据库信息：

```env
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=mhxx_user
MYSQL_PASSWORD=请替换为强密码
MYSQL_DATABASE=mhxx
SESSION_SECRET=请替换为随机长字符串
```

不要把 `.env` 提交到仓库，也不要在聊天中暴露真实密码。

## 3. 历史数据说明

用户注册登录后，每次预测会保存到 `predictions` 表。每个用户只能读取、更新、删除自己的预测历史。
