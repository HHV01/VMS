import { Page, Locator } from '@playwright/test';
import { requireEnv } from '../utils/env';

const baseUrl = () => requireEnv('VMS_BASE_URL').replace(/\/+$/, '');

/**
 * VMS Object Counting - Page Object Model cho module "Đếm đối tượng".
 * Bám sát 3 wireframe PSD (Crossline, Area Occupancy, Lane Counting) & giao diện VMS live thực tế.
 */
export class VmsObjectCountingPage {
  readonly page: Page;

  // ===== HEADER & BREADCRUMB =====
  readonly pageHeading: Locator;

  // ===== LOẠI ĐẾM (3 NÚT CHẾ ĐỘ) =====
  readonly modeCrosslineBtn: Locator;
  readonly modeAreaBtn: Locator;
  readonly modeLaneBtn: Locator;

  // ===== BỘ CHỌN THANH CÔNG CỤ =====
  readonly cameraDropdown: Locator;
  readonly ruleDropdown: Locator;
  readonly objectDropdown: Locator;

  // ===== BỘ LỌC THỜI GIAN =====
  readonly timeFilterTodayBtn: Locator;
  readonly timeFilter1HourBtn: Locator; // Wireframe ghi "1 giờ gần nhất", Live ghi "Giờ hiện tại"
  readonly timeFilterCurrentHourBtn: Locator;

  // ===== LIVE VIDEO & OVERLAY =====
  readonly videoPlayer: Locator;
  readonly liveOverlayContainer: Locator;
  readonly ruleOverlayLabel: Locator;
  readonly cameraTag: Locator;

  // ===== CROSSLINE (ĐƯỜNG CẮT) =====
  readonly crosslineKpiTotal: Locator;
  readonly crosslineKpiIn: Locator;
  readonly crosslineKpiOut: Locator;
  readonly crosslineDirectionTable: Locator;
  readonly crosslineTrendChart: Locator;
  readonly crosslinePieChart: Locator;
  readonly trendLineToggleBtn: Locator;
  readonly trendBarToggleBtn: Locator;

  // ===== AREA OCCUPANCY (VÙNG) =====
  readonly areaKpiCurrent: Locator;
  readonly areaKpiCapacity: Locator;
  readonly areaKpiAvg: Locator;
  readonly areaKpiMax: Locator;
  readonly areaKpiMin: Locator;
  readonly areaDistributionTable: Locator;
  readonly areaSafetyChart: Locator;

  // ===== LANE COUNTING (LÀN ĐƯỜNG) =====
  readonly laneKpiTotal: Locator;
  readonly laneKpiHighest: Locator;
  readonly laneFlowBarChart: Locator;
  readonly laneFlowTrendChart: Locator;
  readonly laneObjectTable: Locator;
  readonly laneExportExcelBtn: Locator;

  constructor(page: Page) {
    this.page = page;

    // Header
    this.pageHeading = page.getByRole('heading', { name: /Đếm đối tượng/i }).or(page.getByText('Đếm đối tượng').first());

    // 3 nút loại đếm
    this.modeCrosslineBtn = page.locator('button:has-text("Đường cắt")').first();
    this.modeAreaBtn = page.locator('button:has-text("Vùng")').first();
    this.modeLaneBtn = page.locator('button:has-text("Làn đường")').first();

    // Thanh công cụ bộ chọn (dựa theo container chứa label)
    this.cameraDropdown = page.locator('div:has(> label:has-text("Mã camera")) button').first();
    this.ruleDropdown = page.locator('div:has(> label:has-text("Quy tắc")) button').first();
    this.objectDropdown = page.locator('div:has(> label:has-text("Đối tượng"))').first();

    // Thời gian
    this.timeFilterTodayBtn = page.locator('button:has-text("Hôm nay")').first();
    this.timeFilterCurrentHourBtn = page.locator('button:has-text("Giờ hiện tại")').first();
    this.timeFilter1HourBtn = page.locator('button:has-text("1 giờ gần nhất"), button:has-text("1 giờ"), button:has-text("Giờ hiện tại")').first();

    // Video & Overlay
    this.videoPlayer = page.locator('video, [class*="player"]').first();
    this.liveOverlayContainer = page.locator('.camera-player, [class*="player"], video').first();
    this.ruleOverlayLabel = page.locator('text=/default_name|Line 1|VÀO|RA/i').first();
    this.cameraTag = page.locator('text=/Online|AI.*Running|Reconnecting|BB-|LH-|AIOT/i').first();

    // Crossline
    this.crosslineKpiTotal = page.locator('[class*="kpi"], [class*="card"]').filter({ hasText: 'Tổng lượt' }).first();
    this.crosslineKpiIn = page.locator('[class*="kpi"], [class*="card"]').filter({ hasText: 'Lượt vào' }).first();
    this.crosslineKpiOut = page.locator('[class*="kpi"], [class*="card"]').filter({ hasText: 'Lượt ra' }).first();
    this.crosslineDirectionTable = page.locator('[class*="card"], [class*="table"]').filter({ hasText: 'Thống kê đối tượng theo hướng' }).first();
    this.crosslineTrendChart = page.locator('[class*="card"], [class*="chart"]').filter({ hasText: 'Xu hướng theo thời gian' }).first();
    this.crosslinePieChart = page.locator('[class*="card"], [class*="chart"]').filter({ hasText: 'Phân bổ theo đối tượng' }).first();
    this.trendLineToggleBtn = page.locator('button:has-text("Đường")').first();
    this.trendBarToggleBtn = page.locator('button:has-text("Cột")').first();

    // Area
    this.areaKpiCurrent = page.locator('[class*="kpi"], [class*="card"]').filter({ hasText: 'Hiện diện hiện tại' }).first();
    this.areaKpiCapacity = page.locator('[class*="kpi"], [class*="card"]').filter({ hasText: 'Sức chứa & tỉ lệ' }).first();
    this.areaKpiAvg = page.locator('[class*="kpi"], [class*="card"]').filter({ hasText: 'Hiện diện trung bình' }).first();
    this.areaKpiMax = page.locator('[class*="kpi"], [class*="card"]').filter({ hasText: 'Hiện diện cao nhất' }).first();
    this.areaKpiMin = page.locator('[class*="kpi"], [class*="card"]').filter({ hasText: 'Hiện diện thấp nhất' }).first();
    this.areaDistributionTable = page.locator('[class*="card"]').filter({ hasText: 'Phân bổ đối tượng' }).first();
    this.areaSafetyChart = page.locator('[class*="card"]').filter({ hasText: 'Biểu đồ mật độ hiện diện' }).first();

    // Lane
    this.laneKpiTotal = page.locator('[class*="kpi"], [class*="card"]').filter({ hasText: 'Tổng lượt' }).first();
    this.laneKpiHighest = page.locator('[class*="kpi"], [class*="card"]').filter({ hasText: 'Làn cao nhất' }).first();
    this.laneFlowBarChart = page.locator('[class*="card"]').filter({ hasText: 'Lưu lượng theo làn' }).first();
    this.laneFlowTrendChart = page.locator('[class*="card"]').filter({ hasText: 'Xu hướng lưu lượng theo làn' }).first();
    this.laneObjectTable = page.locator('[class*="card"]').filter({ hasText: 'Lưu lượng theo làn và đối tượng' }).first();
    this.laneExportExcelBtn = page.locator('button:has-text("Xuất Excel"), button:has-text("Xuất dữ liệu")').first();
  }

  // ===== ĐIỀU HƯỚNG =====
  async navigate(url?: string) {
    const target = url || `${baseUrl()}/video-analytic/object-counting`;
    await this.page.goto(target, { waitUntil: 'domcontentloaded' });
  }

  async waitForPageLoad(timeout = 15000) {
    await this.pageHeading.waitFor({ state: 'visible', timeout });
  }

  // ===== CHỌN CHẾ ĐỘ ĐẾM =====
  async selectMode(mode: 'crossline' | 'area' | 'lane') {
    if (mode === 'crossline') {
      await this.modeCrosslineBtn.click();
    } else if (mode === 'area') {
      await this.modeAreaBtn.click();
    } else if (mode === 'lane') {
      await this.modeLaneBtn.click();
    }
  }

  // ===== ĐỌC SỐ LIỆU KPI CROSSLINE =====
  async getCrosslineKpiNumbers(): Promise<{ total: number; in: number; out: number }> {
    const totalText = await this.crosslineKpiTotal.innerText();
    const inText = await this.crosslineKpiIn.innerText();
    const outText = await this.crosslineKpiOut.innerText();

    const parseNum = (str: string) => {
      const match = str.replace(/,/g, '').match(/\d+/);
      return match ? parseInt(match[0], 10) : 0;
    };

    return {
      total: parseNum(totalText),
      in: parseNum(inText),
      out: parseNum(outText),
    };
  }

  // ===== ĐỌC SỐ LIỆU KPI AREA =====
  async getAreaKpiNumbers(): Promise<{ current: number; capacity: string; avg: number; max: number; min: number }> {
    const curText = await this.areaKpiCurrent.innerText().catch(() => '0');
    const capText = await this.areaKpiCapacity.innerText().catch(() => '');
    const avgText = await this.areaKpiAvg.innerText().catch(() => '0');
    const maxText = await this.areaKpiMax.innerText().catch(() => '0');
    const minText = await this.areaKpiMin.innerText().catch(() => '0');

    const parseNum = (str: string) => {
      const match = str.replace(/,/g, '').match(/[\d.]+/);
      return match ? parseFloat(match[0]) : 0;
    };

    return {
      current: parseNum(curText),
      capacity: capText,
      avg: parseNum(avgText),
      max: parseNum(maxText),
      min: parseNum(minText),
    };
  }

  // ===== ĐỌC SỐ LIỆU KPI LANE =====
  async getLaneKpiNumbers(): Promise<{ total: number; highestLane: string; highestCount: number }> {
    const totalText = await this.laneKpiTotal.innerText().catch(() => '0');
    const highestText = await this.laneKpiHighest.innerText().catch(() => '');

    const parseNum = (str: string) => {
      const match = str.replace(/,/g, '').match(/\d+/);
      return match ? parseInt(match[0], 10) : 0;
    };

    return {
      total: parseNum(totalText),
      highestLane: highestText,
      highestCount: parseNum(highestText),
    };
  }

  // ===== ĐỌC BẢNG HƯỚNG CROSSLINE =====
  async getDirectionTableTotal(): Promise<number> {
    const text = await this.crosslineDirectionTable.innerText().catch(() => '');
    const match = text.match(/Tổng cộng\s+(\d+)\s+(\d+)\s+(\d+)/);
    if (match) {
      return parseInt(match[3], 10);
    }
    const matchAlt = text.match(/Tổng cộng[^\n]*\n[^\n]*(\d[\d,]*)/);
    if (matchAlt) {
      return parseInt(matchAlt[1].replace(/,/g, ''), 10);
    }
    return 0;
  }

  // ===== ĐỌC BẢNG LANE OBJECT =====
  async getLaneTableTotal(): Promise<number> {
    const text = await this.laneObjectTable.innerText().catch(() => '');
    const match = text.match(/Tổng cộng[^\d]*(\d[\d,]*)[^\d]*(\d[\d,]*)[^\d]*(\d[\d,]*)[^\d]*(\d[\d,]*)/);
    if (match) {
      return parseInt(match[4].replace(/,/g, ''), 10);
    }
    return 0;
  }
}
