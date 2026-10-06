# diplus-www

在比亚迪车机安装Termux扩展车机功能，实现：
1. 远程查看和管理车机文件和视频
2. 远程查看车况数据和行驶记录
3. 远程发送指令控制车辆


### 前提
1. 比亚迪车机，已开ADB权限
2. 部分功能依赖于比亚迪第三方视频监控APP-迪加

### 用法
1. 在车机安装Termux并完成基本设置。

2. 自动安装（推荐）：
车机Termux中运行以下命令：
```
bash <(curl -sSL https://gh-proxy.com/https://raw.githubusercontent.com/cnjackchen/diplus-www/refs/heads/main/scripts/install.sh)
```
或者运行以下短链接命令：
```
bash <(curl -sSL https://s.qzz.io/diplus-www)
```
3. 如果以上链接失效也可以手动安装：下载 install.sh、home.tar 到车机 Termux，运行 bash install.sh。

4. 浏览器 http://车机IP:8018 进入系统界面。

更多信息请查看教程：[Termux扩展比亚迪车机功能](https://docs.qq.com/doc/DWHVwWE1RYVBES2Fz)


### 相关资源和项目
本系统集成了以下项目和资源，感谢相关作者的付出。
- [nginx](https://nginx.org): HTTP web server, reverse proxy, content cache, load balancer, TCP/UDP proxy server, and mail proxy server
- [lucky](https://github.com/gdy666/lucky): ipv6动态域名、自动SSL证书、FileBrowser文件浏览
- [easytier](https://github.com/EasyTier/EasyTier): 通过虚拟组网连接车机
- [frp](https://github.com/fatedier/frp): 通过反代远程连接车机
- [樱花Frp](https://www.natfrp.com): 基于frp二次开发、提供免费公共服务器的反代方案
- [LibreSpeed](https://github.com/librespeed/speedtest): 开源、本地部署的测网速代码


### 最近更新

### v2.9 2026.10.06
1. 修复 Termux 无法保活问题。 
2. 系统设置中增加 LibreSpeed 测网速模块，用于测试手机/电脑和车机之间的传输速度。
3. easytier 更新到 v2.6.4。
4. 远程控车支持执行 adb shell 指令。
