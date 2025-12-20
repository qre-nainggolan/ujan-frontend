import React, { useState, useRef, useMemo, useEffect } from "react";
import "../../css/grid.css";
import { Pin, PinOff } from "lucide-react";

export type ColumnDefinition<T> = {
  key: keyof T | string;
  header: string;
  group?: string;
  render?: (row: T, index: number) => React.ReactNode;
  align?: "left" | "center" | "right";
  sticky?: "left";
  width?: number; // treated as *min* width
  wrap?: boolean; // true = wrap, false/undefined = ellipsis
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

/**
 * Resolve a *minimum* width for a column.
 * - width prop (if given) is treated as min width
 * - otherwise estimate from header text
 */
function resolveMinWidth(
  userWidth: number | undefined,
  content?: string
): number {
  const minAllowedWidth = 60;
  const defaultWidth = 120;
  const maxAllowedWidth = 300;

  if (content) {
    const estimated = Math.max(minAllowedWidth, content.length * 8);
    const capped = Math.min(estimated, maxAllowedWidth);
    // If userWidth is bigger, respect it as minimum
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

  const dragGroup = useRef<string | null>(null);
  const dragItem = useRef<number | null>(null);

  const [columnOrder, setColumnOrder] = useState(columns.map((_, i) => i));

  const [stickyMap, setStickyMap] = useState<{
    [index: number]: "left" | undefined;
  }>(() =>
    columns.reduce((acc, col, i) => {
      acc[i] = col.sticky === "left" ? "left" : undefined;
      return acc;
    }, {} as { [index: number]: "left" | undefined })
  );

  const containerRef = useRef<HTMLDivElement>(null);

  // NEW:
  const vScrollRef = useRef<HTMLDivElement>(null);
  const vThumbRef = useRef<HTMLDivElement>(null);
  const [showVScroll, setShowVScroll] = useState(false);

  // ADD THESE:
  const hbarRef = useRef<HTMLDivElement>(null);
  const hbarThumbRef = useRef<HTMLDivElement>(null);

  const onGroupDragStart = (groupName: string) => {
    dragGroup.current = groupName;
  };

  const onGroupDrop = (hoveredIdx: number) => {
    if (!dragGroup.current) return;

    const groupIndices = groupMap[dragGroup.current];
    const hoverPos = columnOrder.indexOf(hoveredIdx);

    const newOrder = columnOrder.filter((idx) => !groupIndices.includes(idx));
    newOrder.splice(hoverPos, 0, ...groupIndices);

    setColumnOrder(newOrder);
    dragGroup.current = null;
  };

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

    // Prevent dragging into locked columns
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

  /**
   * Compute sticky left offset based on *minimum* widths.
   * This doesn't force the actual width; it only helps for sticky positioning.
   */
  const { stickyLeftMap } = useMemo(() => {
    const map: { [index: number]: number } = {};
    let leftOffset = 0;
    columnOrder.forEach((idx) => {
      if (stickyMap[idx] === "left") {
        const minW = resolveMinWidth(columns[idx].width, columns[idx].header);
        map[idx] = leftOffset;
        leftOffset += minW;
      }
    });
    return { stickyLeftMap: map };
  }, [columnOrder, stickyMap, columns]);

  const getMinWidth = (idx: number) =>
    resolveMinWidth(columns[idx].width, columns[idx].header);

  useEffect(() => {
    const container = containerRef.current;
    const bar = vScrollRef.current;
    const thumb = vThumbRef.current;

    if (!container || !bar || !thumb) return;

    let hideTimer: number | undefined;

    const showBar = () => {
      setShowVScroll(true);
      if (hideTimer) {
        window.clearTimeout(hideTimer);
      }
      hideTimer = window.setTimeout(() => {
        setShowVScroll(false);
      }, 800); // ms after last scroll/move
    };

    const updateThumb = () => {
      // show bar whenever scrolling happens
      showBar();

      const barHeight = bar.clientHeight;
      const scrollHeight = container.scrollHeight;
      const clientHeight = container.clientHeight;

      if (scrollHeight <= clientHeight) {
        // no overflow: hide scrollbar
        thumb.style.height = "0px";
        return;
      }

      const ratio = barHeight / scrollHeight;
      const thumbHeight = Math.max(40, barHeight * ratio);
      thumb.style.height = thumbHeight + "px";

      const maxThumbY = barHeight - thumbHeight;
      const scrollRatio = container.scrollTop / (scrollHeight - clientHeight);
      const y = maxThumbY * scrollRatio;
      thumb.style.transform = `translateY(${y}px)`;
    };

    // Sync table → scrollbar
    container.addEventListener("scroll", updateThumb);
    updateThumb();

    // Dragging logic
    let dragging = false;
    let startY = 0;
    let startScrollTop = 0;

    const onMouseDown = (e: MouseEvent) => {
      dragging = true;
      startY = e.clientY;
      startScrollTop = container.scrollTop;
      showBar();
      e.preventDefault();
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!dragging) return;
      const delta = e.clientY - startY;
      const barHeight = bar.clientHeight;
      const scrollHeight = container.scrollHeight;
      const clientHeight = container.clientHeight;

      if (scrollHeight <= clientHeight) return;

      const ratio = scrollHeight / barHeight;
      container.scrollTop = startScrollTop + delta * ratio;
    };

    const onMouseUp = () => {
      dragging = false;
    };

    thumb.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);

    // Show bar when mouse enters table area
    const onMouseEnter = () => showBar();
    const onMouseLeave = () => {
      hideTimer = window.setTimeout(() => setShowVScroll(false), 500);
    };

    container.addEventListener("mouseenter", onMouseEnter);
    container.addEventListener("mouseleave", onMouseLeave);

    return () => {
      container.removeEventListener("scroll", updateThumb);
      container.removeEventListener("mouseenter", onMouseEnter);
      container.removeEventListener("mouseleave", onMouseLeave);
      thumb.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      if (hideTimer) window.clearTimeout(hideTimer);
    };
  }, []);

  // =========================
  // Horizontal Scrollbar Logic
  // =========================
  useEffect(() => {
    const container = containerRef.current;
    const bar = hbarRef.current;
    const thumb = hbarThumbRef.current;

    if (!container || !bar || !thumb) return;

    const hideTimers = new WeakMap<HTMLElement, number>();

    const updateThumbSize = () => {
      const fullWidth = container.scrollWidth;
      const visibleWidth = container.clientWidth;

      if (fullWidth <= visibleWidth) {
        // hide bar if no horizontal scroll
        bar.style.display = "none";
        return;
      }

      // show bar permanently
      bar.style.display = "block";

      const ratio = visibleWidth / fullWidth;
      const thumbWidth = Math.max(40, bar.clientWidth * ratio);
      thumb.style.width = thumbWidth + "px";
    };

    const updateThumbPos = () => {
      const scrollMax = Math.max(
        1,
        container.scrollWidth - container.clientWidth
      );
      const moveMax = Math.max(1, bar.clientWidth - thumb.clientWidth);

      const pos = (container.scrollLeft / scrollMax) * moveMax;
      thumb.style.transform = `translateX(${pos}px)`;

      bar.classList.add("dg-visible");

      const old = hideTimers.get(bar);
      if (old) clearTimeout(old);

      hideTimers.set(
        bar,
        window.setTimeout(() => {
          bar.classList.remove("dg-visible");
        }, 900)
      );
    };

    // Sync table → bar
    container.addEventListener("scroll", updateThumbPos);

    // Show bar when mouse enters the grid
    container.addEventListener("mouseenter", () => {
      // Only show if horizontal scroll actually exists
      if (container.scrollWidth > container.clientWidth) {
        bar.classList.add("dg-visible");
      }
    });

    // Hide after mouse leaves
    container.addEventListener("mouseleave", () => {
      setTimeout(() => {
        bar.classList.remove("dg-visible");
      }, 700);
    });

    // Drag thumb → table
    let dragging = false;
    let startX = 0;
    let startLeft = 0;

    const onDown = (e: MouseEvent) => {
      dragging = true;
      startX = e.clientX;
      startLeft = new DOMMatrix(getComputedStyle(thumb).transform).m41 || 0;
      bar.classList.add("dg-visible");
      e.preventDefault();
    };

    const onMove = (e: MouseEvent) => {
      if (!dragging) return;

      const dx = e.clientX - startX;
      const moveMax = bar.clientWidth - thumb.clientWidth;
      const newLeft = Math.max(0, Math.min(moveMax, startLeft + dx));

      thumb.style.transform = `translateX(${newLeft}px)`;

      const scrollMax = container.scrollWidth - container.clientWidth;
      container.scrollLeft = (newLeft / moveMax) * scrollMax;
    };

    const onUp = () => {
      dragging = false;
    };

    thumb.addEventListener("mousedown", onDown);
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);

    // Watch width changes
    window.addEventListener("resize", updateThumbSize);

    updateThumbSize();
    updateThumbPos();

    return () => {
      container.removeEventListener("scroll", updateThumbPos);
      thumb.removeEventListener("mousedown", onDown);
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
      container.removeEventListener("mouseenter", () => {});
      container.removeEventListener("mouseleave", () => {});
      window.removeEventListener("resize", updateThumbSize);
    };
  }, []);

  return (
    <>
      <div className="table-wrapper">
        {/* FLOATING VERTICAL SCROLLBAR */}
        <div
          className={`dg-vscrollbar ${showVScroll ? "dg-visible" : ""}`}
          ref={vScrollRef}
        >
          <div className="dg-vscrollbar-thumb" ref={vThumbRef}></div>
        </div>
        {/* FLOATING HORIZONTAL SCROLLBAR */}
        <div className="dg-hscrollbar" ref={hbarRef}>
          <div className="dg-hscrollbar-thumb" ref={hbarThumbRef}></div>
        </div>

        <div
          className="table-container"
          ref={containerRef}
          data-testid={dataTestid}
        >
          <table className="sensor-table">
            <thead>
              {/* Top row: group headers or standalone headers */}
              <tr>
                {columnOrder.map((idx) => {
                  const col = columns[idx];
                  const group = col.group;
                  const minW = getMinWidth(idx);

                  // Standalone column (no group)
                  if (!group) {
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
                          minWidth: minW, // only min-width, no fixed width
                          cursor: lockable ? "pointer" : "default",
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
                        <div className="flex-between column-header">
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
                  }

                  // Grouped column: only render header once per group
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
                        <div className={`pin-icon ${anySticky ? "show" : ""}`}>
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
                              <PinOff
                                style={{ width: "1rem", height: "1rem" }}
                              />
                            ))}
                        </div>
                      </div>
                    </th>
                  );
                })}
              </tr>

              {/* Second row: sub-headers for grouped columns */}
              <tr>
                {columnOrder.map((idx) => {
                  const col = columns[idx];
                  if (!col.group) return null;

                  const minW = getMinWidth(idx);

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
                        minWidth: minW, // again only min-width
                        cursor: stickyMap[idx] === "left" ? "default" : "move",
                      }}
                      className={
                        stickyMap[idx] === "left"
                          ? "sticky-col sticky-left"
                          : ""
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
                      const rawContent = col.render
                        ? col.render(row, rowIndex)
                        : (row as any)[col.key];

                      const isWrapped = col.wrap === true;
                      const isString = typeof rawContent === "string";
                      const isLong = isString && rawContent.length > 50;

                      const displayContent =
                        !isWrapped && isString && isLong
                          ? (rawContent as string).slice(0, 47) + "..."
                          : rawContent;

                      const sticky = stickyMap[idx];
                      const minW = getMinWidth(idx);

                      const className = `${
                        sticky === "left" ? "sticky-col sticky-left" : ""
                      } ${isWrapped ? "cell-wrap" : "cell-ellipsis"}`;

                      return (
                        <td
                          key={idx}
                          className={className}
                          style={{
                            textAlign: col.align || "left",
                            left:
                              sticky === "left"
                                ? stickyLeftMap[idx]
                                : undefined,
                            minWidth: minW, // only min-width, no fixed width
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
