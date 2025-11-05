# First assignment-- front-end and back-end separation contacts programming 

### 方利喆     电子信息工程    832301104

------

## 1. 前言

### 1.1 任务概述

![image-20251105113238380](C:\Users\方利喆\AppData\Roaming\Typora\typora-user-images\image-20251105113238380.png)

**本任务需要开发一个功能完整的联系人管理系统，实现联系人的增删改查(CRUD)等核心功能，并采用数据持久化存储。该系统包含美观的前端界面和稳定的后端API，支持联系人信息分享、主题切换、实时搜索等增强功能，提供了完整的数据管理解决方案。**

### 1.2 PSP表格

| 任务     | 子任务           | 描述                                         | 计划时间(h) | 实际时间(h) |
| :------- | :--------------- | :------------------------------------------- | :---------- | :---------- |
| **规划** | 需求分析         | 联系人管理功能需求分析，系统模块划分         | 2.0         | 1.5         |
|          | 技术选型         | 确定技术栈：Node.js + Express + MySQL        | 1.5         | 2.0         |
|          | 数据库设计       | 设计联系人表结构，确定字段和关系             | 1.5         | 1.0         |
|          | API设计          | 设计RESTful API接口，定义请求和响应格式      | 2.0         | 2.5         |
| **开发** | 后端环境搭建     | 配置Node.js环境，安装依赖包                  | 1.5         | 1.0         |
|          | 数据库连接与模型 | 创建数据库连接池，实现联系人数据模型         | 2.5         | 3.0         |
|          | API接口开发      | 实现联系人CRUD接口（获取、添加、更新、删除） | 4.0         | 4.5         |
|          | 前端界面开发     | 开发响应式前端界面，实现联系人列表和表单     | 5.0         | 6.0         |
|          | 前后端集成       | 集成前后端，实现数据交互和功能联调           | 3.0         | 2.5         |
| **测试** | 单元测试         | 编写并执行API接口单元测试                    | 2.0         | 2.0         |
|          | 集成测试         | 进行前后端集成测试，验证完整功能流程         | 2.5         | 3.0         |
|          | 系统测试         | 进行系统整体测试，包括边界情况和异常处理     | 2.0         | 1.5         |
| **部署** | 环境配置         | 配置生产环境，安装MySQL数据库和Node.js环境   | 1.5         | 2.0         |
|          | 应用部署         | 部署前后端应用，配置反向代理和数据库连接     | 2.0         | 1.5         |
| **评估** | 文档撰写         | 编写项目文档、用户手册和技术文档             | 2.0         | 2.0         |
| **合计** |                  | 总计                                         | 32.5        | 34.0        |

### 1.3 如何运行我的项目

1. github项目访问：
2. 下载并配置MySQL数据库：https://dev.mysql.com/downloads/mysql/；下载mysql2数据库驱动；
3. 下载并配置node.js跨平台运行环境；
4. 解压后打开backend文件夹终端，输入下列命令启动服务器：

```shell
node server-mysql.js
```

   显示如下即启动成功；

![image-20251105122010496](C:\Users\方利喆\AppData\Roaming\Typora\typora-user-images\image-20251105122010496.png)

5. 浏览器中搜索本地访问那一行的链接，即可正常使用。

## 2. 功能展示

### 2.1 增加联系人

![add](C:\Users\方利喆\Desktop\通讯录\gif\add.gif)

> 附加功能：若手机号重复，系统显示“添加联系人失败，该电话号码已经存在”

### 2.2 删除联系人

![delete](C:\Users\方利喆\Desktop\通讯录\gif\delete.gif)

### 2.3 编辑联系人

![edit](C:\Users\方利喆\Desktop\通讯录\gif\edit.gif)

### 2.4 搜索联系人

![search](C:\Users\方利喆\Desktop\通讯录\gif\search.gif)

### 2.5 分享联系人

![share](C:\Users\方利喆\Desktop\通讯录\gif\share.gif)

> 分享联系人操作可以生成一个24小时有效的链接（考虑到分享信息的时效性），点进去会生成被分享人的名片，可以电话或者邮件联系。

### 2.6 主题切换

![theme](C:\Users\方利喆\Desktop\通讯录\gif\theme.gif)

> 日夜间主题切换



## 3. 开发过程

项目结构如下：

**联系人管理系统**
├── backend/
│   ├── server-MySQL.js
│   ├── package.json
│   ├── .env
│   └── package-lock.json
├── frontend/
│   └── index.html
├── README.md
├── TROUBLESHOOTING.md
└── 安装说明.txt

### 3.1 后端开发

本项目后端开发始于一个基于内存存储的简易原型，使用 Express.js 框架快速搭建了 RESTful API，实现了联系人的增删改查功能。随后，为解决服务器重启数据丢失的核心问题，进行了架构升级，集成 MySQL 数据库以实现数据持久化。此阶段完成了数据库连接池配置、表结构设计，并将所有 CRUD 操作重构成 SQL 查询，同时加入了数据验证和完整错误处理。

#### 3.1.1 数据库搭建

MySQL官网下载：https://dev.mysql.com/downloads/mysql/

设置私人密码，配置数据库环境，如下图所示即配置成功

```shell
// cmd 输入指令
mysql -uroot -p
```

![image-20251105113919617](C:\Users\方利喆\AppData\Roaming\Typora\typora-user-images\image-20251105113919617.png)

#### 3.1.2 contact表建立

cmd中激活sql，逐行输入以下指令：

```sql
-- 创建数据库
CREATE DATABASE IF NOT EXISTS contact_management 
DEFAULT CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 使用数据库
USE contact_management;

-- 创建联系人表（代码中会自动创建，但也可以手动执行）
CREATE TABLE IF NOT EXISTS contacts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_phone (phone)
);
```

#### 3.1.3 环境配置

在backend目录终端运行：

```shell
npm install mysql2
```

在backend目录创建`.env`文件：

```env
# 数据库配置
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password_here
DB_NAME=contact_management

# 服务器配置
PORT=3000
```

数据库连接工作以及设置与前端交互的中间件：

```javascript
// 加载环境变量
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const mysql = require('mysql2');

const app = express();
const PORT = process.env.PORT || 3000;

// MySQL数据库配置
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'contact_management',
    charset: 'utf8mb4'
};

// 创建数据库连接池
const pool = mysql.createPool(dbConfig);
const promisePool = pool.promise();

// 中间件配置
app.use(cors());
app.use(express.json());

// Windows路径处理：提供前端文件服务
app.use(express.static(path.join(__dirname, '../frontend')));

// 初始化数据库表
async function initializeDatabase() {
    try {
        const createTableSQL = `
            CREATE TABLE IF NOT EXISTS contacts (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                phone VARCHAR(20) NOT NULL,
                email VARCHAR(100),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                UNIQUE KEY unique_phone (phone)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
        `;
        
        await promisePool.execute(createTableSQL);
        console.log('数据库表初始化完成');
        
        // 检查是否有数据，如果没有则插入示例数据
        const [rows] = await promisePool.execute('SELECT COUNT(*) as count FROM contacts');
        if (rows[0].count === 0) {
            await promisePool.execute(
                'INSERT INTO contacts (name, phone, email) VALUES (?, ?, ?), (?, ?, ?)',
                ['张三', '13800138000', 'zhangsan@example.com', '李四', '13900139000', 'lisi@example.com']
            );
            console.log('示例数据插入完成');
        }
    } catch (error) {
        console.error('数据库初始化失败:', error.message);
        throw error; // 重新抛出错误，让调用者处理
    }
}
```

#### 3.1.4 核心功能实现

本项目后端开发全程基于 **Express.js**框架展开。首先，利用 Express 快速搭建了服务器骨架，通过 `app.use()`方法加载了 `cors`中间件解决跨域问题，并使用 `express.json()`中间件自动解析前端传来的 JSON 请求体。核心开发阶段是定义 RESTful API 路由：使用 `app.get()`、`app.post()`、`app.put()`和 `app.delete()`等方法，分别实现了获取所有联系人、添加新联系人、更新和删除指定联系人的接口。

##### 添加联系人

```javascript
// 添加联系人
app.post('/api/contacts', async (req, res) => {
    console.log(`[${new Date().toLocaleString()}] 添加联系人:`, req.body);

    const { name, phone, email } = req.body;
```

##### 删除联系人

```javascript
// 删除联系人
app.delete('/api/contacts/:id', async (req, res) => {
    const id = parseInt(req.params.id);
    console.log(`[${new Date().toLocaleString()}] 删除联系人 ID: ${id}`);
```

##### 编辑联系人

```javascript
// 编辑联系人
app.put('/api/contacts/:id', async (req, res) => {
    const id = parseInt(req.params.id);
    console.log(`[${new Date().toLocaleString()}] 更新联系人 ID: ${id}`, req.body);

    const { name, phone, email } = req.body;

    if (!name || !phone) {
        return res.status(400).json({
            success: false,
            message: '姓名和电话号码为必填项'
        });
    }
```

##### 搜索联系人

支持姓名、电话、邮件任一形式搜索

```javascript
// 获取所有联系人
app.get('/api/contacts', async (req, res) => {
    console.log(`[${new Date().toLocaleString()}] 获取联系人列表`);

    try {
        const [rows] = await promisePool.execute(
            'SELECT id, name, phone, email, created_at, updated_at FROM contacts ORDER BY created_at DESC'
        );

        res.json({
            success: true,
            data: rows,
            message: '获取联系人列表成功',
            count: rows.length
        });
    } catch (error) {
        console.error('获取联系人失败:', error);
        res.status(500).json({
            success: false,
            message: '获取联系人列表失败: ' + error.message
        });
    }
});
```

##### 分享联系人

```javascript
// 分享联系人 - 生成分享链接
app.post('/api/contacts/:id/share', async (req, res) => {
    const id = parseInt(req.params.id);
    console.log(`[${new Date().toLocaleString()}] 分享联系人 ID: ${id}`);

    try {
        // 检查联系人是否存在
        const [existing] = await promisePool.execute(
            'SELECT id, name, phone, email, created_at, updated_at FROM contacts WHERE id = ?',
            [id]
        );

        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: '联系人不存在'
            });
        }

        const contact = existing[0];

        // 生成分享令牌 (使用时间戳+随机数+联系人ID的哈希)
        const tokenData = `${Date.now()}-${Math.random()}-${contact.id}`;
        const shareToken = crypto.createHash('md5').update(tokenData).digest('hex');

        // 设置令牌过期时间 (24小时)
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

        // 存储分享令牌和联系人信息
        shareTokens.set(shareToken, {
            contact: contact,
            expiresAt: expiresAt
        });
```

### 3.2 前端开发

#### 3.2.1 技术说明

本项目前端使用纯原生技术栈，不依赖任何现代前端框架（如React、Vue等），主要基于HTML5、CSS3和原生JavaScript，并借助Bootstrap 5快速构建用户界面，核心技术架构，具体技术组成如下：

- **HTML5语义化标签**：使用`<header>`、`<section>`、`<main>`等标签构建清晰页面结构
- **CSS3现代特性**：采用Flexbox弹性布局、CSS Grid系统、CSS自定义属性（变量）和过渡动画效果
- **原生ES6+ JavaScript**：全面使用箭头函数、async/await异步编程、模板字符串、解构赋值等现代语法

##### UI框架与组件库：

- **Bootstrap 5**：作为主要UI框架，提供响应式栅格系统、表单组件、卡片布局和按钮样式
- **Bootstrap Icons**：集成图标库，提供丰富的矢量图标资源
- **自定义CSS**：在Bootstrap基础上进行深度样式定制，实现独特视觉风格

#### 3.2.2  核心功能实现

##### 日夜间主题切换

```css
/* 定义CSS变量 */
:root {
    --primary-color: #4e73df;
    --bg-color: #f8f9fc;
    --card-bg: #ffffff;
}

/* 日间主题 */
.day-theme {
    --primary-color: #ff9800;  /* 橙色 */
    --bg-color: #fff8e1;       /* 浅黄色背景 */
    --card-bg: #ffffff;
}

/* 夜间主题 */
.night-theme {
    --primary-color: #2196f3;  /* 蓝色 */
    --bg-color: #0d1b2a;      /* 深蓝背景 */
    --card-bg: #1b263b;       /* 深色卡片 */
}

/* 使用CSS变量 */
.card {
    background-color: var(--card-bg);
    color: var(--text-color);
}
```

> 通过CSS变量实现一键主题切换，无需重复编写样式。



##### 响应式搜索组件

<img src="C:\Users\方利喆\AppData\Roaming\Typora\typora-user-images\image-20251105125515810.png" alt="image-20251105125515810" style="zoom:50%;" /> 

```javascript
// 实时搜索功能
function performSearch(term) {
    const searchResults = document.getElementById('searchResults');
    
    if (!term) {
        searchResults.style.display = 'none';
        return;
    }

    // 过滤联系人
    const filteredContacts = contacts.filter(contact =>
        contact.name.toLowerCase().includes(term.toLowerCase()) ||
        contact.phone.includes(term) ||
        (contact.email && contact.email.toLowerCase().includes(term.toLowerCase()))
    );

    // 显示搜索结果
    if (filteredContacts.length === 0) {
        searchResults.innerHTML = '<div class="search-result-item">未找到匹配的联系人</div>';
    } else {
        let html = '';
        filteredContacts.slice(0, 5).forEach(contact => {
            html += `<div class="search-result-item" data-id="${contact.id}">
                <strong>${contact.name}</strong> - ${contact.phone}
            </div>`;
        });
        searchResults.innerHTML = html;
    }
    searchResults.style.display = 'block';
}
```



##### 动态联系人渲染

```javascript
function renderContacts(contactsToRender) {
    let html = '';
    contactsToRender.forEach(contact => {
        const createdDate = new Date(contact.created_at).toLocaleDateString('zh-CN');
        const updatedDate = new Date(contact.updated_at).toLocaleDateString('zh-CN');
        
        html += `
            <div class="contact-item" data-id="${contact.id}">
                <div class="row align-items-center">
                    <div class="col-md-3">
                        <h6 class="mb-0">${contact.name}</h6>
                        <small class="text-muted">ID: ${contact.id}</small>
                    </div>
                    <div class="col-md-2">
                        <i class="fas fa-phone me-1 text-muted"></i>
                        <span>${contact.phone}</span>
                    </div>
                    <div class="col-md-3">
                        <i class="fas fa-envelope me-1 text-muted"></i>
                        <span>${contact.email || '未填写'}</span>
                    </div>
                    <div class="col-md-4 text-end contact-actions">
                        <button class="btn btn-sm btn-outline-primary btn-action edit-btn">
                            <i class="fas fa-edit"></i>
                        </button>
                        <!-- 更多操作按钮 -->
                    </div>
                </div>
                <div class="row mt-2">
                    <div class="col-12">
                        <small class="text-muted">
                            <i class="fas fa-calendar-plus me-1"></i>创建: ${createdDate}
                            <i class="fas fa-history ms-2 me-1"></i>更新: ${updatedDate}
                        </small>
                    </div>
                </div>
            </div>
        `;
    });
    
    // 动态绑定事件
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const contactId = parseInt(this.closest('.contact-item').dataset.id);
            editContact(contactId);
        });
    });
}
```



##### 联系人分享名片

<img src="C:\Users\方利喆\AppData\Roaming\Typora\typora-user-images\image-20251105125423804.png" alt="image-20251105125423804" style="zoom:50%;" /> 

```html
   try {
        // 检查令牌是否存在且未过期
        const shareData = shareTokens.get(token);

        if (!shareData) {
            return res.status(404).send(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>分享链接无效</title>
                    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
                    <style>
                        body { background-color: #f8f9fa; padding: 2rem; }
                        .card { max-width: 500px; margin: 0 auto; }
                    </style>
                </head>
                <body>
                    <div class="card">
                        <div class="card-body text-center">
                            <h1 class="text-danger">❌</h1>
                            <h3>分享链接无效</h3>
                            <p>此分享链接已过期或不存在。</p>
                            <a href="/" class="btn btn-primary">返回首页</a>
                        </div>
                    </div>
                </body>
                </html>
            `);
        }

        if (new Date() > shareData.expiresAt) {
            // 删除过期的令牌
            shareTokens.delete(token);
            return res.status(410).send(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>分享链接已过期</title>
                    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
                    <style>
                        body { background-color: #f8f9fa; padding: 2rem; }
                        .card { max-width: 500px; margin: 0 auto; }
                    </style>
                </head>
                <body>
                    <div class="card">
                        <div class="card-body text-center">
                            <h1 class="text-warning">⏰</h1>
                            <h3>分享链接已过期</h3>
                            <p>此分享链接已超过24小时有效期。</p>
                            <a href="/" class="btn btn-primary">返回首页</a>
                        </div>
                    </div>
                </body>
                </html>
            `);
        }

        const contact = shareData.contact;

        // 返回分享页面
        res.send(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>联系人信息 - ${contact.name}</title>
                <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
                <style>
                    body { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; padding: 2rem; }
                    .contact-card { max-width: 500px; margin: 0 auto; background: white; border-radius: 15px; box-shadow: 0 10px 30px rgba(0,0,0,0.2); overflow: hidden; }
                    .contact-header { background: linear-gradient(135deg, #4e73df 0%, #224abe 100%); color: white; padding: 2rem; text-align: center; }
                    .contact-avatar { width: 80px; height: 80px; border-radius: 50%; background: rgba(255,255,255,0.2); display: flex; align-items: center; justify-content: center; margin: 0 auto 1rem; font-size: 2rem; }
                    .contact-body { padding: 2rem; }
                    .contact-field { display: flex; align-items: center; margin-bottom: 1.5rem; padding-bottom: 1rem; border-bottom: 1px solid #eee; }
                    .contact-field i { width: 30px; color: #4e73df; font-size: 1.2rem; }
                    .contact-field div { flex: 1; }
                    .contact-field .label { font-weight: 600; color: #5a5c69; font-size: 0.9rem; }
                    .contact-field .value { font-size: 1.1rem; }
                    .contact-actions { display: flex; gap: 10px; margin-top: 2rem; }
                    .btn-action { flex: 1; display: flex; align-items: center; justify-content: center; gap: 8px; }
                    .footer { text-align: center; margin-top: 2rem; color: rgba(255,255,255,0.7); font-size: 0.9rem; }
                </style>
            </head>
            <body>
                <div class="contact-card">
                    <div class="contact-header">
                        <div class="contact-avatar">
                            <i class="fas fa-user"></i>
                        </div>
                        <h2>${contact.name}</h2>
                        <p class="mb-0">联系人信息</p>
                    </div>
                    <div class="contact-body">
                        <div class="contact-field">
                            <i class="fas fa-phone"></i>
                            <div>
                                <div class="label">电话号码</div>
                                <div class="value">${contact.phone}</div>
                            </div>
                        </div>
                        <div class="contact-field">
                            <i class="fas fa-envelope"></i>
                            <div>
                                <div class="label">电子邮箱</div>
                                <div class="value">${contact.email || '未填写'}</div>
                            </div>
                        </div>
                        <div class="contact-field">
                            <i class="fas fa-calendar"></i>
                            <div>
                                <div class="label">更新时间</div>
                                <div class="value">${new Date(contact.updated_at).toLocaleString('zh-CN')}</div>
                            </div>
                        </div>
                        
                        <div class="contact-actions">
                            <a href="tel:${contact.phone}" class="btn btn-primary btn-action">
                                <i class="fas fa-phone"></i> 拨打电话
                            </a>
                            ${contact.email ? `
                            <a href="mailto:${contact.email}" class="btn btn-outline-primary btn-action">
                                <i class="fas fa-envelope"></i> 发送邮件
                            </a>
                            ` : ''}
                        </div>
                    </div>
                </div>
                
                <div class="footer">
                    <p>此分享链接由联系人管理系统生成 | 有效期至: ${new Date(shareData.expiresAt).toLocaleString('zh-CN')}</p>
                </div>
                
                <script>
                    // 添加点击统计（可选）
                    function trackShareView() {
                        // 在实际应用中，这里可以发送统计信息到服务器
                        console.log('分享页面被访问:', '${contact.name}');
                    }
                    trackShareView();
                </script>
            </body>
            </html>
        `);
    } catch (error) {
        console.error('获取分享信息失败:', error);
        res.status(500).send(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>服务器错误</title>
                <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
            </head>
            <body class="p-5 text-center">
                <h1 class="text-danger">服务器内部错误</h1>
                <p>加载分享信息时发生错误，请稍后重试。</p>
                <a href="/" class="btn btn-primary">返回首页</a>
            </body>
            </html>
        `);
    }
});

```



## 4.学习感悟

作为一名刚接触全栈开发的电子信息工程学生，当我决定独立完成这个联系人管理系统时，内心既充满期待又有些忐忑。之前只学过基础的python，c语言编程教程，现在要构建一个完整的前后端应用，我意识到需要制定清晰的学习路线，循序渐进地攻克每个技术难点。

项目开始时，我选择**从后端入手**，因为数据是应用的基石。最初我使用简单的内存数组存储联系人数据，这样能快速验证业务逻辑。但很快发现**服务器重启数据丢失**的问题，这让我认识到生产环境需要真正的数据持久化，这也是为什么作业中要求要用数据库的原因。

于是我开始学习**MySQL数据库**。创建表结构时，我设计了字段约束：

```sql
CREATE TABLE contacts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL UNIQUE,  
    email VARCHAR(100)
);
```

该过程让我理解了数据库设计的规范性重要性。连接MySQL时，我选择了**连接池技术**而非单连接，从而显著提升性能。

在实现RESTful API时，我深入理解HTTP状态码的意义：

```js
app.post('/api/contacts', async (req, res) => {
    try {
        // 201 Created - 资源创建成功
        res.status(201).json({ success: true, data: newContact });
    } catch (error) {
        // 400 Bad Request - 客户端错误
        res.status(400).json({ success: false, message: error.message });
    }
});
```

通过Postman测试每个API端点，养成**边开发边测试**的好习惯。

接着转向前端开发时，我决定**不使用任何前端框架**，而是用原生技术栈深入理解Web基本原理。（之前接触过html编程）

实现**实时搜索功能**时，我学到了性能优化的重要性：

```javascript
// 防抖搜索，避免频繁请求
let searchTimeout;
searchInput.addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
        performSearch(e.target.value);
    }, 300);
});
```

**主题切换功能**的实现让我对CSS变量有了深刻理解：

```css
:root {
    --primary-color: #4e73df;
    --bg-color: #f8f9fc;
}
.night-theme {
    --primary-color: #2196f3;
    --bg-color: #0d1b2a;
}
```

通过JavaScript动态切换CSS类名，实现了流畅的主题切换效果。

最后集成阶段遇到了最大的挑战——**CORS跨域问题**。一开始看到浏览器的报错我很困惑，通过查阅资料，我理解了同源策略的原理，并学会了配置CORS中间件：

```js
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));
```

综上，联系人管理系统虽然功能简单，但让我体验了完整的软件开发生命周期。从需求分析到部署上线的全过程实践，比任何理论教程都更加深刻。我相信，这个项目积累的经验和信心，将为我后续的学习和项目开发奠定坚实基础，编程之路漫长，但每一步都值得认真对待。

