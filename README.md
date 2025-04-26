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

2. 自动安装（推荐）：车机Termux中运行以下命令：
```
bash <(curl -sSL https://raw.gitcode.com/qq_43458985/diplus-www/raw/main/scripts/install.sh)
```
或者运行以下短链接命令：
```
bash <(curl -sSL http://lanye.pw/diplus)
```
3. 如果以上链接失效也可以手动安装：下载install.sh、home.tar到车机Termux，运行 bash install.sh。

4. 浏览器 http://车机IP:8018 进入系统界面。

更多信息请查看教程：[Termux扩展比亚迪车机功能](https://docs.qq.com/doc/DWHVwWE1RYVBES2Fz)


### 相关资源和项目
本系统集成了以下项目和资源，感谢相关作者的付出。
- [nginx](https://nginx.org): HTTP web server, reverse proxy, content cache, load balancer, TCP/UDP proxy server, and mail proxy server
- [lucky](https://github.com/gdy666/lucky): ipv6动态域名、自动SSL证书、FileBrowser文件浏览
- [easytier](https://github.com/EasyTier/EasyTier): 通过虚拟组网连接车机
- [frp](https://github.com/fatedier/frp): 通过反代远程连接车机
- [樱花Frp](https://www.natfrp.com): 基于frp二次开发、提供免费公共服务器的反代方案


### 最近更新

### v2.7 2025.04.25
1. 迪加哨兵报警详情页面显示车辆位置，全屏播放哨兵视频页面在地图上显示车辆位置。
2. 增加自动移动内部存储的迪加哨兵/记录仪视频到SD卡选项。
3. 全屏播放视频时提前10秒预加载下一个视频，可选自动续播下一个视频。
4. 全屏播放迪加哨兵视频/记录视频、原车记录仪视频时，点击地图轨迹上的点时视频跳转到对应的时段。
5. 增加视频列表页面是否显示缩略图选项。
6. web服务器caddy改为更主流的nginx。
7. 增加自动设置哨兵报警、行驶轨迹记录迪加自动化配置的选项。
8. 可选在首页显示暂停推送报警的快捷按钮。
9. 项目同步到GitCode，下个版本开始系统更新将从GitCode下载安装包。
