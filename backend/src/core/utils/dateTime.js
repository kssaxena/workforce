import { DateTime } from "luxon";

export const getCurrentDateTime = (timezone) => {
  return DateTime.now().setZone(timezone || "Asia/Kolkata");
};

export const getBusinessDate = (timezone) => {
  return getCurrentDateTime(timezone).toFormat("yyyy-MM-dd");
};

export const getStartOfBusinessDay = (timezone) => {
  return getCurrentDateTime(timezone).startOf("day").toJSDate();
};

export const getEndOfBusinessDay = (timezone) => {
  return getCurrentDateTime(timezone).endOf("day").toJSDate();
};

export const getCurrentTimestamp = (timezone) => {
  return getCurrentDateTime(timezone).toJSDate();
};

export const calculateWorkedMinutes = ({ checkIn, checkOut }) => {
  if (!checkIn || !checkOut) {
    return 0;
  }

  const difference = new Date(checkOut).getTime() - new Date(checkIn).getTime();

  return Math.max(0, Math.floor(difference / 60000));
};
