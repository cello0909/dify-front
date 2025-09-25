# Docker 镜像制作与部署指南

## 概述

本项目提供两种Docker构建方式：
- **Dockerfile_allinone**: 完整的All-in-One镜像（推荐）
- **Dockerfile**: 仅前端静态文件镜像

## 快速开始

### 1. 环境准备

确保已安装：
- Docker 20.10+
- Docker Compose 2.0+

### 2. 配置环境变量

```bash
# 复制环境变量配置文件
cp .env.example .env

# 编辑配置文件，设置你的域名和API地址
nano .env
```

关键配置项：
```bash
# React App API配置
PUBLIC_APP_API_BASE=http://your-domain.com/api/client
PUBLIC_DIFY_PROXY_API_BASE=http://your-domain.com/api/client/dify

# 数据库配置
DATABASE_URL=postgresql://username:password@host:port/database
NEXTAUTH_SECRET=your-secret-key-here
```

## 构建方式

### 方式一：使用 Dockerfile_allinone（推荐）

包含完整的Node.js后端 + Nginx前端，支持运行时环境变量注入。

```bash
# 构建镜像
docker build -f Dockerfile_allinone -t dify-chat:latest .

# 或者使用BuildKit加速构建
DOCKER_BUILDKIT=1 docker build -f Dockerfile_allinone -t dify-chat:latest .
```

## 运行容器

### 直接运行

```bash
docker run -d \
  --name dify-chat \
  -p 80:80 \
  -p 443:443 \
  -e PUBLIC_APP_API_BASE=http://your-domain.com/api/client \
  -e PUBLIC_DIFY_PROXY_API_BASE=http://your-domain.com/api/client/dify \
  -e DATABASE_URL=postgresql://user:pass@host:port/db \
  -e NEXTAUTH_SECRET=your-secret-key \
  dify-chat:latest
```

### 使用 docker-compose

```bash
cd docker
docker-compose up -d
```

## 验证部署

```bash
# 查看容器状态
docker ps | grep dify-chat

# 查看日志
docker logs dify-chat

# 健康检查
curl http://localhost/chat/index.html
curl http://localhost:5300/

# 查看PM2进程状态
docker exec dify-chat pm2 status
```

## 环境变量配置

### 运行时环境变量支持

容器启动时支持以下环境变量，会自动注入到前端应用中：

#### React App 配置
- `PUBLIC_APP_API_BASE`: 应用API基础路径
- `PUBLIC_DIFY_PROXY_API_BASE`: Dify代理API基础路径
- `PUBLIC_DEBUG_MODE`: 调试模式开关

#### 后端配置
- `NODE_ENV`: Node.js环境（默认：production）
- `PORT`: 后端端口（默认：5300）
- `DATABASE_URL`: 数据库连接字符串
- `NEXTAUTH_SECRET`: NextAuth密钥

#### Nginx 配置
- `NGINX_PORT`: Nginx端口（默认：80）
- `NGINX_SSL_PORT`: SSL端口（默认：443）
- `NGINX_WORKER_PROCESSES`: 工作进程数（默认：auto）
- `NGINX_CLIENT_MAX_BODY_SIZE`: 最大请求体大小（默认：10m）

## 生产环境部署

### 1. SSL证书配置

项目支持Let's Encrypt自动SSL证书：

```bash
# 启动certbot服务获取证书
docker-compose --profile certbot up certbot

# 配置SSL证书环境变量
SSL_CERT_PATH=/etc/ssl/certs/server.crt
SSL_KEY_PATH=/etc/ssl/private/server.key
```

### 2. 数据库配置

推荐使用外部PostgreSQL或MySQL：

```bash
# PostgreSQL示例
DATABASE_URL=postgresql://username:password@postgres:5432/dify_chat

# MySQL示例
DATABASE_URL=mysql://username:password@mysql:3306/dify_chat
```

### 3. 反向代理配置

Nginx配置已包含：
- 静态文件服务
- API代理
- SSL支持
- 缓存配置
- Gzip压缩

## 镜像推送

```bash
# 标记镜像
docker tag dify-chat:latest your-registry/dify-chat:v1.0.0

# 推送到镜像仓库
docker push your-registry/dify-chat:v1.0.0

# 推送到Docker Hub
docker tag dify-chat:latest your-dockerhub-username/dify-chat:latest
docker push your-dockerhub-username/dify-chat:latest
```

## 构建优化

### 1. 使用Docker BuildKit

```bash
DOCKER_BUILDKIT=1 docker build -f Dockerfile_allinone -t dify-chat:latest .
```

### 2. 多阶段构建优化

项目已实现多阶段构建：
- **构建阶段**: 使用Node.js完整环境构建应用
- **运行阶段**: 使用轻量级nginx镜像运行

### 3. 缓存优化

- 频繁变动的文件放在Dockerfile后面
- 使用.dockerignore排除不必要的文件
- 利用Docker层缓存机制

## 故障排除

### 常见问题

1. **构建失败**
   ```bash
   # 清理Docker缓存
   docker system prune -a

   # 重新构建
   docker build --no-cache -f Dockerfile_allinone -t dify-chat:latest .
   ```

2. **容器启动失败**
   ```bash
   # 查看详细日志
   docker logs dify-chat

   # 进入容器调试
   docker exec -it dify-chat bash
   ```

3. **API连接失败**
   ```bash
   # 检查环境变量
   docker exec dify-chat env | grep PUBLIC_

   # 检查网络连通性
   docker exec dify-chat curl http://localhost:5300/
   ```

### 日志查看

```bash
# 查看所有日志
docker logs -f dify-chat

# 查看PM2日志
docker exec dify-chat pm2 logs

# 查看Nginx访问日志
docker exec dify-chat tail -f /var/log/nginx/access.log
```

## 性能优化

### 1. 资源限制

```bash
docker run -d \
  --name dify-chat \
  --memory=2g \
  --cpus=2 \
  -p 80:80 \
  -p 443:443 \
  dify-chat:latest
```

### 2. 数据库优化

- 使用外部数据库服务
- 配置数据库连接池
- 启用数据库缓存

### 3. 静态资源优化

- 配置CDN加速
- 启用浏览器缓存
- 使用Gzip压缩

## 安全配置

### 1. 网络安全

```bash
# 只暴露必要端口
docker run -d \
  --name dify-chat \
  -p 80:80 \
  -p 443:443 \
  --network=webnet \
  dify-chat:latest
```

### 2. 环境变量安全

- 使用Docker secrets管理敏感信息
- 不要在镜像中硬编码密码
- 定期轮换密钥

### 3. 容器安全

- 使用非root用户运行
- 限制容器权限
- 定期更新基础镜像

## 监控和维护

### 1. 健康检查

容器已配置健康检查：
```bash
# 检查容器健康状态
docker ps --format "table {{.Names}}\t{{.Status}}"
```

### 2. 日志管理

```bash
# 配置日志轮转
docker run -d \
  --name dify-chat \
  --log-driver=json-file \
  --log-opt max-size=10m \
  --log-opt max-file=3 \
  dify-chat:latest
```

### 3. 备份策略

- 定期备份数据库
- 备份配置文件
- 备份SSL证书

## 联系支持

如果遇到问题，请：
1. 查看项目文档
2. 检查GitHub Issues
3. 提交新的Issue
4. 联系维护团队

---

**注意**: 本指南基于项目的最新版本，请确保使用最新代码进行构建。