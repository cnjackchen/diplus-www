# diplus-www

在比亚迪车机安装Termux扩展车机功能，实现远程查看和管理车机文件和视频。

### 前提
1. 比亚迪车机，已开ADB权限
2. 部分功能依赖于比亚迪第三方视频监控APP-迪加

### 用法
1. 在车机安装Termux并完成基本设置。

2. 将以下命令复制到Termux中运行：
```
curl -sSL https://ghfast.top/https://raw.githubusercontent.com/cnjackchen/diplus-www/refs/heads/main/scripts/install.sh -o install.sh && bash install.sh --github_proxy https://ghfast.top
```
以上命令首先下载install.sh脚本到Termux，然后运行脚本完成安装。
命令中的 `https://ghfast.top` 是github加速地址，如果失效请自行寻找有效网址并替换命令中的地址。


更多信息请查阅教程：[Termux扩展比亚迪车机功能](https://docs.qq.com/doc/DWHVwWE1RYVBES2Fz)


### 相关资源和项目
本系统集成了以下项目和资源，感谢相关作者的付出。
- [caddy](https://github.com/caddyserver/caddy): Fast and extensible multi-platform HTTP/1-2-3 web server with automatic HTTPS
- [lucky](https://github.com/gdy666/lucky): ipv6动态域名、自动SSL证书、FileBrowser文件浏览
- [easytier](https://github.com/EasyTier/EasyTier): 通过虚拟组网连接车机
- [frp](https://github.com/fatedier/frp): 通过反代远程连接车机
- [樱花Frp](https://www.natfrp.com): 基于frp二次开发、提供免费公共服务器的反代方案

### 更新记录

### v1.4 2025.03.13
1. easytier改为armv7版本(兼容老款车机)。
2. 增加迪加报警信息推送到钉钉的功能, 支持推送视频封面(如需推送封面建议等待时间设为20秒以上)。

### v1.3 2025.03.08
1. 修复初次安装初始密码无法登录的问题。
2. 增加自定义系统首页图片和微信信息图片的功能。
3. 如需在Termux启动时运行自己的sh脚本，可将脚本放在~/boot文件夹中。如果脚本中含死循环需要一直在后台运行，请确保文件名格式为 *_nohup.sh。

### v1.2 2025.03.07
1. 修复苹果手机播放视频自动调节亮度无效的问题。
2. 增加视频亮度调节最大值设置，可依据自己视频亮度情况修改。
3. 增加重启系统功能。

#### v1.1 2025.03.03
1. 修复原车记录仪视频封面错乱、无法播放的问题。
2. 系统设置-通用中增加系统在线更新功能。
3. 界面修改。

#### v1.0 2025.02
第一个版本
