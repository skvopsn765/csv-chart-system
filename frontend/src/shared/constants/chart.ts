// 圖表相關常數定義

import { ChartType } from '../types/chart';

// 圖表類型常數
export const CHART_TYPES: Record<string, ChartType> = {
  LINE: 'line',
  BAR: 'bar'
} as const;

// 預設顏色調色盤
export const DEFAULT_CHART_COLORS = [
  '#8884d8',
  '#82ca9d',
  '#ffc658',
  '#ff7c7c',
  '#8dd1e1',
  '#d084d0',
  '#ffb347',
  '#87ceeb',
  '#dda0dd',
  '#98fb98'
] as const;

// 圖表尺寸常數
export const CHART_DIMENSIONS = {
  DEFAULT_HEIGHT: 400,
  DEFAULT_WIDTH: '100%',
  MARGIN: {
    top: 20,
    right: 30,
    left: 20,
    bottom: 20
  }
} as const;

// 圖表配置常數
export const CHART_CONFIG = {
  GRID_STROKE_DASH: '3 3',
  X_AXIS_ANGLE: -45,
  X_AXIS_HEIGHT: 80,
  FONT_SIZE: 12,
  STROKE_WIDTH: 2,
  DOT_RADIUS: 4,
  ACTIVE_DOT_RADIUS: 6,
  NUMERIC_THRESHOLD: 0.7
} as const; 