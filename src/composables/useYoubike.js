import { formatDistanceToNow, parseISO, parse } from "date-fns";
import { zhTW } from "date-fns/locale";

export class Station {
  constructor(name) {
    this.name = name;
    this.available_rent_bikes = null;
    this.available_return_bikes = null;
    this.infoTime = null;
  }
}

export const districtOptionsTPC = [
  { label: "大安區", value: "大安區" },
  { label: "中正區", value: "中正區" },
  { label: "萬華區", value: "萬華區" },
  { label: "信義區", value: "信義區" },
  { label: "南港區", value: "南港區" },
  { label: "文山區", value: "文山區" },
  { label: "大同區", value: "大同區" },
  { label: "中山區", value: "中山區" },
  { label: "松山區", value: "松山區" },
  { label: "內湖區", value: "內湖區" },
  { label: "士林區", value: "士林區" },
  { label: "北投區", value: "北投區" },
  { label: "臺大公館校區", value: "臺大公館校區" },
];

export const districtOptionsNTC = [
  { label: "板橋區", value: "板橋區" },
  { label: "三重區", value: "三重區" },
  { label: "中和區", value: "中和區" },
  { label: "永和區", value: "永和區" },
  { label: "蘆洲區", value: "蘆洲區" },
  { label: "新莊區", value: "新莊區" },
  { label: "新店區", value: "新店區" },
  { label: "土城區", value: "土城區" },
  { label: "樹林區", value: "樹林區" },
  { label: "五股區", value: "五股區" },
  { label: "泰山區", value: "泰山區" },
  { label: "汐止區", value: "汐止區" },
  { label: "深坑區", value: "深坑區" },
  { label: "石碇區", value: "石碇區" },
  { label: "三峽區", value: "三峽區" },
  { label: "淡水區", value: "淡水區" },
  { label: "八里區", value: "八里區" },
  { label: "三芝區", value: "三芝區" },
  { label: "石門區", value: "石門區" },
  { label: "金山區", value: "金山區" },
  { label: "林口區", value: "林口區" },
  { label: "坪林區", value: "坪林區" },
  { label: "萬里區", value: "萬里區" },
  { label: "瑞芳區", value: "瑞芳區" },
  { label: "雙溪區", value: "雙溪區" },
  { label: "鶯歌區", value: "鶯歌區" },
];

export function deg2rad(deg) {
  return deg * (Math.PI / 180);
}

export function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  return d;
}

export function parseTimestamp(timestamp) {
  if (typeof timestamp === "string") {
    // Check if the timestamp matches the 新北市 format (YYYYMMDDHHMMSS)
    if (/^\d{14}$/.test(timestamp)) {
      return parse(timestamp, "yyyyMMddHHmmss", new Date());
    } else {
      // Then it's in 臺北市's ISO 8601 format
      return parseISO(timestamp);
    }
  }
  // If it's not a string, return it as is (it might already be a Date object)
  return timestamp;
}

export function timeAgo(time) {
  const parsedTime = parseTimestamp(time);
  return formatDistanceToNow(parsedTime, { locale: zhTW }) + "前";
}
