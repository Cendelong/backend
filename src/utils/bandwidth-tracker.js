/**
 * 带宽追踪器（v6.6 多后端流量调度）
 *
 * 统计当前 Render 实例的出站流量，用于多后端按流量顺序调度。
 *
 * 统计范围：
 *  - HTTP 响应体字节数（所有 /api/* 响应）
 *  - WebSocket 隧道转发字节数（/api/proxy/ws-tunnel）
 *  - 出站 HTTP 请求（BiliClient 等主动请求的响应体）—— 通过 recordOutbound() 手动记录
 *
 * 持久化：backend/data/bandwidth.json
 *  - 按月自动重置（每月1号零点，匹配 Render 计费周期）
 *  - Render 免费版文件系统非持久，但实例运行期间内存统计有效；
 *    重启后从文件恢复（若文件存在），否则从0开始
 *
 * 阈值：默认 4.5GB（Render 免费版 5GB 上限，留 0.5GB 安全余量）
 *  - 达到阈值后 isExhausted() 返回 true，前端调度器自动切换到下一个后端
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.resolve(__dirname, '../../data');
const DATA_FILE = path.join(DATA_DIR, 'bandwidth.json');

// 默认阈值：4.5GB（字节）
const DEFAULT_THRESHOLD_BYTES = 4.5 * 1024 * 1024 * 1024;

class BandwidthTracker {
  constructor() {
    this._bytes = 0;
    this._requests = 0;
    this._wsBytes = 0;
    this._wsConnections = 0;
    this._outboundBytes = 0;
    this._outboundRequests = 0;
    this._monthKey = this._getMonthKey();
    this._thresholdBytes = this._parseThreshold();
    this._startedAt = Date.now();
    this._load();
  }

  _parseThreshold() {
    const raw = process.env.BANDWIDTH_THRESHOLD || '';
    if (!raw) return DEFAULT_THRESHOLD_BYTES;
    const m = raw.trim().match(/^([\d.]+)\s*(gb|mb|kb|b)?$/i);
    if (!m) return DEFAULT_THRESHOLD_BYTES;
    const val = parseFloat(m[1]);
    const unit = (m[2] || 'b').toLowerCase();
    const mult = { gb: 1024**3, mb: 1024**2, kb: 1024, b: 1 }[unit] || 1;
    return Math.floor(val * mult);
  }

  _getMonthKey() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  }

  _ensureDir() {
    if (!fs.existsSync(DATA_DIR)) {
      try { fs.mkdirSync(DATA_DIR, { recursive: true }); } catch {}
    }
  }

  _load() {
    try {
      if (fs.existsSync(DATA_FILE)) {
        const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
        if (data.monthKey !== this._monthKey) {
          console.log(`[Bandwidth] 新月份 ${this._monthKey}，流量统计重置（上月 ${data.monthKey} 共 ${this._fmt(data.bytes || 0)}）`);
          this._bytes = 0; this._requests = 0; this._wsBytes = 0;
          this._wsConnections = 0; this._outboundBytes = 0; this._outboundRequests = 0;
        } else {
          this._bytes = data.bytes || 0;
          this._requests = data.requests || 0;
          this._wsBytes = data.wsBytes || 0;
          this._wsConnections = data.wsConnections || 0;
          this._outboundBytes = data.outboundBytes || 0;
          this._outboundRequests = data.outboundRequests || 0;
        }
      }
    } catch (e) {
      console.warn('[Bandwidth] 加载流量记录失败:', e.message);
    }
  }

  _save() {
    try {
      this._ensureDir();
      const data = {
        monthKey: this._monthKey,
        bytes: this._bytes,
        requests: this._requests,
        wsBytes: this._wsBytes,
        wsConnections: this._wsConnections,
        outboundBytes: this._outboundBytes,
        outboundRequests: this._outboundRequests,
        lastUpdated: new Date().toISOString(),
        thresholdBytes: this._thresholdBytes,
      };
      fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
    } catch (e) {}
  }

  recordResponse(bytes) {
    if (bytes > 0) {
      this._bytes += bytes;
      this._requests++;
      if (this._requests % 50 === 0 || bytes > 1024 * 1024) {
        this._checkMonthRollover();
        this._save();
      }
    }
  }

  recordWs(bytes) {
    if (bytes > 0) {
      this._wsBytes += bytes;
      this._bytes += bytes;
      if (this._wsBytes % (1024 * 1024) < bytes) {
        this._checkMonthRollover();
        this._save();
      }
    }
  }

  recordWsConnection() {
    this._wsConnections++;
  }

  recordOutbound(bytes) {
    if (bytes > 0) {
      this._outboundBytes += bytes;
      this._outboundRequests++;
      this._bytes += bytes;
      if (this._outboundRequests % 20 === 0) {
        this._checkMonthRollover();
        this._save();
      }
    }
  }

  _checkMonthRollover() {
    const current = this._getMonthKey();
    if (current !== this._monthKey) {
      console.log(`[Bandwidth] 跨月检测: ${this._monthKey} → ${current}，重置统计`);
      this._monthKey = current;
      this._bytes = 0; this._requests = 0; this._wsBytes = 0;
      this._wsConnections = 0; this._outboundBytes = 0; this._outboundRequests = 0;
      this._save();
    }
  }

  isExhausted() {
    this._checkMonthRollover();
    return this._bytes >= this._thresholdBytes;
  }

  getUsageRatio() {
    this._checkMonthRollover();
    return Math.min(1, this._bytes / this._thresholdBytes);
  }

  getStatus() {
    this._checkMonthRollover();
    const total = this._bytes;
    return {
      monthKey: this._monthKey,
      totalBytes: total,
      totalGB: this._fmtGB(total),
      thresholdBytes: this._thresholdBytes,
      thresholdGB: this._fmtGB(this._thresholdBytes),
      usageRatio: this.getUsageRatio(),
      usagePercent: (this.getUsageRatio() * 100).toFixed(2),
      exhausted: this.isExhausted(),
      remainingBytes: Math.max(0, this._thresholdBytes - total),
      remainingGB: this._fmtGB(Math.max(0, this._thresholdBytes - total)),
      http: { bytes: this._bytes - this._wsBytes - this._outboundBytes, requests: this._requests },
      websocket: { bytes: this._wsBytes, connections: this._wsConnections },
      outbound: { bytes: this._outboundBytes, requests: this._outboundRequests },
      uptimeSeconds: Math.floor((Date.now() - this._startedAt) / 1000),
      role: process.env.BACKEND_ROLE || 'both',
    };
  }

  reset() {
    this._bytes = 0; this._requests = 0; this._wsBytes = 0;
    this._wsConnections = 0; this._outboundBytes = 0; this._outboundRequests = 0;
    this._save();
    console.log('[Bandwidth] 流量统计已手动重置');
  }

  _fmt(bytes) {
    if (bytes >= 1024**3) return (bytes / 1024**3).toFixed(2) + ' GB';
    if (bytes >= 1024**2) return (bytes / 1024**2).toFixed(2) + ' MB';
    if (bytes >= 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return bytes + ' B';
  }

  _fmtGB(bytes) {
    return (bytes / 1024**3).toFixed(3);
  }
}

const tracker = new BandwidthTracker();
export default tracker;
export { BandwidthTracker };
