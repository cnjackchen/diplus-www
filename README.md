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

### v2.8.1 2025.05.05
1. 添加要显示或监听的车况数据参数时，可以从参数列表中选择，不需要手工输入。
2. 车况数据中如选择监听并保存，自动创建相应的迪加自动化配置，被监听的参数发生变化时自动保存数据。
3. 推送哨兵报警信息可自定义AI识别可信度、最小报警间隔、信息标题、内容等。
4. 全屏播放迪加录屏时在地图上显示车辆位置。
5. 添加多个easytier公共服务器可选，服务器列表中显示服务器所在省份。
