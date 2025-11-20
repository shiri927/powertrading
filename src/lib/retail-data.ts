// 零售交易模块数据类型定义和模拟数据生成

export interface Customer {
  id: string;
  name: string;
  packageType: '固定价格' | '浮动价格' | '分时段价格';
  agentName: string;
  contractStartDate: string;
  contractEndDate: string;
  priceMode: '月度结算' | '年度结算';
  intermediaryCost: number;
  contractStatus: 'active' | 'expired' | 'pending';
  voltageLevel: '10kV' | '35kV' | '110kV' | '220kV';
  totalCapacity: number;
  contactPerson: string;
  contactPhone: string;
  industryType: string;
  createdAt: string;
  updatedAt: string;
}

export interface EnergyUsage {
  id: string;
  customerId: string;
  customerName: string;
  date: string;
  totalEnergy: number;
  peakEnergy: number;
  flatEnergy: number;
  valleyEnergy: number;
  predictedEnergy: number;
  actualEnergy: number;
  deviationRate: number;
  voltageLevel: string;
  profitLoss: number;
  ranking: number;
}

export interface CustomerQuality {
  customerId: string;
  customerName: string;
  qualityScore: number;
  averageDeviation: number;
  totalEnergy: number;
  profitability: number;
  category: 'excellent' | 'good' | 'normal' | 'poor';
}

export interface PackageSimulation {
  id: string;
  customerName: string;
  schemeName: string;
  packageType: 'fixed' | 'floating';
  estimatedMonthlyUsage: number;
  peakRatio: number;
  flatRatio: number;
  valleyRatio: number;
  fixedPrice?: number;
  floatingBasePrice?: number;
  floatingPriceType?: string;
  floatingAdjustment?: number;
  purchaseCost: number;
  intermediaryCost: number;
  transmissionCost: number;
  otherCosts: number;
  totalRevenue: number;
  totalCost: number;
  grossProfit: number;
  profitMargin: number;
  breakEvenPrice: number;
  createdAt: string;
}

export interface ExecutionRecord {
  id: string;
  customerId: string;
  customerName: string;
  packageType: string;
  executionDate: string;
  executionPeriod: string;
  executedVolume: number;
  executedPrice: number;
  executedRevenue: number;
  predictedVolume: number;
  allocationPrice: number;
  volumeDeviation: number;
  volumeDeviationRate: number;
  estimatedTotalRevenue: number;
  actualRevenue: number;
  revenueDeviation: number;
  status: 'executing' | 'completed' | 'anomaly';
  executionProgress: number;
}

export interface CustomerSummary {
  customerId: string;
  customerName: string;
  packageType: string;
  totalExecutedVolume: number;
  totalExecutedRevenue: number;
  averageDeviationRate: number;
  anomalyCount: number;
  executionRate: number;
  lastExecutionTime: string;
}

// 模拟数据生成函数
const customerNames = [
  '江苏华电能源', '浙江中电投资', '山东鲁能电力', '河北冀电集团', '上海申能电力',
  '广东粤电能源', '四川川电投资', '湖北楚电集团', '安徽皖电能源', '福建闽电投资',
  '河南豫电集团', '湖南湘电能源', '江西赣电投资', '山西晋电集团', '陕西秦电能源',
  '辽宁辽电投资', '吉林吉电集团', '黑龙江龙电能源', '内蒙古蒙电投资', '天津津电集团',
  '重庆渝电能源', '云南滇电投资', '贵州黔电集团', '甘肃陇电能源', '新疆新电投资',
  '宁夏宁电集团', '青海青电能源', '西藏藏电投资', '海南琼电集团', '北京京电能源',
  '深圳深电投资', '苏州苏电集团', '杭州杭电能源', '南京宁电投资', '武汉汉电集团',
  '成都蓉电能源', '西安秦电投资', '沈阳沈电集团', '长春春电能源', '哈尔滨哈电投资',
  '郑州郑电集团', '长沙长电能源', '南昌昌电投资', '太原太电集团', '石家庄石电能源',
  '济南济电投资', '合肥合电集团', '福州福电能源', '南宁南电投资', '昆明昆电集团'
];

const agentNames = ['华电代理', '中电代理', '国电代理', '大唐代理', '华能代理'];
const industryTypes = ['制造业', '化工', '钢铁', '建材', '纺织', '电子', '食品', '医药'];

export function generateCustomers(count: number = 50): Customer[] {
  const customers: Customer[] = [];
  const now = new Date();
  
  for (let i = 0; i < count; i++) {
    const startDate = new Date(now.getFullYear() - Math.floor(Math.random() * 2), Math.floor(Math.random() * 12), 1);
    const endDate = new Date(startDate);
    endDate.setFullYear(endDate.getFullYear() + 1 + Math.floor(Math.random() * 2));
    
    const status: Customer['contractStatus'] = 
      endDate < now ? 'expired' : 
      startDate > now ? 'pending' : 'active';
    
    customers.push({
      id: `CUST-${String(i + 1).padStart(4, '0')}`,
      name: customerNames[i % customerNames.length],
      packageType: ['固定价格', '浮动价格', '分时段价格'][Math.floor(Math.random() * 3)] as Customer['packageType'],
      agentName: agentNames[Math.floor(Math.random() * agentNames.length)],
      contractStartDate: startDate.toISOString().split('T')[0],
      contractEndDate: endDate.toISOString().split('T')[0],
      priceMode: Math.random() > 0.5 ? '月度结算' : '年度结算',
      intermediaryCost: Math.round((20 + Math.random() * 80) * 100) / 100,
      contractStatus: status,
      voltageLevel: ['10kV', '35kV', '110kV', '220kV'][Math.floor(Math.random() * 4)] as Customer['voltageLevel'],
      totalCapacity: Math.round((1000 + Math.random() * 9000) * 100) / 100,
      contactPerson: `联系人${i + 1}`,
      contactPhone: `138${String(Math.floor(Math.random() * 100000000)).padStart(8, '0')}`,
      industryType: industryTypes[Math.floor(Math.random() * industryTypes.length)],
      createdAt: startDate.toISOString(),
      updatedAt: new Date().toISOString()
    });
  }
  
  return customers;
}

export function generateEnergyUsage(customers: Customer[], daysBack: number = 30): EnergyUsage[] {
  const usageData: EnergyUsage[] = [];
  const now = new Date();
  
  customers.filter(c => c.contractStatus === 'active').forEach((customer, idx) => {
    for (let day = 0; day < daysBack; day++) {
      const date = new Date(now);
      date.setDate(date.getDate() - day);
      
      const baseEnergy = 800 + Math.random() * 400;
      const peakEnergy = Math.round(baseEnergy * (0.3 + Math.random() * 0.1) * 100) / 100;
      const flatEnergy = Math.round(baseEnergy * (0.5 + Math.random() * 0.1) * 100) / 100;
      const valleyEnergy = Math.round(baseEnergy * (0.2 + Math.random() * 0.1) * 100) / 100;
      const totalEnergy = Math.round((peakEnergy + flatEnergy + valleyEnergy) * 100) / 100;
      
      const predictedEnergy = Math.round(totalEnergy * (0.95 + Math.random() * 0.1) * 100) / 100;
      const actualEnergy = totalEnergy;
      const deviationRate = Math.round(((actualEnergy - predictedEnergy) / predictedEnergy * 100) * 100) / 100;
      
      const profitLoss = Math.round((actualEnergy * (350 + Math.random() * 100) - actualEnergy * (320 + Math.random() * 80)) * 100) / 100;
      
      usageData.push({
        id: `USAGE-${customer.id}-${date.toISOString().split('T')[0]}`,
        customerId: customer.id,
        customerName: customer.name,
        date: date.toISOString().split('T')[0],
        totalEnergy,
        peakEnergy,
        flatEnergy,
        valleyEnergy,
        predictedEnergy,
        actualEnergy,
        deviationRate,
        voltageLevel: customer.voltageLevel,
        profitLoss,
        ranking: idx + 1
      });
    }
  });
  
  return usageData;
}

export function generateCustomerQuality(customers: Customer[], usageData: EnergyUsage[]): CustomerQuality[] {
  return customers
    .filter(c => c.contractStatus === 'active')
    .map(customer => {
      const customerUsage = usageData.filter(u => u.customerId === customer.id);
      const avgDeviation = customerUsage.length > 0
        ? Math.abs(customerUsage.reduce((sum, u) => sum + u.deviationRate, 0) / customerUsage.length)
        : 0;
      const totalEnergy = customerUsage.reduce((sum, u) => sum + u.totalEnergy, 0);
      const profitability = customerUsage.reduce((sum, u) => sum + u.profitLoss, 0);
      
      const qualityScore = Math.round((
        (totalEnergy / 100000 * 40) +
        (Math.max(0, 100 - avgDeviation * 10) * 30 / 100) +
        (profitability / 10000 * 30)
      ) * 100) / 100;
      
      const category: CustomerQuality['category'] = 
        qualityScore >= 80 ? 'excellent' :
        qualityScore >= 60 ? 'good' :
        qualityScore >= 40 ? 'normal' : 'poor';
      
      return {
        customerId: customer.id,
        customerName: customer.name,
        qualityScore,
        averageDeviation: Math.round(avgDeviation * 100) / 100,
        totalEnergy: Math.round(totalEnergy * 100) / 100,
        profitability: Math.round(profitability * 100) / 100,
        category
      };
    })
    .sort((a, b) => b.qualityScore - a.qualityScore);
}

export function generateExecutionRecords(customers: Customer[], daysBack: number = 30): ExecutionRecord[] {
  const records: ExecutionRecord[] = [];
  const now = new Date();
  
  customers.filter(c => c.contractStatus === 'active').forEach(customer => {
    for (let day = 0; day < daysBack; day++) {
      const date = new Date(now);
      date.setDate(date.getDate() - day);
      
      for (let period = 0; period < 4; period++) {
        const executedVolume = Math.round((200 + Math.random() * 300) * 100) / 100;
        const executedPrice = Math.round((300 + Math.random() * 100) * 100) / 100;
        const executedRevenue = Math.round(executedVolume * executedPrice * 100) / 100;
        
        const predictedVolume = Math.round(executedVolume * (0.95 + Math.random() * 0.1) * 100) / 100;
        const allocationPrice = Math.round((executedPrice + (Math.random() - 0.5) * 50) * 100) / 100;
        
        const volumeDeviation = Math.round((executedVolume - predictedVolume) * 100) / 100;
        const volumeDeviationRate = Math.round((volumeDeviation / predictedVolume * 100) * 100) / 100;
        
        const estimatedTotalRevenue = Math.round(predictedVolume * allocationPrice * 100) / 100;
        const actualRevenue = executedRevenue;
        const revenueDeviation = Math.round((actualRevenue - estimatedTotalRevenue) * 100) / 100;
        
        const absDeviationRate = Math.abs(volumeDeviationRate);
        const status: ExecutionRecord['status'] = 
          absDeviationRate > 10 ? 'anomaly' :
          date < new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000) ? 'completed' : 'executing';
        
        const executionProgress = status === 'completed' ? 100 : Math.round((80 + Math.random() * 20) * 100) / 100;
        
        records.push({
          id: `EXEC-${customer.id}-${date.toISOString().split('T')[0]}-P${period}`,
          customerId: customer.id,
          customerName: customer.name,
          packageType: customer.packageType,
          executionDate: date.toISOString().split('T')[0],
          executionPeriod: `${period * 6}:00-${(period + 1) * 6}:00`,
          executedVolume,
          executedPrice,
          executedRevenue,
          predictedVolume,
          allocationPrice,
          volumeDeviation,
          volumeDeviationRate,
          estimatedTotalRevenue,
          actualRevenue,
          revenueDeviation,
          status,
          executionProgress
        });
      }
    }
  });
  
  return records;
}

export function generateCustomerSummary(customers: Customer[], executionRecords: ExecutionRecord[]): CustomerSummary[] {
  return customers
    .filter(c => c.contractStatus === 'active')
    .map(customer => {
      const customerRecords = executionRecords.filter(r => r.customerId === customer.id);
      
      const totalExecutedVolume = customerRecords.reduce((sum, r) => sum + r.executedVolume, 0);
      const totalExecutedRevenue = customerRecords.reduce((sum, r) => sum + r.executedRevenue, 0);
      const averageDeviationRate = customerRecords.length > 0
        ? Math.abs(customerRecords.reduce((sum, r) => sum + r.volumeDeviationRate, 0) / customerRecords.length)
        : 0;
      const anomalyCount = customerRecords.filter(r => r.status === 'anomaly').length;
      const completedCount = customerRecords.filter(r => r.status === 'completed').length;
      const executionRate = customerRecords.length > 0 ? (completedCount / customerRecords.length * 100) : 0;
      
      const lastRecord = customerRecords.sort((a, b) => 
        new Date(b.executionDate).getTime() - new Date(a.executionDate).getTime()
      )[0];
      
      return {
        customerId: customer.id,
        customerName: customer.name,
        packageType: customer.packageType,
        totalExecutedVolume: Math.round(totalExecutedVolume * 100) / 100,
        totalExecutedRevenue: Math.round(totalExecutedRevenue * 100) / 100,
        averageDeviationRate: Math.round(averageDeviationRate * 100) / 100,
        anomalyCount,
        executionRate: Math.round(executionRate * 100) / 100,
        lastExecutionTime: lastRecord ? lastRecord.executionDate : ''
      };
    });
}
