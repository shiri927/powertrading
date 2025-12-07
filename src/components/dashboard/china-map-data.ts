// Simplified China provinces SVG path data
// Coordinates are relative to a 100x100 viewBox

export interface ProvinceData {
  id: string;
  name: string;
  path: string;
  center: { x: number; y: number };
}

export interface StationData {
  id: string;
  name: string;
  province: string;
  x: number;
  y: number;
  capacity: string;
}

// Simplified province paths for China map
export const provinces: ProvinceData[] = [
  { id: "xinjiang", name: "新疆", path: "M5,15 L25,12 L30,20 L28,35 L20,42 L8,38 L3,28 Z", center: { x: 16, y: 26 } },
  { id: "xizang", name: "西藏", path: "M8,40 L22,38 L28,42 L30,55 L22,62 L10,58 L5,48 Z", center: { x: 17, y: 50 } },
  { id: "qinghai", name: "青海", path: "M28,35 L38,32 L42,38 L40,48 L32,52 L26,45 Z", center: { x: 34, y: 42 } },
  { id: "gansu", name: "甘肃", path: "M30,20 L42,18 L50,25 L48,35 L42,38 L38,32 L28,35 Z", center: { x: 40, y: 28 } },
  { id: "neimenggu", name: "内蒙古", path: "M42,8 L75,5 L82,18 L78,28 L65,32 L55,28 L48,18 L42,12 Z", center: { x: 62, y: 18 } },
  { id: "heilongjiang", name: "黑龙江", path: "M78,5 L92,8 L95,18 L88,25 L80,22 L76,12 Z", center: { x: 85, y: 15 } },
  { id: "jilin", name: "吉林", path: "M80,22 L88,25 L92,32 L85,36 L78,32 L76,26 Z", center: { x: 84, y: 28 } },
  { id: "liaoning", name: "辽宁", path: "M76,32 L85,36 L88,42 L82,48 L74,45 L72,38 Z", center: { x: 80, y: 40 } },
  { id: "hebei", name: "河北", path: "M65,32 L74,34 L76,42 L72,48 L64,46 L62,38 Z", center: { x: 68, y: 40 } },
  { id: "beijing", name: "北京", path: "M68,36 L72,36 L72,40 L68,40 Z", center: { x: 70, y: 38 } },
  { id: "tianjin", name: "天津", path: "M72,40 L75,40 L75,44 L72,44 Z", center: { x: 73.5, y: 42 } },
  { id: "shanxi", name: "山西", path: "M58,35 L65,35 L66,45 L62,52 L56,48 L55,40 Z", center: { x: 60, y: 43 } },
  { id: "shandong", name: "山东", path: "M68,42 L80,40 L84,48 L78,54 L68,52 L66,46 Z", center: { x: 74, y: 47 } },
  { id: "henan", name: "河南", path: "M58,48 L68,46 L72,54 L66,60 L58,58 L56,52 Z", center: { x: 63, y: 53 } },
  { id: "jiangsu", name: "江苏", path: "M72,50 L82,48 L85,56 L78,62 L72,58 Z", center: { x: 77, y: 55 } },
  { id: "anhui", name: "安徽", path: "M68,54 L76,52 L78,62 L72,68 L66,64 L66,58 Z", center: { x: 72, y: 60 } },
  { id: "shanghai", name: "上海", path: "M82,56 L86,56 L86,60 L82,60 Z", center: { x: 84, y: 58 } },
  { id: "zhejiang", name: "浙江", path: "M76,60 L84,58 L86,66 L80,72 L74,68 Z", center: { x: 80, y: 65 } },
  { id: "fujian", name: "福建", path: "M76,68 L84,66 L88,75 L82,82 L75,78 Z", center: { x: 80, y: 74 } },
  { id: "taiwan", name: "台湾", path: "M88,72 L92,70 L94,78 L90,84 L86,80 Z", center: { x: 90, y: 76 } },
  { id: "jiangxi", name: "江西", path: "M68,62 L76,60 L78,72 L72,78 L66,74 L66,66 Z", center: { x: 72, y: 69 } },
  { id: "hubei", name: "湖北", path: "M54,52 L66,50 L70,58 L64,65 L54,62 L52,56 Z", center: { x: 60, y: 57 } },
  { id: "hunan", name: "湖南", path: "M56,62 L66,60 L70,70 L64,78 L56,75 L54,68 Z", center: { x: 62, y: 69 } },
  { id: "guangdong", name: "广东", path: "M58,76 L72,74 L78,82 L70,90 L58,88 L54,82 Z", center: { x: 66, y: 82 } },
  { id: "guangxi", name: "广西", path: "M44,75 L58,73 L62,82 L54,90 L44,88 L40,82 Z", center: { x: 52, y: 82 } },
  { id: "hainan", name: "海南", path: "M52,92 L60,92 L60,98 L52,98 Z", center: { x: 56, y: 95 } },
  { id: "sichuan", name: "四川", path: "M32,48 L48,45 L54,55 L50,65 L40,68 L32,62 L30,54 Z", center: { x: 42, y: 56 } },
  { id: "chongqing", name: "重庆", path: "M48,58 L56,56 L58,64 L52,68 L48,64 Z", center: { x: 52, y: 62 } },
  { id: "guizhou", name: "贵州", path: "M44,66 L54,64 L58,72 L52,78 L44,76 L42,70 Z", center: { x: 50, y: 71 } },
  { id: "yunnan", name: "云南", path: "M28,62 L42,58 L48,68 L44,82 L32,86 L24,78 L22,68 Z", center: { x: 36, y: 72 } },
  { id: "shaanxi", name: "陕西", path: "M48,35 L58,33 L62,45 L58,55 L50,58 L46,48 L46,40 Z", center: { x: 53, y: 45 } },
  { id: "ningxia", name: "宁夏", path: "M48,30 L54,28 L56,36 L52,40 L48,36 Z", center: { x: 52, y: 34 } },
  { id: "hongkong", name: "香港", path: "M70,86 L74,86 L74,89 L70,89 Z", center: { x: 72, y: 87.5 } },
  { id: "macau", name: "澳门", path: "M66,88 L69,88 L69,91 L66,91 Z", center: { x: 67.5, y: 89.5 } },
];

// Station data with relative coordinates
export const stations: StationData[] = [
  { id: "1", name: "山东省场站A", province: "山东", x: 74, y: 45, capacity: "30MW" },
  { id: "2", name: "山东省场站B", province: "山东", x: 78, y: 48, capacity: "25MW" },
  { id: "3", name: "山东省场站C", province: "山东", x: 72, y: 50, capacity: "28MW" },
  { id: "4", name: "山西省场站A", province: "山西", x: 60, y: 42, capacity: "35MW" },
  { id: "5", name: "山西省场站B", province: "山西", x: 58, y: 46, capacity: "32MW" },
  { id: "6", name: "山西省场站C", province: "山西", x: 62, y: 48, capacity: "30MW" },
  { id: "7", name: "浙江省场站A", province: "浙江", x: 80, y: 64, capacity: "28MW" },
  { id: "8", name: "浙江省场站B", province: "浙江", x: 78, y: 68, capacity: "26MW" },
  { id: "9", name: "浙江省场站C", province: "浙江", x: 82, y: 66, capacity: "24MW" },
];

// Provinces with stations for highlighting
export const provincesWithStations = ["山东", "山西", "浙江"];
