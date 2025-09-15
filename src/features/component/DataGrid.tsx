import React, { useState, useRef, useMemo, useLayoutEffect } from "react";
import "../../css/grid.css";
import { Pin, PinOff } from "lucide-react";

export type ColumnDefinition<T> = {
  key: keyof T | string;
  header: string;
  group?: string;
  render?: (row: T, index: number) => React.ReactNode;
  align?: "left" | "center" | "right";
  sticky?: "left";
  width?: number;
  wrap?: boolean;
};

type DataGridProps<T> = {
  data: T[];
  columns: ColumnDefinition<T>[];
  lockable?: boolean;
  dataTestid?: string;
  onRowClick?: (row: T, index: number) => void;
  selectedIndex?: number | null;
  currentPage?: number;
  totalPages?: number;
  totalRecords?: number;
  pageSize?: number;
  onPageChange?: (newPage: number) => void;
  onPageSizeChange?: (newSize: number) => void;
};

function resolveWidth(
  userWidth: number | undefined,
  content?: string,
  stretchIfAvailable: boolean = false
): number {
  if (stretchIfAvailable) return -1; // Special flag to let it stretch later

  const minAllowedWidth = 60;
  const defaultWidth = 120;
  const maxAllowedWidth = 300;

  if (content) {
    const estimated = Math.max(minAllowedWidth, content.length * 8);
    const capped = Math.min(estimated, maxAllowedWidth);
    return userWidth && userWidth > capped ? userWidth : capped;
  }

  return userWidth && userWidth >= minAllowedWidth ? userWidth : defaultWidth;
}

function DataGrid<T extends object>({
  data,
  columns,
  lockable = true,
  dataTestid = "",
  onRowClick,
  selectedIndex,
  currentPage = 1,
  totalPages = 1,
  totalRecords = 0,
  pageSize = 50,
  onPageChange,
  onPageSizeChange,
}: DataGridProps<T>) {
  const startRecord = (currentPage - 1) * pageSize + 1;
  const endRecord = Math.min(startRecord + pageSize - 1, totalRecords);

  const [draggingIdx, setDraggingIdx] = useState<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);

  // Add to your component state
  const [dragOverCol] = useState<number | null>(null);
  const [isDragging] = useState<boolean>(false);

  const dragGroup = useRef<string | null>(null);

  const onGroupDragStart = (groupName: string) => {
    dragGroup.current = groupName;
  };

  const containerRef = useRef<HTMLDivElement>(null);
  const [availableWidth, setAvailableWidth] = useState<number | null>(null);

  const [columnOrder, setColumnOrder] = useState(columns.map((_, i) => i));
  const [stickyMap, setStickyMap] = useState<{
    [index: number]: "left" | undefined;
  }>(() =>
    columns.reduce((acc, col, i) => {
      acc[i] = col.sticky === "left" ? "left" : undefined;
      return acc;
    }, {} as { [index: number]: "left" | undefined })
  );

  useLayoutEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver(() => {
      const containerWidth = containerRef.current!.clientWidth;

      // Calculate total width of all columns EXCEPT the last one
      const totalColumnWidth = columnOrder.slice(0, -1).reduce((acc, idx) => {
        const col = columns[idx];
        return acc + resolveWidth(col.width, col.header);
      }, 0);

      const stretchable = Math.max(containerWidth - totalColumnWidth, 0);
      setAvailableWidth(stretchable);
    });

    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, [columnOrder, columns]);

  const onGroupDrop = (hoveredIdx: number) => {
    if (!dragGroup.current) return;

    const groupIndices = groupMap[dragGroup.current];
    const hoverPos = columnOrder.indexOf(hoveredIdx);

    const newOrder = columnOrder.filter((idx) => !groupIndices.includes(idx));
    newOrder.splice(hoverPos, 0, ...groupIndices);

    setColumnOrder(newOrder);
    dragGroup.current = null;
  };

  const dragItem = useRef<number | null>(null);

  const toggleSticky = (idx: number) => {
    if (!lockable) return;
    setStickyMap((prev) => ({
      ...prev,
      [idx]: prev[idx] === "left" ? undefined : "left",
    }));
  };

  const onDragStart = (idx: number) => {
    if (stickyMap[idx] === "left") return;
    dragItem.current = idx;
    setDraggingIdx(idx);
  };

  const onDrop = (hoveredIdx: number) => {
    const dragIdx = dragItem.current;
    if (dragIdx === null || stickyMap[dragIdx] === "left") return;

    const newOrder = [...columnOrder];
    const dragPos = newOrder.indexOf(dragIdx);
    const hoverPos = newOrder.indexOf(hoveredIdx);

    // Prevent drag into locked columns
    if (stickyMap[hoveredIdx] === "left") return;

    newOrder.splice(dragPos, 1);
    newOrder.splice(hoverPos, 0, dragIdx);
    setColumnOrder(newOrder);

    setDraggingIdx(null);
    setDragOverIdx(null);
    dragItem.current = null;
  };

  const groupMap = useMemo(() => {
    const map: { [group: string]: number[] } = {};
    columnOrder.forEach((idx) => {
      const col = columns[idx];
      if (col.group) {
        map[col.group] = map[col.group] || [];
        map[col.group].push(idx);
      }
    });
    return map;
  }, [columnOrder, columns]);

  const { stickyLeftMap } = useMemo(() => {
    const map: { [index: number]: number } = {};
    let leftOffset = 0;
    columnOrder.forEach((idx) => {
      if (stickyMap[idx] === "left") {
        map[idx] = leftOffset;
        leftOffset += resolveWidth(columns[idx].width, columns[idx].header);
      }
    });
    return { stickyLeftMap: map };
  }, [columnOrder, stickyMap, columns]);

  /* ➜ right after you compute columnOrder */
  const lastColIdx = columnOrder[columnOrder.length - 1];

  function getColWidth(idx: number, baseContent: string): number {
    const base = resolveWidth(columns[idx].width, baseContent); // normal width
    if (idx !== lastColIdx) return base; // not last col

    // 🔑 If there is spare room, grow; otherwise keep the base width
    return availableWidth !== null ? Math.max(base, availableWidth) : base;
  }

  return (
    <>
      <div
        className="table-container"
        ref={containerRef}
        data-testid={dataTestid}
      >
        <table className="sensor-table">
          <thead>
            {/* Group headers */}
            <tr>
              {columnOrder.map((idx) => {
                const col = columns[idx];
                const group = col.group;

                const w = getColWidth(idx, col.header);

                if (!group)
                  return (
                    <th
                      key={`header-top-${idx}`}
                      rowSpan={2}
                      style={{
                        position: "sticky",
                        top: 0,
                        left:
                          stickyMap[idx] === "left"
                            ? stickyLeftMap[idx]
                            : undefined,
                        width: w,
                        minWidth: w,
                        maxWidth: w,
                        cursor: lockable ? "pointer" : "default",
                        transition: isDragging
                          ? "transform 0.3s ease"
                          : undefined,
                        transform:
                          isDragging && dragOverCol === idx
                            ? "translateX(1rem)" // or -1rem if dragging left
                            : "translateX(0)",
                      }}
                      className={
                        (stickyMap[idx] === "left"
                          ? "sticky-col sticky-left"
                          : "") +
                        ` ${draggingIdx === idx ? "dragging" : ""} ${
                          dragOverIdx === idx ? "drag-over" : ""
                        }`
                      }
                      onClick={() => toggleSticky(idx)}
                      draggable={stickyMap[idx] !== "left"}
                      onDragStart={() => onDragStart(idx)}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={() => onDrop(idx)}
                    >
                      <div className={`flex-between column-header`}>
                        <span>{col.header}</span>
                        <div
                          className={`pin-icon ${
                            stickyMap[idx] === "left" ? "show" : ""
                          }`}
                        >
                          {lockable &&
                            (stickyMap[idx] === "left" ? (
                              <Pin
                                style={{
                                  width: "1rem",
                                  height: "1rem",
                                  color: "yellow",
                                }}
                              />
                            ) : (
                              <PinOff
                                style={{ width: "1rem", height: "1rem" }}
                              />
                            ))}
                        </div>
                      </div>
                    </th>
                  );

                // render only once for each group
                const isFirstInGroup = groupMap[group][0] === idx;
                if (!isFirstInGroup) return null;

                const groupIndices = groupMap[group];
                const anySticky = groupIndices.some(
                  (i) => stickyMap[i] === "left"
                );

                return (
                  <th
                    key={`group-${group}`}
                    colSpan={groupIndices.length}
                    style={{
                      position: "sticky",
                      top: 0,
                      left: anySticky
                        ? stickyLeftMap[
                            groupIndices.find((i) => stickyMap[i] === "left")!
                          ]
                        : undefined,
                      cursor: lockable ? "pointer" : "default",
                    }}
                    className={
                      (anySticky ? "sticky-col sticky-left" : "") +
                      ` ${draggingIdx === idx ? "dragging" : ""} ${
                        dragOverIdx === idx ? "drag-over" : ""
                      }`
                    }
                    onClick={() => {
                      const newSticky = anySticky ? undefined : "left";
                      setStickyMap((prev) => {
                        const updated = { ...prev };
                        groupIndices.forEach((i) => {
                          updated[i] = newSticky;
                        });
                        return updated;
                      });
                    }}
                    draggable
                    onDragStart={() => onGroupDragStart(group)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => onGroupDrop(groupIndices[0])}
                  >
                    <div className="flex-between column-header">
                      <span>{group}</span>
                      <div
                        className={`pin-icon ${
                          stickyMap[idx] === "left" ? "show" : ""
                        }`}
                      >
                        {lockable &&
                          (anySticky ? (
                            <Pin
                              style={{
                                width: "1rem",
                                height: "1rem",
                                color: "yellow",
                              }}
                            />
                          ) : (
                            <PinOff style={{ width: "1rem", height: "1rem" }} />
                          ))}
                      </div>
                    </div>
                  </th>
                );
              })}
            </tr>
            <tr>
              {columnOrder.map((idx) => {
                const col = columns[idx];
                if (!col.group) return null;

                const w = getColWidth(idx, col.header);
                return (
                  <th
                    key={`header-sub-${idx}`}
                    style={{
                      position: "sticky",
                      top: "3.35rem",
                      background: "rgba(0,136,13,0.95)",
                      left:
                        stickyMap[idx] === "left"
                          ? stickyLeftMap[idx]
                          : undefined,
                      width: w,
                      minWidth: w,
                      maxWidth: w,
                      cursor: stickyMap[idx] === "left" ? "default" : "move",
                    }}
                    className={
                      stickyMap[idx] === "left" ? "sticky-col sticky-left" : ""
                    }
                    draggable={stickyMap[idx] !== "left"}
                    onDragStart={() => onDragStart(idx)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => onDrop(idx)}
                  >
                    {col.header}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {data && data.length > 0 ? (
              data.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  onClick={() => onRowClick?.(row, rowIndex)}
                  className={selectedIndex === rowIndex ? "row-selected" : ""}
                  data-testid={`data-grid-row-${rowIndex}`}
                  data-row-json={
                    process.env.NODE_ENV === "test"
                      ? JSON.stringify(row)
                      : undefined
                  }
                >
                  {columnOrder.map((idx) => {
                    const col = columns[idx];
                    const content = col.render
                      ? col.render(row, rowIndex)
                      : (row as any)[col.key];
                    const isWrapped = col.wrap === true;
                    const isLong =
                      typeof content === "string" && content.length > 50;
                    const displayContent =
                      !isWrapped && isLong
                        ? content.slice(0, 47) + "..."
                        : content;
                    const sticky = stickyMap[idx];

                    const className = `${
                      sticky === "left" ? "sticky-col sticky-left" : ""
                    } ${isWrapped ? "cell-wrap" : "cell-ellipsis"}`;

                    const w = getColWidth(idx, col.header);
                    return (
                      <td
                        key={idx}
                        className={className}
                        style={{
                          textAlign: col.align || "left",
                          left:
                            sticky === "left" ? stickyLeftMap[idx] : undefined,
                          width: w,
                          minWidth: w,
                          maxWidth: w,
                        }}
                      >
                        {displayContent}
                      </td>
                    );
                  })}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length}
                  style={{ textAlign: "center", padding: "1rem" }}
                >
                  No data found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {onPageChange && (
        <div className="table-footer">
          <div className="pagination-info">
            <b>
              Showing {startRecord}–{endRecord} of {totalRecords}
            </b>
          </div>
          {totalPages > 1 && (
            <div className="pagination">
              <button
                disabled={currentPage === 1}
                onClick={() => onPageChange(1)}
              >
                1st
              </button>
              <button
                disabled={currentPage === 1}
                onClick={() => onPageChange(currentPage - 1)}
              >
                Prev
              </button>
              <span>
                {currentPage} of&nbsp;{totalPages}
              </span>
              <button
                disabled={currentPage === totalPages || totalPages <= 1}
                onClick={() => onPageChange(currentPage + 1)}
              >
                Next
              </button>
              <button
                disabled={currentPage === totalPages || totalPages <= 1}
                onClick={() => onPageChange(totalPages)}
              >
                Last
              </button>
              {onPageSizeChange && (
                <select
                  className="selection__input pagination-size"
                  value={pageSize}
                  onChange={(e) => onPageSizeChange(Number(e.target.value))}
                  style={{ marginLeft: "1rem" }}
                >
                  {[10, 25, 50, 100].map((size) => (
                    <option key={size} value={size}>
                      Show {size}
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}
        </div>
      )}
    </>
  );
}

export default DataGrid;
