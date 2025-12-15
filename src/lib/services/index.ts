/**
 * 服务层统一导出
 * 提供完整的CRUD操作、数据验证、缓存和实时订阅功能
 */

// 基础服务和工具
export { ServiceError, cacheManager, createRealtimeSubscription, handleServiceError } from './base-service';

// 业务服务
export { customerService, type Customer, customerCreateSchema, customerUpdateSchema } from './customer-service';
export { tradingStrategyService, type TradingStrategy, strategyCreateSchema, strategyUpdateSchema } from './trading-strategy-service';
export { clearingService, type ClearingRecord, clearingCreateSchema, clearingUpdateSchema } from './clearing-service';
export { settlementService, type SettlementRecord, settlementCreateSchema, settlementUpdateSchema } from './settlement-service';
