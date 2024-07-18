import{_ as s,c as n,o as a,a2 as p}from"./chunks/framework.U6HXpukZ.js";const g=JSON.parse('{"title":"Rocky Linux 9.4 部署高可用Kubernetes v1.30.2","description":"","frontmatter":{},"headers":[],"relativePath":"deploy-kubernetes-ha-v1.30.2.md","filePath":"deploy-kubernetes-ha-v1.30.2.md"}'),e={name:"deploy-kubernetes-ha-v1.30.2.md"},l=p(`<h1 id="rocky-linux-9-4-部署高可用kubernetes-v1-30-2" tabindex="-1">Rocky Linux 9.4 部署高可用Kubernetes v1.30.2 <a class="header-anchor" href="#rocky-linux-9-4-部署高可用kubernetes-v1-30-2" aria-label="Permalink to &quot;Rocky Linux 9.4 部署高可用Kubernetes v1.30.2&quot;">​</a></h1><h3 id="配置网络" tabindex="-1"><strong>配置网络</strong> <a class="header-anchor" href="#配置网络" aria-label="Permalink to &quot;**配置网络**&quot;">​</a></h3><blockquote><p>Rocky 9.4使用NetworkManager管理网络</p></blockquote><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>vim /etc/NetworkManager/system-connections/ens5f0.nmconnection</span></span>
<span class="line"><span>[connection]</span></span>
<span class="line"><span>id=ens5f0</span></span>
<span class="line"><span>uuid=48245c90-e7e7-3e84-8f6d-a1f8cf5cd9e1</span></span>
<span class="line"><span>type=ethernet</span></span>
<span class="line"><span>autoconnect-priority=-999</span></span>
<span class="line"><span>interface-name=ens5f0</span></span>
<span class="line"><span></span></span>
<span class="line"><span>[ethernet]</span></span>
<span class="line"><span>cloned-mac-address=random</span></span>
<span class="line"><span></span></span>
<span class="line"><span>[ipv4]</span></span>
<span class="line"><span>address1=172.25.2.4/24,172.25.2.1</span></span>
<span class="line"><span>dns=218.2.2.2;</span></span>
<span class="line"><span>method=manual</span></span>
<span class="line"><span></span></span>
<span class="line"><span>[ipv6]</span></span>
<span class="line"><span>addr-gen-mode=eui64</span></span>
<span class="line"><span>method=auto</span></span>
<span class="line"><span></span></span>
<span class="line"><span>[proxy]</span></span></code></pre></div><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span># 设置时区（所有节点）</span></span>
<span class="line"><span>timedatectl set-timezone Asia/Shanghai</span></span>
<span class="line"><span># 24小时制</span></span>
<span class="line"><span>localectl set-locale LC_TIME=en_GB.UTF-8</span></span>
<span class="line"><span></span></span>
<span class="line"><span>yum install chrony -y</span></span>
<span class="line"><span>cat &gt; /etc/chrony.conf &lt;&lt; EOF </span></span>
<span class="line"><span># 从公网同步</span></span>
<span class="line"><span>pool ntp.aliyun.com iburst</span></span>
<span class="line"><span># 指定使用ntp.aliyun.com作为时间服务器池，iburst选项表示在初始同步时会发送多个请求以加快同步速度</span></span>
<span class="line"><span>driftfile /var/lib/chrony/drift</span></span>
<span class="line"><span># 当系统时间与服务器时间偏差大于1秒时，会以1秒的步长进行调整。如果偏差超过3秒，则立即进行时间调整</span></span>
<span class="line"><span>makestep 1.0 3</span></span>
<span class="line"><span># 启用硬件时钟同步功能，可以提高时钟的准确性</span></span>
<span class="line"><span>rtcsync</span></span>
<span class="line"><span># 允许10.20.13.0/24网段范围内的主机与chrony进行时间同步</span></span>
<span class="line"><span>allow 0.0.0.0/24</span></span>
<span class="line"><span># 将本地时钟设为stratum 10，stratum值表示时钟的准确度，值越小表示准确度越高</span></span>
<span class="line"><span>local stratum 10</span></span>
<span class="line"><span># 指定使用的密钥文件路径，用于对时间同步进行身份验证</span></span>
<span class="line"><span>keyfile /etc/chrony.keys</span></span>
<span class="line"><span># 指定时区为UTC</span></span>
<span class="line"><span>leapsectz right/UTC</span></span>
<span class="line"><span># 指定日志文件存放目录</span></span>
<span class="line"><span>logdir /var/log/chrony</span></span>
<span class="line"><span>EOF</span></span>
<span class="line"><span>systemctl restart chronyd ; systemctl enable chronyd</span></span>
<span class="line"><span></span></span>
<span class="line"><span># 客户端</span></span>
<span class="line"><span>yum install chrony -y</span></span>
<span class="line"><span>cat &gt; /etc/chrony.conf &lt;&lt; EOF </span></span>
<span class="line"><span># 从服务端同步</span></span>
<span class="line"><span>pool 172.25.2.4 iburst</span></span>
<span class="line"><span># 指定使用ntp.aliyun.com作为时间服务器池，iburst选项表示在初始同步时会发送多个请求以加快同步速度</span></span>
<span class="line"><span>driftfile /var/lib/chrony/drift</span></span>
<span class="line"><span># 当系统时间与服务器时间偏差大于1秒时，会以1秒的步长进行调整。如果偏差超过3秒，则立即进行时间调整</span></span>
<span class="line"><span>makestep 1.0 3</span></span>
<span class="line"><span># 启用硬件时钟同步功能，可以提高时钟的准确性</span></span>
<span class="line"><span>rtcsync</span></span>
<span class="line"><span># 指定使用的密钥文件路径，用于对时间同步进行身份验证</span></span>
<span class="line"><span>keyfile /etc/chrony.keys</span></span>
<span class="line"><span># 指定时区为UTC</span></span>
<span class="line"><span>leapsectz right/UTC</span></span>
<span class="line"><span># 指定日志文件存放目录</span></span>
<span class="line"><span>logdir /var/log/chrony</span></span>
<span class="line"><span>EOF</span></span>
<span class="line"><span>systemctl restart chronyd ; systemctl enable chronyd</span></span>
<span class="line"><span></span></span>
<span class="line"><span>#使用客户端进行验证</span></span>
<span class="line"><span>chronyc sources -v</span></span></code></pre></div><h4 id="关闭防火墙" tabindex="-1"><strong>关闭防火墙</strong> <a class="header-anchor" href="#关闭防火墙" aria-label="Permalink to &quot;**关闭防火墙**&quot;">​</a></h4><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span># 关闭防火墙</span></span>
<span class="line"><span>iptables -F &amp;&amp; iptables -t nat -F &amp;&amp; iptables -t mangle -F &amp;&amp; iptables -X &amp;&amp; iptables -P FORWARD ACCEPT</span></span>
<span class="line"><span>systemctl disable firewalld --now</span></span></code></pre></div><h4 id="禁用selinux" tabindex="-1"><strong>禁用SELinux</strong> <a class="header-anchor" href="#禁用selinux" aria-label="Permalink to &quot;**禁用SELinux**&quot;">​</a></h4><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span># 禁用selinux</span></span>
<span class="line"><span>setenforce 0</span></span>
<span class="line"><span>sed -i &#39;s/^SELINUX=enforcing$/SELINUX=disabled/g&#39; /etc/selinux/config</span></span></code></pre></div><h4 id="关闭swap" tabindex="-1"><strong>关闭swap</strong> <a class="header-anchor" href="#关闭swap" aria-label="Permalink to &quot;**关闭swap**&quot;">​</a></h4><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span># 临时关闭swap</span></span>
<span class="line"><span>swapoff -a</span></span>
<span class="line"><span># 永久关闭swap</span></span>
<span class="line"><span>sed -i &#39;s/.*swap.*/#&amp;/g&#39; /etc/fstab</span></span></code></pre></div><h4 id="安装系统工具" tabindex="-1"><strong>安装系统工具</strong> <a class="header-anchor" href="#安装系统工具" aria-label="Permalink to &quot;**安装系统工具**&quot;">​</a></h4><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>yum update -y &amp;&amp; yum -y install wget psmisc jq vim net-tools nfs-utils telnet yum-utils device-mapper-persistent-data lvm2 git tar curl</span></span></code></pre></div><h4 id="加载ipvs模块" tabindex="-1"><strong>加载IPVS模块</strong> <a class="header-anchor" href="#加载ipvs模块" aria-label="Permalink to &quot;**加载IPVS模块**&quot;">​</a></h4><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>yum install ipvsadm ipset sysstat conntrack libseccomp -y</span></span>
<span class="line"><span>cat &gt; /etc/modules-load.d/k8s.conf &lt;&lt;EOF </span></span>
<span class="line"><span># IPVS 是 Linux 内核中的一个模块，用于实现负载均衡和高可用性。它通过在前端代理服务器上分发传入请求到后端实际服务器上，提供了高性能和可扩展的网络服务</span></span>
<span class="line"><span>ip_vs</span></span>
<span class="line"><span># IPVS 轮询调度算法</span></span>
<span class="line"><span>ip_vs_rr</span></span>
<span class="line"><span># IPVS 加权轮询调度算法</span></span>
<span class="line"><span>ip_vs_wrr</span></span>
<span class="line"><span># IPVS 哈希调度算法</span></span>
<span class="line"><span>ip_vs_sh</span></span>
<span class="line"><span># overlay是containerd默认使用的存储驱动，它提供了一种轻量级的、可堆叠的、逐层增量的文件系统,它通过在现有文件系统上叠加文件系统层来创建容器的文件系统视图。每个容器可以有自己的一组文件系统层，这些层可以共享基础镜像中的文件，并在容器内部进行修改。使用overlay可以有效地使用磁盘空间，并使容器更加轻量级</span></span>
<span class="line"><span>overlay</span></span>
<span class="line"><span># nf_conntrack用于跟踪和管理网络连接，包括 TCP、UDP 和 ICMP 等协议。它是实现防火墙状态跟踪的基础</span></span>
<span class="line"><span>nf_conntrack</span></span>
<span class="line"><span># ip_tables提供了对 Linux 系统 IP 数据包过滤和网络地址转换（NAT）功能的支持</span></span>
<span class="line"><span>ip_tables</span></span>
<span class="line"><span># 扩展了 iptables 的功能，支持更高效的 IP 地址集合操作</span></span>
<span class="line"><span>ip_set</span></span>
<span class="line"><span># 扩展了 iptables 的功能，支持更高效的数据包匹配和操作</span></span>
<span class="line"><span>xt_set</span></span>
<span class="line"><span># 用户空间工具，用于配置和管理 xt_set 内核模块</span></span>
<span class="line"><span>ipt_set</span></span>
<span class="line"><span># 用于实现反向路径过滤，用于防止 IP 欺骗和 DDoS 攻击</span></span>
<span class="line"><span>ipt_rpfilter</span></span>
<span class="line"><span># 用于拒绝 IP 数据包，并向发送方发送响应，指示数据包被拒绝</span></span>
<span class="line"><span>ipt_REJECT</span></span>
<span class="line"><span># 用于实现 IP 封装在 IP（IP-over-IP）的隧道功能。它可以在不同网络之间创建虚拟隧道来传输 IP 数据包</span></span>
<span class="line"><span>ipip</span></span>
<span class="line"><span>EOF</span></span>
<span class="line"><span></span></span>
<span class="line"><span>systemctl restart systemd-modules-load.service</span></span></code></pre></div><h4 id="配置ulimit" tabindex="-1"><strong>配置ulimit</strong> <a class="header-anchor" href="#配置ulimit" aria-label="Permalink to &quot;**配置ulimit**&quot;">​</a></h4><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>ulimit -SHn 65535</span></span>
<span class="line"><span>cat &gt; /etc/security/limits.conf &lt;&lt;EOF</span></span>
<span class="line"><span># soft表示软限制，nofile表示一个进程可打开的最大文件数，默认值为1024。这里的软限制设置为655360，即一个进程可打开的最大文件数为655360</span></span>
<span class="line"><span>* soft nofile 655360</span></span>
<span class="line"><span># hard表示硬限制，即系统设置的最大值。nofile表示一个进程可打开的最大文件数，默认值为4096。这里的硬限制设置为131072，即系统设置的最大文件数为131072</span></span>
<span class="line"><span>* hard nofile 131072</span></span>
<span class="line"><span># nproc表示一个用户可创建的最大进程数，默认值为30720。即一个用户可创建的最大进程数为655350</span></span>
<span class="line"><span>* soft nproc 655350</span></span>
<span class="line"><span># nproc表示一个用户可创建的最大进程数，默认值为4096。即系统设置的最大进程数为655350</span></span>
<span class="line"><span>* hard nproc 655350</span></span>
<span class="line"><span># memlock表示一个进程可锁定在RAM中的最大内存，默认值为64 KB。这里的软限制设置为unlimited，即一个进程可锁定的最大内存为无限制</span></span>
<span class="line"><span>* seft memlock unlimited</span></span>
<span class="line"><span># memlock表示一个进程可锁定在RAM中的最大内存，默认值为64 KB。即系统设置的最大内存锁定为无限制</span></span>
<span class="line"><span>* hard memlock unlimitedd</span></span>
<span class="line"><span>EOF</span></span></code></pre></div><h4 id="修改内核参数" tabindex="-1"><strong>修改内核参数</strong> <a class="header-anchor" href="#修改内核参数" aria-label="Permalink to &quot;**修改内核参数**&quot;">​</a></h4><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>cat &gt; /etc/sysctl.d/k8s.conf &lt;&lt; EOF</span></span>
<span class="line"><span># 启用了IPv4的IP转发功能，允许服务器作为网络路由器转发数据包</span></span>
<span class="line"><span>net.ipv4.ip_forward = 1</span></span>
<span class="line"><span># 当使用网络桥接技术时，将数据包传递到iptables进行处理</span></span>
<span class="line"><span>net.bridge.bridge-nf-call-iptables = 1</span></span>
<span class="line"><span># 当该参数设置为1时，IPv6数据包将被传递到ip6tables进行处理；当该参数设置为0时，IPv6数据包将绕过ip6tables直接传递。默认情况下，这个参数的值是1</span></span>
<span class="line"><span>net.bridge.bridge-nf-call-ip6tables = 1</span></span>
<span class="line"><span># 允许在挂载文件系统时，允许被其他进程使用</span></span>
<span class="line"><span>fs.may_detach_mounts = 1</span></span>
<span class="line"><span># 允许原始的内存过量分配策略，当系统的内存已经被完全使用时，系统仍然会分配额外的内存</span></span>
<span class="line"><span>vm.overcommit_memory=1</span></span>
<span class="line"><span># 当系统内存不足（OOM）时，禁用系统崩溃和重启</span></span>
<span class="line"><span>vm.panic_on_oom=0</span></span>
<span class="line"><span># 设置系统允许一个用户的inotify实例可以监控的文件数目的上限</span></span>
<span class="line"><span>fs.inotify.max_user_watches=89100</span></span>
<span class="line"><span># 设置系统同时打开的文件数的上限</span></span>
<span class="line"><span>fs.file-max=52706963</span></span>
<span class="line"><span># 设置系统同时打开的文件描述符数的上限</span></span>
<span class="line"><span>fs.nr_open=52706963</span></span>
<span class="line"><span># 设置系统可以创建的网络连接跟踪表项的最大数量</span></span>
<span class="line"><span>net.netfilter.nf_conntrack_max=2310720</span></span>
<span class="line"><span># 设置TCP套接字的空闲超时时间（秒），超过该时间没有活动数据时，内核会发送心跳包</span></span>
<span class="line"><span>net.ipv4.tcp_keepalive_time = 600</span></span>
<span class="line"><span># 设置未收到响应的TCP心跳探测次数</span></span>
<span class="line"><span>net.ipv4.tcp_keepalive_probes = 3</span></span>
<span class="line"><span># 设置TCP心跳探测的时间间隔（秒）</span></span>
<span class="line"><span>net.ipv4.tcp_keepalive_intvl =15</span></span>
<span class="line"><span># 设置系统可以使用的TIME_WAIT套接字的最大数量</span></span>
<span class="line"><span>net.ipv4.tcp_max_tw_buckets = 36000</span></span>
<span class="line"><span># 启用TIME_WAIT套接字的重新利用，允许新的套接字使用旧的TIME_WAIT套接字</span></span>
<span class="line"><span>net.ipv4.tcp_tw_reuse = 1</span></span>
<span class="line"><span># 设置系统可以同时存在的TCP套接字垃圾回收包裹数的最大数量</span></span>
<span class="line"><span>net.ipv4.tcp_max_orphans = 327680</span></span>
<span class="line"><span># 设置系统对于孤立的TCP套接字的重试次数</span></span>
<span class="line"><span>net.ipv4.tcp_orphan_retries = 3</span></span>
<span class="line"><span># 启用TCP SYN cookies保护，用于防止SYN洪泛攻击</span></span>
<span class="line"><span>net.ipv4.tcp_syncookies = 1</span></span>
<span class="line"><span># 设置新的TCP连接的半连接数（半连接队列）的最大长度</span></span>
<span class="line"><span>net.ipv4.tcp_max_syn_backlog = 16384</span></span>
<span class="line"><span># 设置系统可以创建的网络连接跟踪表项的最大数量</span></span>
<span class="line"><span>net.ipv4.ip_conntrack_max = 65536</span></span>
<span class="line"><span># 关闭TCP时间戳功能，用于提供更好的安全性</span></span>
<span class="line"><span>net.ipv4.tcp_timestamps = 0</span></span>
<span class="line"><span># 设置系统核心层的连接队列的最大值</span></span>
<span class="line"><span>net.core.somaxconn = 16384</span></span>
<span class="line"><span></span></span>
<span class="line"><span># 启用IPv6协议</span></span>
<span class="line"><span>net.ipv6.conf.all.disable_ipv6 = 0</span></span>
<span class="line"><span># 启用IPv6协议</span></span>
<span class="line"><span>net.ipv6.conf.default.disable_ipv6 = 0</span></span>
<span class="line"><span># 启用IPv6协议</span></span>
<span class="line"><span>net.ipv6.conf.lo.disable_ipv6 = 0</span></span>
<span class="line"><span># 允许IPv6数据包转发</span></span>
<span class="line"><span>net.ipv6.conf.all.forwarding = 1</span></span>
<span class="line"><span>EOF</span></span>
<span class="line"><span></span></span>
<span class="line"><span>sysctl --system</span></span></code></pre></div><h3 id="安装containerd" tabindex="-1"><strong>安装containerd</strong> <a class="header-anchor" href="#安装containerd" aria-label="Permalink to &quot;**安装containerd**&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span># 安装系统工具</span></span>
<span class="line"><span>yum install -y yum-utils device-mapper-persistent-data lvm2</span></span>
<span class="line"><span>yum-config-manager --add-repo https://mirrors.aliyun.com/docker-ce/linux/centos/docker-ce.repo</span></span>
<span class="line"><span># 修改阿里源地址</span></span>
<span class="line"><span>sed -i &#39;s+download.docker.com+mirrors.aliyun.com/docker-ce+&#39; /etc/yum.repos.d/docker-ce.repo</span></span>
<span class="line"><span>yum -y install containerd</span></span>
<span class="line"><span>systemctl enable containerd --now</span></span>
<span class="line"><span>containerd -v</span></span></code></pre></div><h4 id="加载模块" tabindex="-1"><strong>加载模块</strong> <a class="header-anchor" href="#加载模块" aria-label="Permalink to &quot;**加载模块**&quot;">​</a></h4><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>cat &gt; /etc/modules-load.d/containerd.conf &lt;&lt; EOF</span></span>
<span class="line"><span>overlay</span></span>
<span class="line"><span>br_netfilter</span></span>
<span class="line"><span>EOF</span></span>
<span class="line"><span>systemctl restart systemd-modules-load</span></span></code></pre></div><h4 id="修改内核参数-1" tabindex="-1"><strong>修改内核参数</strong> <a class="header-anchor" href="#修改内核参数-1" aria-label="Permalink to &quot;**修改内核参数**&quot;">​</a></h4><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>cat &gt; /etc/sysctl.d/99-kubernetes-cri.conf &lt;&lt; EOF</span></span>
<span class="line"><span>net.bridge.bridge-nf-call-iptables  = 1</span></span>
<span class="line"><span>net.ipv4.ip_forward                 = 1</span></span>
<span class="line"><span>net.bridge.bridge-nf-call-ip6tables = 1</span></span>
<span class="line"><span>EOF</span></span>
<span class="line"><span>sysctl --system</span></span></code></pre></div><h4 id="修改配置文件" tabindex="-1"><strong>修改配置文件</strong> <a class="header-anchor" href="#修改配置文件" aria-label="Permalink to &quot;**修改配置文件**&quot;">​</a></h4><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>mkdir -p /etc/containerd</span></span>
<span class="line"><span># 生成默认配置文件</span></span>
<span class="line"><span>containerd config default &gt; /etc/containerd/config.toml</span></span>
<span class="line"><span># SystemdCgroup参数的作用是为了确保containerd能够正确地管理容器的资源使用，以实现资源的限制、隔离和公平分配</span></span>
<span class="line"><span>sed -i &quot;s#SystemdCgroup\\ \\=\\ false#SystemdCgroup\\ \\=\\ true#g&quot; /etc/containerd/config.toml</span></span>
<span class="line"><span># 修改镜像拉取地址为国内地址，这里是pause镜像地址</span></span>
<span class="line"><span>sed -i &quot;s#registry.k8s.io#registry.aliyuncs.com/google_containers#g&quot; /etc/containerd/config.toml</span></span>
<span class="line"><span># 指定配置文件目录</span></span>
<span class="line"><span>sed -i &quot;s#config_path\\ \\=\\ \\&quot;\\&quot;#config_path\\ \\=\\ \\&quot;/etc/containerd/registry\\&quot;#g&quot; /etc/containerd/config.toml</span></span>
<span class="line"><span>sed -i &#39;s/pause:3.6/pause:3.9/g&#39;  /etc/containerd/config.toml</span></span>
<span class="line"><span># 设置镜像加速</span></span>
<span class="line"><span>mkdir /etc/containerd/registry/docker.io -pv</span></span>
<span class="line"><span>cat &gt; /etc/containerd/registry/docker.io/hosts.toml &lt;&lt; EOF</span></span>
<span class="line"><span>server = &quot;https://docker.io&quot;</span></span>
<span class="line"><span>[host.&quot;https://docker.m.daocloud.io&quot;]</span></span>
<span class="line"><span>  capabilities = [&quot;pull&quot;, &quot;resolve&quot;]</span></span>
<span class="line"><span>[host.&quot;https://xk9ak4u9.mirror.aliyuncs.com&quot;]</span></span>
<span class="line"><span>  capabilities = [&quot;pull&quot;,&quot;resolve&quot;]</span></span>
<span class="line"><span>[host.&quot;https://dockerproxy.com&quot;]</span></span>
<span class="line"><span>  capabilities = [&quot;pull&quot;, &quot;resolve&quot;]</span></span>
<span class="line"><span>[host.&quot;https://docker.mirrors.sjtug.sjtu.edu.cn&quot;]</span></span>
<span class="line"><span>  capabilities = [&quot;pull&quot;,&quot;resolve&quot;]</span></span>
<span class="line"><span>[host.&quot;https://docker.mirrors.ustc.edu.cn&quot;]</span></span>
<span class="line"><span>  capabilities = [&quot;pull&quot;,&quot;resolve&quot;]</span></span>
<span class="line"><span>[host.&quot;https://docker.nju.edu.cn&quot;] </span></span>
<span class="line"><span>  capabilities = [&quot;pull&quot;,&quot;resolve&quot;]</span></span>
<span class="line"><span>[host.&quot;https://registry-1.docker.io&quot;]</span></span>
<span class="line"><span>  capabilities = [&quot;pull&quot;,&quot;resolve&quot;,&quot;push&quot;]</span></span>
<span class="line"><span>EOF</span></span>
<span class="line"><span></span></span>
<span class="line"><span>mkdir /etc/containerd/registry/gcr.io -pv</span></span>
<span class="line"><span>cat &gt; /etc/containerd/registry/gcr.io/hosts.toml &lt;&lt; EOF</span></span>
<span class="line"><span>server = &quot;https://gcr.io&quot;</span></span>
<span class="line"><span>[host.&quot;https://gcr.m.daocloud.io&quot;]</span></span>
<span class="line"><span>  capabilities = [&quot;pull&quot;, &quot;resolve&quot;]</span></span>
<span class="line"><span>EOF</span></span>
<span class="line"><span></span></span>
<span class="line"><span>mkdir /etc/containerd/registry/registry.k8s.io -pv</span></span>
<span class="line"><span>cat &gt; /etc/containerd/registry/registry.k8s.io/hosts.toml &lt;&lt; EOF</span></span>
<span class="line"><span>server = &quot;https://registry.k8s.io&quot;</span></span>
<span class="line"><span>[host.&quot;https://k8s.m.daocloud.io&quot;]</span></span>
<span class="line"><span>  capabilities = [&quot;pull&quot;, &quot;resolve&quot;]</span></span>
<span class="line"><span>EOF</span></span>
<span class="line"><span></span></span>
<span class="line"><span>mkdir /etc/containerd/registry/k8s.gcr.io -pv</span></span>
<span class="line"><span>cat &gt; /etc/containerd/registry/k8s.gcr.io/hosts.toml &lt;&lt; EOF</span></span>
<span class="line"><span>server = &quot;https://k8s.gcr.io&quot;</span></span>
<span class="line"><span>[host.&quot;https://k8s.m.daocloud.io&quot;]</span></span>
<span class="line"><span>  capabilities = [&quot;pull&quot;, &quot;resolve&quot;]</span></span>
<span class="line"><span>EOF</span></span>
<span class="line"><span></span></span>
<span class="line"><span>mkdir /etc/containerd/registry/quay.io -pv</span></span>
<span class="line"><span>cat &gt; /etc/containerd/registry/quay.io/hosts.toml &lt;&lt; EOF</span></span>
<span class="line"><span>server = &quot;https://quay.io&quot;</span></span>
<span class="line"><span>[host.&quot;https://quay.m.daocloud.io&quot;]</span></span>
<span class="line"><span>  capabilities = [&quot;pull&quot;, &quot;resolve&quot;]</span></span>
<span class="line"><span>EOF</span></span></code></pre></div><h4 id="启动并设置开机自启" tabindex="-1"><strong>启动并设置开机自启</strong> <a class="header-anchor" href="#启动并设置开机自启" aria-label="Permalink to &quot;**启动并设置开机自启**&quot;">​</a></h4><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>systemctl daemon-reload</span></span>
<span class="line"><span>systemctl enable containerd --now</span></span>
<span class="line"><span>systemctl restart containerd</span></span>
<span class="line"><span>systemctl status containerd</span></span></code></pre></div><h4 id="安装crictl" tabindex="-1"><strong>安装crictl</strong> <a class="header-anchor" href="#安装crictl" aria-label="Permalink to &quot;**安装crictl**&quot;">​</a></h4><p>下载地址：<a href="https://github.com/kubernetes-sigs/cri-tools/releases" target="_blank" rel="noreferrer">Releases · kubernetes-sigs/cri-tools (</a><a href="http://github.com" target="_blank" rel="noreferrer">github.com</a><a href="https://github.com/kubernetes-sigs/cri-tools/releases" target="_blank" rel="noreferrer">)</a></p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>wget https://github.com/kubernetes-sigs/cri-tools/releases/download/v1.30.0/crictl-v1.30.0-linux-amd64.tar.gz</span></span>
<span class="line"><span>tar -zxf crictl-v1.30.0-linux-amd64.tar.gz </span></span>
<span class="line"><span>mv crictl /usr/local/bin/</span></span>
<span class="line"><span>cat &gt; /etc/crictl.yaml &lt;&lt;EOF</span></span>
<span class="line"><span>runtime-endpoint: unix:///var/run/containerd/containerd.sock</span></span>
<span class="line"><span>image-endpoint: unix:///var/run/containerd/containerd.sock</span></span>
<span class="line"><span>timeout: 10</span></span>
<span class="line"><span>debug: false</span></span>
<span class="line"><span>pull-image-on-create: false</span></span>
<span class="line"><span>EOF</span></span></code></pre></div><h4 id="安装kube-vip" tabindex="-1"><strong>安装Kube-vip</strong> <a class="header-anchor" href="#安装kube-vip" aria-label="Permalink to &quot;**安装Kube-vip**&quot;">​</a></h4><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span># 设置vip，前提先ping一下，确保IP没有被占用</span></span>
<span class="line"><span>export VIP=172.25.2.50</span></span>
<span class="line"><span># 指定网卡</span></span>
<span class="line"><span>export INTERFACE=ens5f0</span></span>
<span class="line"><span># 获取最新版本</span></span>
<span class="line"><span># KVVERSION=$(curl -sL https://api.github.com/repos/kube-vip/kube-vip/releases | jq -r &quot;.[0].name&quot;)</span></span>
<span class="line"><span># 或者指定版本（这个版本目前比较稳定，不会出现报错）</span></span>
<span class="line"><span>export KVVERSION=v0.6.4</span></span>
<span class="line"><span># 安装kube-vip镜像</span></span>
<span class="line"><span># ctr image pull ghcr.io/kube-vip/kube-vip:$KVVERSION; </span></span>
<span class="line"><span>alias kube-vip=&quot;ctr run --rm --net-host ghcr.io/kube-vip/kube-vip:$KVVERSION vip /kube-vip&quot;</span></span>
<span class="line"><span># 生成清单文件</span></span>
<span class="line"><span>mkdir -p /etc/kubernetes/manifests</span></span>
<span class="line"><span></span></span>
<span class="line"><span>kube-vip manifest pod \\</span></span>
<span class="line"><span>    --interface $INTERFACE \\</span></span>
<span class="line"><span>    --address $VIP \\</span></span>
<span class="line"><span>    --controlplane \\</span></span>
<span class="line"><span>    --services \\</span></span>
<span class="line"><span>    --arp \\</span></span>
<span class="line"><span>    --leaderElection | tee /etc/kubernetes/manifests/kube-vip.yaml</span></span>
<span class="line"><span># 1.29版本以后需要对kube-vip修改kubernetes客户端路径</span></span>
<span class="line"><span>sed -i &#39;s#path: /etc/kubernetes/admin.conf#path: /etc/kubernetes/super-admin.conf#&#39; \\</span></span>
<span class="line"><span>          /etc/kubernetes/manifests/kube-vip.yaml</span></span></code></pre></div><h3 id="安装k8s工具" tabindex="-1"><strong>安装k8s工具</strong> <a class="header-anchor" href="#安装k8s工具" aria-label="Permalink to &quot;**安装k8s工具**&quot;">​</a></h3><p>版本查看：<a href="https://mirrors.aliyun.com/kubernetes-new/core/stable/" target="_blank" rel="noreferrer">kubernetes-new-core-stable安装包下载_开源镜像站-阿里云 (</a><a href="http://aliyun.com" target="_blank" rel="noreferrer">aliyun.com</a><a href="https://mirrors.aliyun.com/kubernetes-new/core/stable/" target="_blank" rel="noreferrer">)</a></p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span># 指定安装的k8s工具版本</span></span>
<span class="line"><span>export k8sVersion=v1.30</span></span>
<span class="line"><span>cat &gt; /etc/yum.repos.d/kubernetes.repo &lt;&lt; EOF</span></span>
<span class="line"><span>[kubernetes]</span></span>
<span class="line"><span>name=Kubernetes</span></span>
<span class="line"><span>baseurl=https://mirrors.aliyun.com/kubernetes-new/core/stable/$k8sVersion/rpm/</span></span>
<span class="line"><span>enabled=1</span></span>
<span class="line"><span>gpgcheck=1</span></span>
<span class="line"><span>gpgkey=https://mirrors.aliyun.com/kubernetes-new/core/stable/$k8sVersion/rpm/repodata/repomd.xml.key</span></span>
<span class="line"><span>EOF</span></span>
<span class="line"><span>yum install -y kubelet kubeadm kubectl</span></span>
<span class="line"><span>systemctl enable kubelet --now</span></span></code></pre></div><h3 id="初始化k8s" tabindex="-1"><strong>初始化k8s</strong> <a class="header-anchor" href="#初始化k8s" aria-label="Permalink to &quot;**初始化k8s**&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>cat &gt; kubeadm.yml &lt;&lt; EOF</span></span>
<span class="line"><span>apiVersion: kubeadm.k8s.io/v1beta3</span></span>
<span class="line"><span>bootstrapTokens:</span></span>
<span class="line"><span>- groups:</span></span>
<span class="line"><span>  - system:bootstrappers:kubeadm:default-node-token</span></span>
<span class="line"><span>  token: abcdef.0123456789abcdef</span></span>
<span class="line"><span>  ttl: 24h0m0s</span></span>
<span class="line"><span>  usages:</span></span>
<span class="line"><span>  - signing</span></span>
<span class="line"><span>  - authentication</span></span>
<span class="line"><span>kind: InitConfiguration</span></span>
<span class="line"><span>localAPIEndpoint:</span></span>
<span class="line"><span>  advertiseAddress: 172.25.2.4 # 修改自己的ip</span></span>
<span class="line"><span>  bindPort: 6443</span></span>
<span class="line"><span>nodeRegistration:</span></span>
<span class="line"><span>  criSocket: unix:///var/run/containerd/containerd.sock</span></span>
<span class="line"><span>  imagePullPolicy: IfNotPresent</span></span>
<span class="line"><span>  name: k8s-h3c-master01 # 本机的主机名</span></span>
<span class="line"><span>  taints:</span></span>
<span class="line"><span>  - effect: NoSchedule</span></span>
<span class="line"><span>    key: node-role.kubernetes.io/k8s-master</span></span>
<span class="line"><span>---</span></span>
<span class="line"><span>apiServer:</span></span>
<span class="line"><span>  certSANs:</span></span>
<span class="line"><span>  - 127.0.0.1</span></span>
<span class="line"><span>  - 172.25.2.50 # vip</span></span>
<span class="line"><span>  - 172.25.2.4 # master01</span></span>
<span class="line"><span>  - 172.25.2.5 # master02</span></span>
<span class="line"><span>  - 172.25.2.6 # master03</span></span>
<span class="line"><span>  timeoutForControlPlane: 4m0s</span></span>
<span class="line"><span>apiVersion: kubeadm.k8s.io/v1beta3</span></span>
<span class="line"><span>certificatesDir: /etc/kubernetes/pki</span></span>
<span class="line"><span>clusterName: kubernetes</span></span>
<span class="line"><span># 控制平面高可用入口，所有的高可用操作，最终都是为了这个位置的ip</span></span>
<span class="line"><span>controlPlaneEndpoint: 172.25.2.50:6443</span></span>
<span class="line"><span>controllerManager: {}</span></span>
<span class="line"><span>dns: {}</span></span>
<span class="line"><span>etcd:</span></span>
<span class="line"><span>  local:</span></span>
<span class="line"><span>    dataDir: /var/lib/etcd</span></span>
<span class="line"><span>imageRepository: registry.aliyuncs.com/google_containers</span></span>
<span class="line"><span>kind: ClusterConfiguration</span></span>
<span class="line"><span>kubernetesVersion: v1.30.2</span></span>
<span class="line"><span>networking:</span></span>
<span class="line"><span>  dnsDomain: cluster.local</span></span>
<span class="line"><span>  podSubnet: 10.244.0.0/16</span></span>
<span class="line"><span>  serviceSubnet: 10.96.0.0/12</span></span>
<span class="line"><span>scheduler: {}</span></span>
<span class="line"><span>---</span></span>
<span class="line"><span># 配置ipvs</span></span>
<span class="line"><span>apiVersion: kubeproxy.config.k8s.io/v1alpha1</span></span>
<span class="line"><span>kind: KubeProxyConfiguration</span></span>
<span class="line"><span>mode: ipvs</span></span>
<span class="line"><span>---</span></span>
<span class="line"><span># 指定cgroup为systemd</span></span>
<span class="line"><span>apiVersion: kubelet.config.k8s.io/v1beta1</span></span>
<span class="line"><span>kind: KubeletConfiguration</span></span>
<span class="line"><span>cgroupDriver: systemd</span></span>
<span class="line"><span>EOF</span></span>
<span class="line"><span># 查看所需镜像列表</span></span>
<span class="line"><span>kubeadm config images list --config kubeadm.yml</span></span>
<span class="line"><span># 预拉取镜像</span></span>
<span class="line"><span>kubeadm config images pull --config kubeadm.yml</span></span>
<span class="line"><span># 初始化</span></span>
<span class="line"><span>kubeadm init --config=kubeadm.yml --upload-certs</span></span>
<span class="line"><span># 配置 kubectl</span></span>
<span class="line"><span>mkdir -p $HOME/.kube</span></span>
<span class="line"><span>sudo cp -i /etc/kubernetes/admin.conf $HOME/.kube/config</span></span>
<span class="line"><span>sudo chown $(id -u):$(id -g) $HOME/.kube/config</span></span></code></pre></div><h4 id="安装命令自动补齐" tabindex="-1"><strong>安装命令自动补齐</strong> <a class="header-anchor" href="#安装命令自动补齐" aria-label="Permalink to &quot;**安装命令自动补齐**&quot;">​</a></h4><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>yum install bash-completion -y</span></span>
<span class="line"><span>source /usr/share/bash-completion/bash_completion</span></span>
<span class="line"><span>source &lt;(kubectl completion bash)</span></span>
<span class="line"><span>echo &quot;source &lt;(kubectl completion bash)&quot; &gt;&gt; ~/.bashrc</span></span></code></pre></div><h4 id="新增工作节点" tabindex="-1"><strong>新增工作节点</strong> <a class="header-anchor" href="#新增工作节点" aria-label="Permalink to &quot;**新增工作节点**&quot;">​</a></h4><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span># 生成加入节点命令</span></span>
<span class="line"><span>kubeadm token create --print-join-command</span></span></code></pre></div><h4 id="新增控制节点" tabindex="-1"><strong>新增控制节点</strong> <a class="header-anchor" href="#新增控制节点" aria-label="Permalink to &quot;**新增控制节点**&quot;">​</a></h4><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span># 生成加入节点命令</span></span>
<span class="line"><span>kubeadm token create --print-join-command</span></span>
<span class="line"><span># 生成控制节点certificate-key </span></span>
<span class="line"><span>kubeadm init phase upload-certs --upload-certs</span></span></code></pre></div><p>通过<code>--control-plane --certificate-key</code>拼接命令</p><blockquote><p>kubeadm join 10.20.13.100:6443 --token abcdef.0123456789abcdef --discovery-token-ca-cert-hash sha256:xxxxxxxxxxxxxx <strong>--control-plane --certificate-key</strong> xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx</p></blockquote><h3 id="安装cni网络插件" tabindex="-1"><strong>安装CNI网络插件</strong> <a class="header-anchor" href="#安装cni网络插件" aria-label="Permalink to &quot;**安装CNI网络插件**&quot;">​</a></h3><p>Calico：<a href="https://sreok.cn/archives/b72d4657-a17a-4209-a4fd-b631e7d06422" target="_blank" rel="noreferrer">CNI插件-使用calico支持IPv4/IPv6双协议栈 - (</a><a href="http://sreok.cn" target="_blank" rel="noreferrer">sreok.cn</a><a href="https://sreok.cn/archives/b72d4657-a17a-4209-a4fd-b631e7d06422" target="_blank" rel="noreferrer">)</a></p>`,49),i=[l];function t(c,o,r,d,u,h){return a(),n("div",null,i)}const m=s(e,[["render",t]]);export{g as __pageData,m as default};