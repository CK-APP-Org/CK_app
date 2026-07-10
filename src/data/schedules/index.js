import gaoyi from "./gaoyi_schedules.json";
import gaoer from "./gaoer_schedules.json";
import gaosan from "./gaosan_schedules.json";

// Chinese numerals used as row labels in the schedule table, one per period.
const PERIOD_NAMES = ["一", "二", "三", "四", "五", "六", "七", "八"];

const WEEKDAY_KEYS = {
  monday: "Monday",
  tuesday: "Tuesday",
  wednesday: "Wednesday",
  thursday: "Thursday",
  friday: "Friday",
};

// Period time ranges (identical across all three grades' source files).
const PERIODS = gaoyi.periods.map((p, index) => ({
  period: p.period,
  name: PERIOD_NAMES[index],
  time: p.time,
}));

function buildScheduleRows(rawSchedule) {
  return PERIOD_NAMES.map((name, periodIndex) => {
    const row = { name };
    for (const [rawDay, colName] of Object.entries(WEEKDAY_KEYS)) {
      const subject = rawSchedule[rawDay]?.[periodIndex] ?? "";
      row[colName] = { subject };
    }
    return row;
  });
}

const SCHEDULE_DATA = {};
for (const gradeFile of [gaoyi, gaoer, gaosan]) {
  for (const classEntry of gradeFile.classes) {
    SCHEDULE_DATA[classEntry.id] = {
      schedule: buildScheduleRows(classEntry.schedule),
    };
  }
}

const CLASS_OPTIONS = Object.keys(SCHEDULE_DATA)
  .map(Number)
  .sort((a, b) => a - b);

// Parses "HH:MM-HH:MM" into comparable minute-of-day numbers.
function parseTimeRange(time) {
  const [start, end] = time.split("-");
  const toMinutes = (hhmm) => {
    const [h, m] = hhmm.split(":").map(Number);
    return h * 60 + m;
  };
  return { start: toMinutes(start), end: toMinutes(end) };
}

// Returns the Chinese-numeral name of the period covering `date`, or null
// if `date` falls outside all class periods (before/after school, lunch, etc).
function getCurrentPeriodName(date = new Date()) {
  const nowMinutes = date.getHours() * 60 + date.getMinutes();
  for (const period of PERIODS) {
    const { start, end } = parseTimeRange(period.time);
    if (nowMinutes >= start && nowMinutes <= end) {
      return period.name;
    }
  }
  return null;
}

export { SCHEDULE_DATA, CLASS_OPTIONS, PERIODS, getCurrentPeriodName };
