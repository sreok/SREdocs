# 【k8s高可用方案】使用Keepalived + Haproxy作为控制平面负载入口

### 安装keepalived

```
yum -y install keepalived
cat > /etc/keepalived/keepalived.conf << EOF
! Configuration File for keepalived

global_defs {
   router_id LVS_DEVEL
}

vrrp_script chk_haproxy {
  script "killall -0 haproxy"
  interval 2
  weight -3
  fall 1
  rise 2
  timeout 2
}

vrrp_instance VI_1 {
    state MASTER  # 其他节点为BACKUP
    interface ens5f0  # 网卡
    virtual_router_id 60 # id与其他keepalived节点一致
    priority 100   # 初始化权重，一致即可，不影响
    advert_int 1
    authentication {
        auth_type PASS
        auth_pass 1111  # 密码与其他keepalived节点一致
    }
    unicast_src_ip 172.25.2.4 # 本机ip
    unicast_peer {
        172.25.2.5  # 其他keepalived节点ip
        172.25.2.6
    }
    virtual_ipaddress {
        172.25.2.50     # vip
    }
    track_script {
        chk_haproxy
    }
}
EOF
```

> 注释的地方，按需求修改
>
> 我这里的配置文件只需要修改如下
>
> `state`MASTER改为BACKUP
>
> `unicast_src_ip`修改为本机IP
>
> `unicast_peer`修改为其他keepalived节点（其他master节点）
>
> 其他位置不用动。

### 安装HAProxy

```
yum -y install haproxy
cat > /etc/haproxy/haproxy.cfg <<EOF
#---------------------------------------------------------------------
# Example configuration for a possible web application.  See the
# full configuration options online.
#
#   https://www.haproxy.org/download/1.8/doc/configuration.txt
#
#---------------------------------------------------------------------

#---------------------------------------------------------------------
# Global settings
#---------------------------------------------------------------------
global
    # to have these messages end up in /var/log/haproxy.log you will
    # need to:
    #
    # 1) configure syslog to accept network log events.  This is done
    #    by adding the '-r' option to the SYSLOGD_OPTIONS in
    #    /etc/sysconfig/syslog
    #
    # 2) configure local2 events to go to the /var/log/haproxy.log
    #   file. A line like the following can be added to
    #   /etc/sysconfig/syslog
    #
    #    local2.*                       /var/log/haproxy.log
    #
    log         127.0.0.1 local2

    chroot      /var/lib/haproxy
    pidfile     /var/run/haproxy.pid
    maxconn     4000
    user        haproxy
    group       haproxy
    daemon

    # turn on stats unix socket
    stats socket /var/lib/haproxy/stats

    # utilize system-wide crypto-policies
    ssl-default-bind-ciphers PROFILE=SYSTEM
    ssl-default-server-ciphers PROFILE=SYSTEM

#---------------------------------------------------------------------
# common defaults that all the 'listen' and 'backend' sections will
# use if not designated in their block
#---------------------------------------------------------------------
defaults
    mode                    http
    log                     global
    option                  httplog
    option                  dontlognull
    option http-server-close
    option forwardfor       except 127.0.0.0/8
    option                  redispatch
    retries                 3
    timeout http-request    10s
    timeout queue           1m
    timeout connect         10s
    timeout client          1m
    timeout server          1m
    timeout http-keep-alive 10s
    timeout check           10s
    maxconn                 3000

#---------------------------------------------------------------------
# main frontend which proxys to the backends
#---------------------------------------------------------------------
frontend apisever
    # 监听8443端口
    bind *:8443
    mode tcp
    option tcplog
    default_backend apiserver

#---------------------------------------------------------------------
# round robin balancing between the various backends
#---------------------------------------------------------------------
backend apiserver
    option httpchk GET /healthz
    http-check expect status 200
    mode tcp
    option ssl-hello-chk
    balance     roundrobin
        # apiserver节点
        server k8s-master01 172.25.2.4:6443 check
        server k8s-master02 172.25.2.5:6443 check
        server k8s-master03 172.25.2.6:6443 check
EOF
```

> 以上配置文件在master节点一致即可，不用额外修改

### 开启并开机自启

```
systemctl enable keepalived --now
systemctl enable haproxy --now
```

### 验证vip漂移

```
systemctl stop haproxy
# 5秒后漂移到其他节点
```
