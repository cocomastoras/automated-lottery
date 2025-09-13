import { ethers } from 'ethers';

/**
 *
 * @param {String} str
 * @returns {Boolean}
 */
export function isEmptyStr(str) {
  return !str || str.length === 0;
}

/**
 *
 * @param {string} val
 * @returns {null|string}
 */
export function inputValidateNumeric(val) {
  // eslint-disable-next-line no-restricted-globals
  if (isNaN(val) || isEmptyStr(val)) {
    return null;
  }
  return val;
}

/**
 *
 * @param {string} val
 * @returns {number}
 */
export function decimalDigits(val) {
  return val.split('.')[1] ? val.split('.')[1].replace(/0+$/, '').length : 0;
}

/**
 *
 * @param {BigNumber} val
 * @param {number} decimals
 * @returns {string|null}
 */
export function normVal(val, decimals) {
  if (ethers.BigNumber.isBigNumber(val)) {
    return ethers.utils.formatUnits(val, decimals);
  }
  return null;
}

/**
 *
 * @param {string} val
 * @param {number} decimals
 * @returns {BigNumber|null}
 */
export function rawVal(val, decimals) {
  const trimmedStr = val.trim();
  if (inputValidateNumeric(trimmedStr)) {
    return ethers.utils.parseUnits(trimmedStr, decimals);
  }
  return null;
}

/**
 *
 * @param {string} strVal
 * @returns {string|null}
 */
export function formatNumberLocal(strVal) {
  if (typeof strVal !== 'string') {
    return null;
  }
  const dp = decimalDigits(strVal);
  const nf = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: dp,
    maximumFractionDigits: dp,
  });
  return nf.format(strVal);
}
