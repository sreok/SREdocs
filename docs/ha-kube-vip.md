# 使用kube-vip作为控制平面负载入口

官方文档地址：[Static Pods | kube-vip](https://kube-vip.io/docs/installation/static/)

### 生成静态pod清单

在使用kubeadm部署集群前，在每个master节点生成静态pod清单

```
# 设置vip，前提先ping一下，确保IP没有被占用
export VIP=10.20.13.100
# 指定网卡
export INTERFACE=ens192
# 获取最新版本
# KVVERSION=$(curl -sL https://api.github.com/repos/kube-vip/kube-vip/releases | jq -r ".[0].name")
# 或者指定版本（这个版本目前比较稳定，不会出现报错）
export KVVERSION=v0.6.4
# 
alias kube-vip="ctr image pull ghcr.io/kube-vip/kube-vip:$KVVERSION; ctr run --rm --net-host ghcr.io/kube-vip/kube-vip:$KVVERSION vip /kube-vip"
# 生成清单文件
mkdir -p /etc/kubernetes/manifests

kube-vip manifest pod \
    --interface $INTERFACE \
    --address $VIP \
    --controlplane \
    --services \
    --arp \
    --leaderElection | tee /etc/kubernetes/manifests/kube-vip.yaml
```

或者直接创建清单文件

```
mkdir -p /etc/kubernetes/manifests

cat > /etc/kubernetes/manifests/kube-vip.yaml << EOF
apiVersion: v1
kind: Pod
metadata:
  creationTimestamp: null
  name: kube-vip
  namespace: kube-system
spec:
  containers:
  - args:
    - manager
    env:
      # 使用ARP协议
    - name: vip_arp
      value: "true"
    - name: port
      value: "6443"
    - name: vip_nodename
      valueFrom:
        fieldRef:
          fieldPath: spec.nodeName
    - name: vip_interface
      # 网卡名称
      value: ens192
    - name: vip_cidr
      value: "32"
    - name: dns_mode
      value: first
    - name: cp_enable
      value: "true"
    - name: cp_namespace
      value: kube-system
    - name: svc_enable
      value: "true"
    - name: svc_leasename
      value: plndr-svcs-lock
    - name: vip_leaderelection
      value: "true"
    - name: vip_leasename
      value: plndr-cp-lock
    - name: vip_leaseduration
      value: "5"
    - name: vip_renewdeadline
      value: "3"
    - name: vip_retryperiod
      value: "1"
    - name: address
      # vip地址
      value: 10.20.13.100
    - name: prometheus_server
      value: :2112
    image: ghcr.io/kube-vip/kube-vip:v0.6.4
    imagePullPolicy: IfNotPresent
    name: kube-vip
    resources: {}
    securityContext:
      capabilities:
        add:
        - NET_ADMIN
        - NET_RAW
    volumeMounts:
    - mountPath: /etc/kubernetes/admin.conf
      name: kubeconfig
  hostAliases:
  - hostnames:
    - kubernetes
    ip: 127.0.0.1
  hostNetwork: true
  volumes:
  - hostPath:
      path: /etc/kubernetes/admin.conf
    name: kubeconfig
status: {}
EOF
```

### 故障排查

报错：`error retrieving resource lock kube-system/plndr-cp-lock`

> 问题地址：
>
> [kube-vip 需要 super-admin.conf 和 Kubernetes 1.29 ·问题 #684 ·kube-vip/kube-vip ·GitHub上](https://github.com/kube-vip/kube-vip/issues/684)
>
> [从 Kubernetes v1.29 开始对 kube-vip 使用超级管理员 Kubeconfig 由 abhay-krishna ·拉取请求 #7368 ·aws/eks-anywhere ·GitHub上](https://github.com/aws/eks-anywhere/pull/7368)

解决方法：

```
# 1.29版本以后需要对kube-vip修改kubernetes客户端路径
sed -i 's#path: /etc/kubernetes/admin.conf#path: /etc/kubernetes/super-admin.conf#' \
          /etc/kubernetes/manifests/kube-vip.yaml
systemctl restart kubelet
# 部署后就可以使用以下命令恢复回来了
sed -i 's#path: /etc/kubernetes/super-admin.conf#path: /etc/kubernetes/admin.conf#' \
          /etc/kubernetes/manifests/kube-vip.yaml
systemctl restart kubelet
```

### **注意**

静态pod部署，主要适用于kubeadm集群，因为kubeadm创建集群的过程中需要使用虚拟ip，kube-vip还有daemonset方式，这里没用过不做讨论，以下是daemonset描述的原文直译：

```
一些Kubernetes发行版可以在不依赖预先存在的VIP（虚拟IP）的情况下创建Kubernetes集群（但它们也可以配置为支持VIP）。K3s就是一个典型的例子，它可以配置为启动并签署证书，以允许流量进入虚拟IP。鉴于我们不需要在集群创建之前存在VIP，我们可以启动K3s节点，然后将kube-vip作为所有控制平面节点的DaemonSet添加进去。
```
