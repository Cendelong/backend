/**
 * 带宽服务（v6.5 多后端流量调度）
 *
 * 封装 BandwidthTracker，提供 Service 层接口。
 */
import bandwidthTracker from '../src/utils/bandwidth-tracker.js';

export class BandwidthService {
  getStatus() {
    return bandwidthTracker.getStatus();
  }

  isExhausted() {
    return bandwidthTracker.isExhausted();
  }

  getUsageRatio() {
    return bandwidthTracker.getUsageRatio();
  }

  recordOutbound(bytes) {
    bandwidthTracker.recordOutbound(bytes);
  }

  recordWs(bytes) {
    bandwidthTracker.recordWs(bytes);
  }

  recordWsConnection() {
    bandwidthTracker.recordWsConnection();
  }

  reset() {
    bandwidthTracker.reset();
    return { success: true };
  }

  /** 获取后端角色（proxy / api / both） */
  getRole() {
    return process.env.BACKEND_ROLE || 'both';
  }

  /** 检查当前角色是否允许某类功能 */
  allows(feature) {
    const role = this.getRole();
    if (role === 'both') return true;
    if (feature === 'proxy') return role === 'proxy';
    if (feature === 'api') return role === 'api';
    return true;
  }
}

export default BandwidthService;
