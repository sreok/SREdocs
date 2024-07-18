import { defineConfig } from "vitepress";

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Elijah Blog",
  description: "专注于运维技术知识共享",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: "首页", link: "/" },
      { text: "文档", link: "/docs" },
    ],

    sidebar: [
      {
        text: "云原生",
        items: [
          {
            text: "Kubernetes",
            link: "/kubernetes",
            items: [
              {
                text: "部署",
                items: [
                  {
                    text: "Rocky 9.4 部署高可用集群",
                    link: "/deploy-kubernetes-ha-v1.30.2",
                  },
                ],
              },
              {
                text: "负载均衡",
                items: [
                  {
                    text: "使用kube-vip实现LoadBalancer(Layer2模式)",
                    link: "/lb-kubevip-loadbalancer",
                  },
                ],
              },
              {
                text: "高可用方案",
                items: [
                  {
                    text: "使用Keepalived + Haproxy作为控制平面负载入口",
                    link: "/ha-keepalived-haproxy",
                  },
                  {
                    text: "使用kube-vip作为控制平面负载入口",
                    link: "/ha-kube-vip",
                  },
                ],
              },
            ],
          },
        ],
        link: "/cloudnative",
      },
      {
        text: "云计算",
        items: [
          {
            text: "OpenStack T版部署(kolla方式)",
            link: "/openstack-t",
          },
          {
            text: "OpenStack Z版部署(kolla方式)",
            link: "/openstack-z",
          },
        ],
      },
      {
        text: "存储",
        items: [
          {
            text: "使用rook在k8s集群部署ceph(manifest方式)",
            link: "/rook-ceph",
          },
        ],
      },
      {
        text: "网络",
        items: [
          { text: "使用rook在k8s集群部署ceph(manifest方式)", link: "/docs" },
        ],
      },
      {
        text: "故障排除",
        items: [
          {
            text: "使用rook在k8s集群部署ceph(manifest方式)",
            link: "/bug-linux-disk",
          },
          {
            text: "Postgre启动失败: Bus error (core dumped)",
            link: "/bug-postgres",
          },
          {
            text: "kube-vip 与 MetalLB LoadBalancer Layer2 ARP冲突",
            link: "/bug-kubevip-metallb",
          },
        ],
      },
    ],

    socialLinks: [{ icon: "github", link: "https://github.com/sreok/docs" }],
  },
});
