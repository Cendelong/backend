/**
 * 带宽服务（v6.6 多后端流量调度）
 */
import bandwidthTracker from '../src/utils/bandwidth-tracker.js';

export class BandwidthService {
  getStatus() { return bandwidthTracker.getStatus(); }
  isExhausted() { return bandwidthTracker.isExhausted(); }
  getUsageRatio() { return bandwidthTracker.getUsageRatio(); }
  recordOutbound(bytes) { bandwidthTracker.recordOutbound(bytes); }
  recordWs(bytes) { bandwidthTracker.recordWs(bytes); }
  recordWsConnection() { bandwidthTracker.recordWsConnection(); }
  reset() { bandwidthTracker.reset(); return { success: true }; }
  getRole() { return process.env.BACKEND_ROLE || 'both'; }
  allows(feature) {
    const role = this.getRole();
    if (role === 'both') return true;
    if (feature === 'proxy') return role === 'proxy';
    if (feature === 'api') return role === 'api';
    return true;
  }
}
export default BandwidthService;
