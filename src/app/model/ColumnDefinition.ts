import * as React from "react";

export interface ColumnDefinition<T> {
  key: keyof T | string;
  header: string;
  group?: string; // ✅ NEW: for grouping headers
  render?: (row: T, index: number) => React.ReactNode;
  align?: "left" | "center" | "right";
  sticky?: "left";
  width?: number;
  wrap?: boolean;
}
