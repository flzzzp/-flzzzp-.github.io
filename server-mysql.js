// 加载环境变量
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const mysql = require('mysql2');
const crypto = require('crypto');

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

// 分享令牌存储 (实际项目中应使用Redis等持久化存储)
const shareTokens = new Map();

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
        console.log('✅ 数据库表初始化完成');

        // 检查是否有数据，如果没有则插入示例数据
        const [rows] = await promisePool.execute('SELECT COUNT(*) as count FROM contacts');
        if (rows[0].count === 0) {
            await promisePool.execute(
                'INSERT INTO contacts (name, phone, email) VALUES (?, ?, ?), (?, ?, ?)',
                ['张三', '13800138000', 'zhangsan@example.com', '李四', '13900139000', 'lisi@example.com']
            );
            console.log('✅ 示例数据插入完成');
        }
    } catch (error) {
        console.error('❌ 数据库初始化失败:', error.message);
        throw error; // 重新抛出错误，让调用者处理
    }
}

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

// 添加联系人
app.post('/api/contacts', async (req, res) => {
    console.log(`[${new Date().toLocaleString()}] 添加联系人:`, req.body);

    const { name, phone, email } = req.body;

    // 验证输入
    if (!name || !phone) {
        return res.status(400).json({
            success: false,
            message: '姓名和电话号码为必填项'
        });
    }

    // 检查电话号码格式
    const phoneRegex = /^1[3-9]\d{9}$/;
    if (!phoneRegex.test(phone)) {
        return res.status(400).json({
            success: false,
            message: '电话号码格式不正确'
        });
    }

    try {
        // 检查电话号码是否已存在
        const [existing] = await promisePool.execute(
            'SELECT id FROM contacts WHERE phone = ?',
            [phone]
        );

        if (existing.length > 0) {
            return res.status(400).json({
                success: false,
                message: '该电话号码已存在'
            });
        }

        // 插入新联系人
        const [result] = await promisePool.execute(
            'INSERT INTO contacts (name, phone, email) VALUES (?, ?, ?)',
            [name, phone, email || null]
        );

        // 获取新创建的联系人
        const [newContact] = await promisePool.execute(
            'SELECT id, name, phone, email, created_at, updated_at FROM contacts WHERE id = ?',
            [result.insertId]
        );

        console.log(`[${new Date().toLocaleString()}] 联系人添加成功，ID: ${result.insertId}`);

        res.status(201).json({
            success: true,
            data: newContact[0],
            message: '联系人添加成功'
        });
    } catch (error) {
        console.error('添加联系人失败:', error);
        res.status(500).json({
            success: false,
            message: '添加联系人失败: ' + error.message
        });
    }
});

// 更新联系人
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

    // 检查电话号码格式
    const phoneRegex = /^1[3-9]\d{9}$/;
    if (!phoneRegex.test(phone)) {
        return res.status(400).json({
            success: false,
            message: '电话号码格式不正确'
        });
    }

    try {
        // 检查联系人是否存在
        const [existing] = await promisePool.execute(
            'SELECT id FROM contacts WHERE id = ?',
            [id]
        );

        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: '联系人不存在'
            });
        }

        // 检查电话号码是否被其他联系人使用
        const [phoneCheck] = await promisePool.execute(
            'SELECT id FROM contacts WHERE phone = ? AND id != ?',
            [phone, id]
        );

        if (phoneCheck.length > 0) {
            return res.status(400).json({
                success: false,
                message: '该电话号码已被其他联系人使用'
            });
        }

        // 更新联系人
        await promisePool.execute(
            'UPDATE contacts SET name = ?, phone = ?, email = ? WHERE id = ?',
            [name, phone, email || null, id]
        );

        // 获取更新后的联系人
        const [updatedContact] = await promisePool.execute(
            'SELECT id, name, phone, email, created_at, updated_at FROM contacts WHERE id = ?',
            [id]
        );

        console.log(`[${new Date().toLocaleString()}] 联系人更新成功，ID: ${id}`);

        res.json({
            success: true,
            data: updatedContact[0],
            message: '联系人更新成功'
        });
    } catch (error) {
        console.error('更新联系人失败:', error);
        res.status(500).json({
            success: false,
            message: '更新联系人失败: ' + error.message
        });
    }
});

// 删除联系人
app.delete('/api/contacts/:id', async (req, res) => {
    const id = parseInt(req.params.id);
    console.log(`[${new Date().toLocaleString()}] 删除联系人 ID: ${id}`);

    try {
        // 检查联系人是否存在
        const [existing] = await promisePool.execute(
            'SELECT id, name, phone, email FROM contacts WHERE id = ?',
            [id]
        );

        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: '联系人不存在'
            });
        }

        // 删除联系人
        await promisePool.execute('DELETE FROM contacts WHERE id = ?', [id]);

        console.log(`[${new Date().toLocaleString()}] 联系人删除成功，ID: ${id}`);

        res.json({
            success: true,
            data: existing[0],
            message: '联系人删除成功'
        });
    } catch (error) {
        console.error('删除联系人失败:', error);
        res.status(500).json({
            success: false,
            message: '删除联系人失败: ' + error.message
        });
    }
});

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

        // 生成分享链接
        const shareUrl = `${req.protocol}://${req.get('host')}/share/${shareToken}`;

        console.log(`[${new Date().toLocaleString()}] 生成分享链接，ID: ${id}, 令牌: ${shareToken}`);

        res.json({
            success: true,
            data: {
                shareUrl: shareUrl,
                expiresAt: expiresAt,
                contact: {
                    id: contact.id,
                    name: contact.name
                }
            },
            message: '分享链接生成成功'
        });
    } catch (error) {
        console.error('分享联系人失败:', error);
        res.status(500).json({
            success: false,
            message: '分享联系人失败: ' + error.message
        });
    }
});

// 获取分享的联系人信息
app.get('/share/:token', async (req, res) => {
    const token = req.params.token;
    console.log(`[${new Date().toLocaleString()}] 访问分享链接，令牌: ${token}`);

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

// 健康检查端点
app.get('/api/health', async (req, res) => {
    try {
        // 测试数据库连接
        await promisePool.execute('SELECT 1');

        res.json({
            success: true,
            message: 'API服务运行正常',
            timestamp: new Date().toLocaleString('zh-CN'),
            platform: process.platform,
            nodeVersion: process.version,
            database: '连接正常',
            shareTokens: shareTokens.size // 返回当前有效的分享令牌数量
        });
    } catch (error) {
        res.json({
            success: true,
            message: 'API服务运行正常',
            timestamp: new Date().toLocaleString('zh-CN'),
            platform: process.platform,
            nodeVersion: process.version,
            database: '连接异常: ' + error.message,
            shareTokens: shareTokens.size
        });
    }
});

// 获取本机IP地址（用于网络访问）
function getIPAddress() {
    const interfaces = require('os').networkInterfaces();
    for (const name of Object.keys(interfaces)) {
        for (const interface of interfaces[name]) {
            if (interface.family === 'IPv4' && !interface.internal) {
                return interface.address;
            }
        }
    }
    return 'localhost';
}

// 启动服务器
async function startServer() {
    try {
        // 初始化数据库
        await initializeDatabase();

        // 获取当前联系人数量
        const [countResult] = await promisePool.execute('SELECT COUNT(*) as count FROM contacts');
        const contactCount = countResult[0].count;

        // 启动HTTP服务器
        app.listen(PORT, '0.0.0.0', () => {
            console.log('='.repeat(60));
            console.log('🚀 联系人管理系统后端服务已启动 (MySQL持久化版本)');
            console.log('✨ 新增功能: 联系人分享');
            console.log(`📍 本地访问: http://localhost:${PORT}`);
            console.log(`🌐 网络访问: http://${getIPAddress()}:${PORT}`);
            console.log(`🔗 API健康检查: http://localhost:${PORT}/api/health`);
            console.log(`📊 当前联系人数量: ${contactCount}`);
            console.log(`💻 运行平台: ${process.platform}`);
            console.log(`💾 数据库: ${dbConfig.database}@${dbConfig.host}`);
            console.log('🌍 监听地址: 0.0.0.0 (允许所有网络接口访问)');
            console.log('💡 数据已持久化 - 重启服务器不会丢失数据！');
            console.log('🔗 分享功能: 已启用 (有效期24小时)');
            console.log('='.repeat(60));
        });
    } catch (error) {
        console.error('❌ 服务器启动失败:', error.message);
        console.log('💡 请确保MySQL服务已启动且数据库配置正确');
        process.exit(1);
    }
}

// 优雅关闭
process.on('SIGINT', async () => {
    console.log('\n正在关闭服务器...');
    await pool.end();
    console.log('数据库连接已关闭');
    process.exit(0);
});

// 检查是否安装了mysql2
try {
    require('mysql2');
} catch (error) {
    console.log('❌ 缺少mysql2依赖，请运行: npm install mysql2');
    process.exit(1);
}

// 启动服务器
startServer();