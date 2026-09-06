/**
 * 多地区代理源配置（v6.6.1 清理失效源版）
 *
 * 本文件同时部署在：
 *   - local-login-service/lib/proxy-sources.js（本地登录服务）
 *   - backend/src/utils/proxy-sources.js（Render 后端）
 * 两处内容必须完全一致，保证代理源列表统一。
 *
 * v6.6.1：根据 Render 实际运行日志，删除了23个所有获取方式均失败的源：
 *   - 404失效：officialputuid/KangProxy, yemixzy/proxy-list, hendrikbgr/Free-Proxy-Repo,
 *              mmpx12/proxy-list, yoannchb-pro/Free-proxy, saschazesiger/Free-Proxies,
 *              ProxyScrape-cdn-http
 *   - 502/521：proxy-list.download(CN/http/socks5), 云代理
 *   - 403封禁：spys(CN)
 *   - 连接失败：66免费代理, databay-all, databay-http, proxy-list-download-http/https,
 *               TheSpeedX-cdn(http), monosans-cdn(http)
 *   - 国内站不可用：快代理(免费)
 *   - 镜像失效：MuRongPIG(ghproxy镜像)
 *   - 超时：proxydb.net, gfpcom-http(48万+)
 *
 * 保留41个可正常抓取的源。
 */

export const CN_PROXY_SOURCES = [
  // ============================================================
  // A. GitHub raw 纯文本源（量大、稳定，优先）
  // ============================================================
  {
    name: 'MuRongPIG/Proxy-Master',
    getUrl: () => 'https://raw.githubusercontent.com/MuRongPIG/Proxy-Master/main/http.txt',
    pages: 1,
  },
  {
    name: 'monosans/proxy-list',
    getUrl: () => 'https://raw.githubusercontent.com/monosans/proxy-list/main/proxies/http.txt',
    pages: 1,
  },
  {
    name: 'TheSpeedX/PROXY-List',
    getUrl: () => 'https://raw.githubusercontent.com/TheSpeedX/PROXY-List/master/http.txt',
    pages: 1,
  },
  {
    name: 'ShiftyTR/Proxy-List',
    getUrl: () => 'https://raw.githubusercontent.com/ShiftyTR/Proxy-List/master/http.txt',
    pages: 1,
  },
  {
    name: 'prxchk/proxy-list',
    getUrl: () => 'https://raw.githubusercontent.com/prxchk/proxy-list/main/http.txt',
    pages: 1,
  },
  {
    name: 'vakhov/fresh-proxy-list',
    getUrl: () => 'https://raw.githubusercontent.com/vakhov/fresh-proxy-list/master/http.txt',
    pages: 1,
  },
  {
    name: 'roosterkid/openproxylist',
    getUrl: () => 'https://raw.githubusercontent.com/roosterkid/openproxylist/main/HTTPS_RAW.txt',
    pages: 1,
  },
  {
    name: 'Anonym0usWork1221/Free-Proxies',
    getUrl: () => 'https://raw.githubusercontent.com/Anonym0usWork1221/Free-Proxies/main/proxy_files/http_proxies.txt',
    pages: 1,
  },
  {
    name: 'elliottophellia/yakumo',
    getUrl: () => 'https://raw.githubusercontent.com/elliottophellia/yakumo/master/results/http/global/http_checked.txt',
    pages: 1,
  },
  {
    name: 'proxifly/free-proxy-list',
    getUrl: () => 'https://raw.githubusercontent.com/proxifly/free-proxy-list/main/proxies/all/data.txt',
    pages: 1,
  },
  {
    name: 'zloi-user/hideip.me',
    getUrl: () => 'https://raw.githubusercontent.com/zloi-user/hideip.me/main/http.txt',
    pages: 1,
  },
  {
    name: 'ALIILAPRO/Proxy',
    getUrl: () => 'https://raw.githubusercontent.com/ALIILAPRO/Proxy/main/http.txt',
    pages: 1,
  },
  {
    name: 'rdavydov/proxy-list',
    getUrl: () => 'https://raw.githubusercontent.com/rdavydov/proxy-list/main/proxies/http.txt',
    pages: 1,
  },
  {
    name: 'sunny9577/proxy-scraper',
    getUrl: () => 'https://raw.githubusercontent.com/sunny9577/proxy-scraper/master/proxies.txt',
    pages: 1,
  },

  // ============================================================
  // B. API 源（支持 country=CN 筛选）
  // ============================================================
  {
    name: 'proxyscrape(CN)',
    getUrl: () => 'https://api.proxyscrape.com/v2/?request=getproxies&protocol=http&timeout=10000&country=CN&ssl=all&anonymity=all',
    pages: 1,
  },
  {
    name: 'geonode(CN)',
    getUrl: () => 'https://proxylist.geonode.com/api/proxy-list?limit=500&page=1&sort_by=lastChecked&sort_type=desc&country=CN&protocols=http',
    pages: 1,
    isJson: true,
  },
  {
    name: 'freeproxy(CN)',
    getUrl: () => 'https://free-proxy-list.net/',
    pages: 1,
    isHtml: true,
  },

  // ============================================================
  // D. GitHub 镜像/CDN 源（国内可直连，备选）
  // ============================================================
  {
    name: 'TheSpeedX(jsdelivr镜像)',
    getUrl: () => 'https://cdn.jsdelivr.net/gh/TheSpeedX/PROXY-List@master/http.txt',
    pages: 1,
  },
  {
    name: 'monosans(jsdelivr镜像)',
    getUrl: () => 'https://cdn.jsdelivr.net/gh/monosans/proxy-list@main/proxies/http.txt',
    pages: 1,
  },

  // ============================================================
  // E. 国际代理源（全球多地区IP，验证时按国家代码自动分类）
  // ============================================================
  {
    name: 'TheSpeedX/PROXY-List(http)',
    getUrl: () => 'https://raw.githubusercontent.com/TheSpeedX/PROXY-List/master/http.txt',
    pages: 1,
  },
  {
    name: 'TheSpeedX/PROXY-List(socks4)',
    getUrl: () => 'https://raw.githubusercontent.com/TheSpeedX/PROXY-List/master/socks4.txt',
    pages: 1,
  },
  {
    name: 'TheSpeedX/PROXY-List(socks5)',
    getUrl: () => 'https://raw.githubusercontent.com/TheSpeedX/PROXY-List/master/socks5.txt',
    pages: 1,
  },
  {
    name: 'monosans/proxy-list(http)',
    getUrl: () => 'https://raw.githubusercontent.com/monosans/proxy-list/main/proxies/http.txt',
    pages: 1,
  },
  {
    name: 'monosans/proxy-list(socks5)',
    getUrl: () => 'https://raw.githubusercontent.com/monosans/proxy-list/main/proxies/socks5.txt',
    pages: 1,
  },
  {
    name: 'proxifly/proxies(http)',
    getUrl: () => 'https://raw.githubusercontent.com/proxifly/free-proxy-list/main/proxies/protocols/http/data.txt',
    pages: 1,
  },
  {
    name: 'proxifly/proxies(socks5)',
    getUrl: () => 'https://raw.githubusercontent.com/proxifly/free-proxy-list/main/proxies/protocols/socks5/data.txt',
    pages: 1,
  },
  {
    name: 'proxy-scraper(http)',
    getUrl: () => 'https://raw.githubusercontent.com/ShiftyTR/Proxy-List/master/http.txt',
    pages: 1,
  },
  {
    name: 'proxy-scraper(socks4)',
    getUrl: () => 'https://raw.githubusercontent.com/ShiftyTR/Proxy-List/master/socks4.txt',
    pages: 1,
  },
  {
    name: 'proxy-scraper(socks5)',
    getUrl: () => 'https://raw.githubusercontent.com/ShiftyTR/Proxy-List/master/socks5.txt',
    pages: 1,
  },
  {
    name: 'free-proxy-list.net',
    getUrl: () => 'https://free-proxy-list.net/',
    pages: 1,
    isHtml: true,
  },
  {
    name: 'us-proxy.org(美国)',
    getUrl: () => 'https://www.us-proxy.org/',
    pages: 1,
    isHtml: true,
  },
  {
    name: 'openproxylist(http)',
    getUrl: () => 'https://openproxylist.xyz/http.txt',
    pages: 1,
  },
  {
    name: 'openproxylist(socks5)',
    getUrl: () => 'https://openproxylist.xyz/socks5.txt',
    pages: 1,
  },
  {
    name: 'geonode/free',
    getUrl: () => 'https://proxylist.geonode.com/api/proxy-list?limit=500&page=1&sort_by=lastChecked&sort_type=desc',
    pages: 1,
    isJson: true,
  },
  {
    name: 'spys.me(http)',
    getUrl: () => 'https://spys.me/proxy.txt',
    pages: 1,
  },
  {
    name: 'anonymfile-proxylist',
    getUrl: () => 'https://raw.githubusercontent.com/Anonym0usWork1221/Free-Proxies/main/proxy_files/http_proxies.txt',
    pages: 1,
  },

  // ============================================================
  // F. Render海外可直连的高可靠代理源
  // ============================================================
  {
    name: 'gfpcom-https(44万+)',
    getUrl: () => 'https://raw.githubusercontent.com/wiki/gfpcom/free-proxy-list/lists/https.txt',
    pages: 1,
  },
  {
    name: 'ProxyScrape-cdn-all',
    getUrl: () => 'https://cdn.jsdelivr.net/gh/proxyscrape/free-proxy-list@main/proxies/all/data.txt',
    pages: 1,
  },
  {
    name: 'hproxy-http(78万+)',
    getUrl: () => 'https://raw.githubusercontent.com/hproxy-com/free-proxy-list/main/http.txt',
    pages: 1,
  },
  {
    name: 'hproxy-all',
    getUrl: () => 'https://raw.githubusercontent.com/hproxy-com/free-proxy-list/main/all.txt',
    pages: 1,
  },
  {
    name: 'dpangestuw-http',
    getUrl: () => 'https://raw.githubusercontent.com/dpangestuw/Free-Proxy/refs/heads/main/http_proxies.txt',
    pages: 1,
  },
];

// 统一导出
export const PROXY_SOURCES = CN_PROXY_SOURCES;
export default CN_PROXY_SOURCES;
