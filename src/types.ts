export type BrandKey =
  | 'all'
  | 'apple'
  | 'samsung'
  | 'xiaomi'
  | 'huawei'
  | 'motorola'
  | 'lg'
  | 'tablet';

export interface RepairItem {
  icon: string;
  name: string;
  time: string;
  brands: readonly BrandKey[];
}