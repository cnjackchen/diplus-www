#!/bin/bash

# 传递过来的参数
github_proxy=$1

echo -e "\n欢迎使用比亚迪车机Termux扩展包安装脚本！\n\n"

echo "本扩展包软件主要功能生效的前提包括："
echo "1. 车机打开ADB权限"
echo "2. 部分功能依赖于比亚迪车机第三方监控软件迪加"

echo -e "\n本扩展包集成了lucky/easytier/frp等第三方APP，将会安装caddy/php等APP运行包内集成的web程序。\c"
echo -e "通过web页面管理部分第三方APP, 实现远程连接车机查看/管理文件和视频。\c"
echo -e "所有第三方APP的著作权归原作者所有，web程序由 @甲壳虫 编写，项目托管在github平台(https://github.com/cnjackchen/diplus-www)。\n\n"

echo -e "声明："
echo "因本人水平有限以及第三方APP的不可控因素，本人不保证软件不会产生不可预料的问题导致系统故障、数据丢失！如你选择继续则表明你知晓并同意本声明。"

echo -e "\n即将下载 home.tar 扩展包并自动解压文件到 ~/ 目录，~/.bashrc 文件将会被覆盖，\c"
echo "如你在此文件中添加过代码，请先备份此文件，然后重新运行安装命令。"

read -p "是否继续？(y/n): " choice
if [[ "$choice" != "y" && "$choice" != "Y" ]]; then
    echo "你选择了退出，脚本结束。"
    exit 1
fi

todownload="y"
if [ -f "$HOME/home.tar" ]; then
    echo "" 
    read -p "车机 ~/ 目录中已存在 home.tar 扩展包，是否需要重新下载？(y/n): " todownload
fi

if [[ "$todownload" == "y" || "$todownload" == "Y" ]]; then
    echo "下载 home.tar 扩展包到 ~/ ..."
    if [ -f "$HOME/home.tar" ]; then
        rm "$HOME/home.tar"
    fi

    # home.tar压缩包下载地址
    hometar_url="https://github.com/cnjackchen/diplus-www/raw/refs/heads/main/tars/home.tar"
    if [ -n "$github_proxy" ]; then
        hometar_url="$github_proxy/$hometar_url"
    fi
    curl -L $hometar_url -o $HOME/home.tar
    if [ ! -f "$HOME/home.tar" ]; then
        echo "下载 home.tar 扩展包失败！请检查网络后重试，或者查找有效的 github 加速网址作为参数加在命令行最后。"
        exit
    fi
fi

echo "home.tar 解包到 ~/ 位置 ..."

