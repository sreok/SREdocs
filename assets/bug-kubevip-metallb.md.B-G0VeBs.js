import{_ as a,c as e,o as s,a2 as t}from"./chunks/framework.U6HXpukZ.js";const n="/assets/image-hbrc.D0d8S0MP.png",i="/assets/image-xlnm.DqI0xJvt.png",k=JSON.parse('{"title":"kube-vip 与 MetalLB LoadBalancer Layer2 ARP冲突","description":"","frontmatter":{},"headers":[],"relativePath":"bug-kubevip-metallb.md","filePath":"bug-kubevip-metallb.md"}'),l={name:"bug-kubevip-metallb.md"},p=t('<h1 id="kube-vip-与-metallb-loadbalancer-layer2-arp冲突" tabindex="-1">kube-vip 与 MetalLB LoadBalancer Layer2 ARP冲突 <a class="header-anchor" href="#kube-vip-与-metallb-loadbalancer-layer2-arp冲突" aria-label="Permalink to &quot;kube-vip 与 MetalLB LoadBalancer Layer2 ARP冲突&quot;">​</a></h1><h3 id="问题描述" tabindex="-1">问题描述 <a class="header-anchor" href="#问题描述" aria-label="Permalink to &quot;问题描述&quot;">​</a></h3><p>在启动了kube-vip Layer2模式的kubernetes HA集群，安装了MetalLB并使用Layer2模式转发service LoadBalancer到集群外部时，LoadBalancer IP不能被访问。</p><h4 id="原因-猜测-日志无报错" tabindex="-1">原因（猜测，日志无报错） <a class="header-anchor" href="#原因-猜测-日志无报错" aria-label="Permalink to &quot;原因（猜测，日志无报错）&quot;">​</a></h4><p>ARP表冲突，kube-vip默认启用了Service LoadBalancer模式（后面文章再研究），导致MetalLB申请的IP不能被ARP解析。 kube-vip官网找到以下内容：</p><p><img src="'+n+'" alt="img"></p><h3 id="解决方案" tabindex="-1">解决方案 <a class="header-anchor" href="#解决方案" aria-label="Permalink to &quot;解决方案&quot;">​</a></h3><p>关闭kube-vip的LoadBalancer，只使用MetalLB提供的LB能力。</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>vim /etc/kubernetes/manifests/kube-vip.yaml</span></span></code></pre></div><p><img src="'+i+`" alt="img">重启所有master的kubelet</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>systemctl restart kubelet</span></span></code></pre></div><h3 id="删除vip重新生成" tabindex="-1">删除vip重新生成 <a class="header-anchor" href="#删除vip重新生成" aria-label="Permalink to &quot;删除vip重新生成&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>不确定有没有作用，先写上</span></span>
<span class="line"><span># 所有master都执行</span></span>
<span class="line"><span>ip addr del dev ens192 10.20.13.111/32</span></span></code></pre></div><blockquote><p>ens192：网卡</p><p>10.20.13.111/32：vip</p></blockquote><h3 id="测试" tabindex="-1">测试 <a class="header-anchor" href="#测试" aria-label="Permalink to &quot;测试&quot;">​</a></h3><p>经过以上步骤，此时再次访问vip，还是不通，原因我猜测是ip已经被写入ARP表还未过期，可以新增一个LoadBalancer模式的Service</p><h4 id="方法一" tabindex="-1">方法一 <a class="header-anchor" href="#方法一" aria-label="Permalink to &quot;方法一&quot;">​</a></h4><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>将不通的LoadBalancer IP作为源地址发送请求到k8s节，以此来刷新ARP表</span></span>
<span class="line"><span>arping -I ens192 -s 10.20.13.231 10.20.13.90</span></span></code></pre></div><blockquote><p>10.20.13.90：master ip其中之一（任意节点应该也可以）</p><p>10.20.13.231：不通的LoadBalancer IP</p></blockquote><h4 id="方法二" tabindex="-1">方法二 <a class="header-anchor" href="#方法二" aria-label="Permalink to &quot;方法二&quot;">​</a></h4><p><code>新增service，使用一个之前未使用过的LoadBalancer</code></p><p>示例：</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>kubectl expose deployment nginx-deployment --type=LoadBalancer --port=80 --name=nginx-lb</span></span></code></pre></div><blockquote><p>nginx-deployment：deployment名称</p></blockquote>`,24),o=[p];function c(r,d,h,b,u,v){return s(),e("div",null,o)}const g=a(l,[["render",c]]);export{k as __pageData,g as default};
