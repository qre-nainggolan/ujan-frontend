import React, { useState, useRef, useEffect } from "react";
import { format as formatDateFns } from "date-fns";
import "../../css/calendar.css";

type CustomCalendarProps = {
  value?: string | Date | null;
  selected?: Date | null;
  name?: string;
  id?: string;
  dataTestId?: string;
  onChange?: (date: Date | null) => void;
  dateFormat?: string;
  className?: string;
  wrapperClassName?: string;
};

function isSameDay(d1: Date, d2: Date) {
  return (
    d1.getDate() === d2.getDate() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getFullYear() === d2.getFullYear()
  );
}

function getCalendarDays(month: Date): Date[] {
  const start = new Date(month.getFullYear(), month.getMonth(), 1);
  const end = new Date(month.getFullYear(), month.getMonth() + 1, 0);
  const days: Date[] = [];

  const startDay = start.getDay();
  for (let i = 0; i < startDay; i++) {
    days.push(
      new Date(start.getFullYear(), start.getMonth(), i - startDay + 1)
    );
  }

  for (let i = 1; i <= end.getDate(); i++) {
    days.push(new Date(month.getFullYear(), month.getMonth(), i));
  }

  while (days.length < 42) {
    const last = days[days.length - 1];
    days.push(
      new Date(last.getFullYear(), last.getMonth(), last.getDate() + 1)
    );
  }

  return days;
}

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const CustomCalendar: React.FC<CustomCalendarProps> = ({
  id = "",
  dataTestId = "",
  selected,
  name,
  onChange,
  dateFormat = "yyyy-MM-dd",
  className = "",
  wrapperClassName = "",
}) => {
  const [currentMonth, setCurrentMonth] = useState(() =>
    selected ? new Date(selected) : new Date()
  );
  const [internalSelectedDate, setInternalSelectedDate] = useState<Date | null>(
    null
  );
  const [showCalendar, setShowCalendar] = useState(false);
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [showYearPicker, setShowYearPicker] = useState(false);
  const calendarRef = useRef<HTMLDivElement>(null);

  const selectedDate = selected ?? internalSelectedDate;
  const years = Array.from(
    { length: 21 },
    (_, i) => currentMonth.getFullYear() - 10 + i
  );
  const days = getCalendarDays(currentMonth);

  const handleOutsideClick = (e: MouseEvent) => {
    if (
      calendarRef.current &&
      !calendarRef.current.contains(e.target as Node)
    ) {
      setShowCalendar(false);
      setShowMonthPicker(false);
      setShowYearPicker(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const handleDateClick = (date: Date) => {
    if (onChange) onChange(date);
    else setInternalSelectedDate(date);

    setShowCalendar(false);
    setShowMonthPicker(false);
    setShowYearPicker(false);
  };

  const formatDate = (date: Date | null) =>
    date ? formatDateFns(date, dateFormat) : "";

  return (
    <div className={`calendar-wrapper ${wrapperClassName}`} ref={calendarRef}>
      <div className="input-group">
        <input
          type="text"
          id={id}
          data-testid={dataTestId}
          name={name}
          value={formatDate(selectedDate)}
          className={`calendar-input ${className}`}
          onChange={(e) => {
            const parsed = new Date(e.target.value);
            if (!isNaN(parsed.getTime())) {
              onChange?.(parsed);
            }
          }}
        />
        <button
          type="button"
          onClick={() => setShowCalendar(!showCalendar)}
          className="calendar-btn"
        >
          📅
        </button>
      </div>
      {showCalendar && (
        <div className="calendar-container">
          <div className="calendar-header">
            <button
              type="button"
              onClick={() =>
                setCurrentMonth(
                  new Date(
                    currentMonth.getFullYear(),
                    currentMonth.getMonth() - 1,
                    1
                  )
                )
              }
            >
              ‹
            </button>
            <span className="calendar-title">
              <span
                className="clickable"
                onClick={() => {
                  setShowMonthPicker(!showMonthPicker);
                  setShowYearPicker(false);
                }}
              >
                {months[currentMonth.getMonth()]}
              </span>{" "}
              <span
                className="clickable"
                onClick={() => {
                  setShowYearPicker(!showYearPicker);
                  setShowMonthPicker(false);
                }}
              >
                {currentMonth.getFullYear()}
              </span>
            </span>
            <button
              type="button"
              onClick={() =>
                setCurrentMonth(
                  new Date(
                    currentMonth.getFullYear(),
                    currentMonth.getMonth() + 1,
                    1
                  )
                )
              }
            >
              ›
            </button>
          </div>

          {showMonthPicker && (
            <div className="picker-grid">
              {months.map((m, idx) => (
                <div
                  key={m}
                  className="picker-item"
                  onClick={() => {
                    setCurrentMonth(
                      new Date(currentMonth.getFullYear(), idx, 1)
                    );
                    setShowMonthPicker(false);
                  }}
                >
                  {m}
                </div>
              ))}
            </div>
          )}
          {showYearPicker && (
            <div className="picker-grid">
              {years.map((y) => (
                <div
                  key={y}
                  className="picker-item"
                  onClick={() => {
                    setCurrentMonth(new Date(y, currentMonth.getMonth(), 1));
                    setShowYearPicker(false);
                  }}
                >
                  {y}
                </div>
              ))}
            </div>
          )}
          {!showMonthPicker && !showYearPicker && (
            <>
              <div className="weekdays">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                  (day) => (
                    <div key={day} className="weekday">
                      {day}
                    </div>
                  )
                )}
              </div>
              <div className="days-grid">
                {days.map((date, idx) => {
                  const isToday = isSameDay(date, new Date());
                  const isCurrentMonth =
                    date.getMonth() === currentMonth.getMonth();
                  const isSelected =
                    selectedDate && isSameDay(date, selectedDate);

                  return (
                    <div
                      key={idx}
                      className={`day ${isCurrentMonth ? "" : "outside"} ${
                        isToday ? "today" : ""
                      } ${isSelected ? "selected" : ""}`}
                      onClick={() => handleDateClick(date)}
                    >
                      {date.getDate()}
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default CustomCalendar;
