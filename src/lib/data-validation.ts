/**
 * Data validation utilities for power trading system
 * Ensures all displayed values are physically realistic and within expected bounds
 */

/**
 * Validates load values to ensure they are non-negative and within realistic bounds
 * @param value - Load value in MW
 * @returns Validated load value
 */
export const validateLoadValue = (value: number): number => {
  if (value < 0) {
    console.warn(`Negative load detected: ${value}, correcting to 0`);
    return 0;
  }
  if (value > 50000) {
    console.warn(`Load value ${value} exceeds maximum (50000 MW), capping`);
    return 50000;
  }
  return value;
};

/**
 * Validates price values to ensure they are realistic
 * @param value - Price value in ¥/MWh
 * @returns Validated price value
 */
export const validatePrice = (value: number): number => {
  if (value < 0) {
    console.warn(`Negative price detected: ${value}, correcting to 0`);
    return 0;
  }
  if (value > 2000) {
    console.warn(`Price value ${value} exceeds maximum (2000 ¥/MWh), capping`);
    return 2000;
  }
  return value;
};

/**
 * Validates percentage values
 * @param value - Percentage value
 * @returns Validated percentage (0-100)
 */
export const validatePercentage = (value: number): number => {
  if (value < 0) return 0;
  if (value > 100) return 100;
  return value;
};

/**
 * Validates revenue values to ensure they are non-negative
 * @param value - Revenue value
 * @returns Validated revenue value
 */
export const validateRevenue = (value: number): number => {
  if (value < 0) {
    console.warn(`Negative revenue detected: ${value}, correcting to 0`);
    return 0;
  }
  return value;
};

/**
 * Checks if a value seems suspicious and should be flagged
 * @param value - Value to check
 * @param expectedRange - Expected range [min, max]
 * @returns True if value is outside expected range
 */
export const isSuspiciousValue = (
  value: number,
  expectedRange: [number, number]
): boolean => {
  return value < expectedRange[0] || value > expectedRange[1];
};
