"use client"
import React, { useState } from "react";
import { DatePicker, message } from "antd";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
dayjs.extend(customParseFormat);

const { RangePicker } = DatePicker;

interface DateRangePickerProps {
  onDateChange: (dates: [dayjs.Dayjs | null, dayjs.Dayjs | null] | null) => void;
}

export const DateRangePicker: React.FC<DateRangePickerProps> = ({ onDateChange }) => {
  const [dates, setDates] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null] | null>(null);
  const maxDays = 150;

  const disabledDate = (current: dayjs.Dayjs) => {
    const today = dayjs();
    const maxSelectableDate = today.subtract(maxDays, "day");
    return current && (current < maxSelectableDate || current > today);
  };

  const handleDateChange = (values: [dayjs.Dayjs | null, dayjs.Dayjs | null] | null) => {
    if (values && values[0] && values[1]) {
      const diff = values[1].diff(values[0], "day");
      if (diff > maxDays) {
        message.error(`You can only select up to ${maxDays} days.`);
        return;
      }
    }
    setDates(values);
    onDateChange(values);
  };

  return (
    <div>
      <RangePicker onChange={handleDateChange} disabledDate={disabledDate} />
    </div>
  );
};
