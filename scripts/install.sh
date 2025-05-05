#!/bin/bash

# 当前版本
version="2.8.1"
home="/data/data/com.termux/files/home"

# 传递过来的参数, 例:
# bash install.sh --github_proxy https://ghfast.top --do install
# --do firstrun/install/update
github_proxy=""
do="install"
while [[ $# -gt 0 ]]; do
    case $1 in
        --github_proxy) github_proxy=$2; shift 2;;
        --do) do=$2; shift 2;;
        *) exit 1;;
    esac
done

# home.tar压缩包下载地址
if [ -n "$github_proxy" ]; then
    hometar_url="$github_proxy/https://github.com/cnjackchen/diplus-www/raw/refs/heads/main/tars/home.tar"
else
    hometar_url="https://raw.gitcode.com/qq_43458985/diplus-www/raw/main/tars/home.tar"
fi


# 是首次安装还是更新
if [ ! -f "$home/db/db.db" ]; then
    do="firstrun"
fi

if [ "$do" == "firstrun" ] || [ "$do" == "install" ]; then
    echo -e "\n欢迎使用比亚迪车机Termux扩展包安装脚本！\n\n"

    echo "本扩展包软件主要功能生效的前提包括："
    echo "1. 车机打开ADB权限"
    echo "2. 部分功能依赖于比亚迪车机第三方监控软件迪加"

    echo -e "\n本扩展包集成了lucky/easytier/frp等第三方APP，将会安装nginx/php等APP运行包内集成的web程序。\c"
    echo -e "实现远程连接车机，通过web页面管理车机文件、视频，查看行驶数据，接收哨兵报警等。\c"
    echo -e "所有第三方APP的著作权归原作者所有，web程序由 @甲壳虫 编写，项目托管在github/GitCode。\n\n"

    echo -e "声明："
    echo "因本人水平有限以及第三方APP的不可控因素，不保证软件不会产生不可预料的问题导致系统故障、数据丢失！如你选择继续则表明你知晓并同意本声明。"

    echo -e "\n即将部署 home.tar 扩展包到 ~/ 目录，~/.bashrc 文件将会备份为 ~/.bashrc.bak。"

    read -p "是否继续？(y/n): " choice
    if [[ "$choice" != "y" && "$choice" != "Y" ]]; then
        echo "你选择了退出，脚本运行结束。"
        exit 1
    fi

    todownload="y"
    if [ -f "$home/home.tar" ]; then
        echo "" 
        read -p "车机 ~/ 目录中已存在 home.tar 扩展包，是否需要重新下载？(y/n): " todownload
    fi

    if [[ "$todownload" == "y" || "$todownload" == "Y" ]]; then
        echo "下载 home.tar 扩展包到 ~/ ..."
        if [ -f "$home/home.tar" ]; then
            rm "$home/home.tar"
        fi
        curl -L $hometar_url -o $home/home.tar
    fi
fi


if [ ! -f "$home/home.tar" ]; then
    echo "下载 home.tar 扩展包失败，请检查网络后重试。"
    exit 1
fi

if ! command -v sqlite3 > /dev/null; then
    echo -e "\n安装 sqlite ..."
    pkg install sqlite -y
    sqlite3 -version
fi

echo -e "\n将扩展包部署到 $home ..."

# 备份.bashrc
if [ -f "$home/.bashrc" ]; then
    mv "$home/.bashrc" "$home/.bashrc.bak"
fi

if [ "$do" == "firstrun" ] || [ "$do" == "install" ]; then
    # 安装，解压所有文件
    tar -xf "$home/home.tar" -C /data/data/com.termux/files/
else
    # update
    tar -xf "$home/home.tar" -C /data/data/com.termux/files/ \
        home/boot \
        home/nginx \
        home/easytier \
        home/lucky/lucky \
        home/lucky/lucky_cron.lkcf \
        home/php \
        home/sakurafrp \
        home/www \
        home/.bashrc
fi

if [ ! -f "$home/.bashrc" ]; then
    if [ -f "$home/.bashrc.bak" ]; then
        mv "$home/.bashrc.bak" "$home/.bashrc"
    fi
    echo "部署扩展包失败，退出。"
    exit 1
fi

# 版本号写入数据库
echo "将系统版本号写入数据库 ..."
sqlite3 "$home/db/db.db" "UPDATE settings SET data='$version' WHERE app = 'global' AND param = 'version'"

echo -e "\n扩展包部署完成，运行 ~/.bashrc 完成初始化 ..."

if [ "$do" == "firstrun" ] || [ "$do" == "install" ]; then
    # 运行.bashrc，传递 install 参数避免运行时最小化Termux窗口
    bash "$home/.bashrc" install
else
    # 以下几行清理2.7.2之前版本的不再使用的服务和文件
    pkill -f caddy
    rm -f "$home/boot/diplus_config_nohup.sh"
    rm -f "$home/boot/move_files_to_sd_nohup.sh"

    bash "$home/.bashrc"
fi


if [ "$do" == "firstrun" ] || [ "$do" == "install" ]; then
    echo -e "\n比亚迪车机Termux扩展包部署完成！"
    echo "请通过车机安装的浏览器 http://127.0.0.1:8018, 或者同一网络的手机/电脑浏览器 http://车机IP:8018 访问车机web服务。"
    if [ "$do" == "firstrun" ]; then
        echo "本系统 ssh 用户名: $(whoami), 密码: 123456, web/Lucky/FileBrowser用户名: admin, 密码: 123456。"
        echo "登录后请及时修改用户名/密码"
    fi
    echo -e "\n祝您用车愉快！"
else
    echo -e "\n系统更新成功！"
fi
