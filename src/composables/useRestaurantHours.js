import { Icon } from "leaflet";

const openIcon = new Icon({
  iconUrl:
    "https://raw.githubusercontent.com/CK-APP-Org/Data/main/FoodPage/marker-icon-open.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const closedIcon = new Icon({
  iconUrl:
    "https://raw.githubusercontent.com/CK-APP-Org/Data/main/FoodPage/marker-icon-closed.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const openVarIcon = new Icon({
  iconUrl:
    "https://raw.githubusercontent.com/CK-APP-Org/Data/main/FoodPage/marker-icon-open-var.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const closedVarIcon = new Icon({
  iconUrl:
    "https://raw.githubusercontent.com/CK-APP-Org/Data/main/FoodPage/marker-icon-closed-var.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

export function getMarkerIcon(marker) {
  const now = new Date();
  const day = now
    .toLocaleDateString("en-US", { weekday: "long" })
    .toLowerCase();
  const time = now.toLocaleTimeString("en-US", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
  });

  const todayHours = marker.openingHours[day];
  if (todayHours === "休息") return closedIcon;

  const hourRanges = todayHours.split(",");
  for (const range of hourRanges) {
    const [open, close] = range.split(/[-]/);

    // Check if closing in 30 minutes
    if (isWithinMinutes(time, close, 30) && time < close) {
      return openVarIcon;
    }

    // Check if opening in 30 minutes
    if (isWithinMinutes(open, time, 30) && time < open) {
      return closedVarIcon;
    }

    if (time >= open && time < close) {
      return openIcon;
    }
  }

  return closedIcon;
}

export function getIconType(icon) {
  if (icon === openIcon) return "Open Icon";
  if (icon === closedIcon) return "Closed Icon";
  if (icon === openVarIcon) return "Open Variant Icon";
  if (icon === closedVarIcon) return "Closed Variant Icon";
  return "Unknown Icon";
}

export function isWithinMinutes(time1, time2, minutes) {
  const [h1, m1] = time1.split(":").map(Number);
  const [h2, m2] = time2.split(":").map(Number);
  const diff = Math.abs(h1 * 60 + m1 - (h2 * 60 + m2));
  return diff <= minutes;
}

export function isOpen(openingHours) {
  const now = new Date();
  const day = now
    .toLocaleDateString("en-US", { weekday: "long" })
    .toLowerCase();
  const time = now.toLocaleTimeString("en-US", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
  });

  const todayHours = openingHours[day];
  if (todayHours === "休息") return false;

  const hourRanges = todayHours.split(",");
  return hourRanges.some((range) => {
    const [open, close] = range.split(/[-–]/);
    return time >= open && time <= close;
  });
}

export function translateDays(openingHours) {
  const dayTranslations = {
    monday: "星期一",
    tuesday: "星期二",
    wednesday: "星期三",
    thursday: "星期四",
    friday: "星期五",
    saturday: "星期六",
    sunday: "星期日",
  };

  return Object.entries(openingHours).reduce((acc, [day, hours]) => {
    acc[dayTranslations[day] || day] = hours;
    return acc;
  }, {});
}

export function getCurrentDay() {
  const days = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ];
  return days[new Date().getDay()];
}
