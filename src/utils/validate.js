/**
 * Created by PanJiaChen on 16/11/18.
 */

/**
 * @param {string} path
 * @returns {Boolean}
 */
export function isExternal(path) {
  return /^(https?:|mailto:|tel:)/.test(path)
}

/**
 * @param {string} str
 * @returns {Boolean}
 */

export function validatpass(str) {
  const reg = /^([a-z0-9\.\@\!\#\$\%\^\&\*\(\)]){6,20}$/i
  return reg.test(str)
}

// 验证版本号
export function verson(str) {
  const reg = /^\d+(\.\d+)+$/
  return reg.test(str)
}

// 验证IP地址
export function isIP(str) {
  const reg = /^(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]{1}[0-9]{1}|[1-9])(\.)(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]{1}[0-9]{1}|[0-9])(\.)(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]{1}[0-9]{1}|[0-9])(\.)(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]{1}[0-9]{1}|[0-9])$/
  return reg.test(str)
}

// 验证整数
export function isInteger(str) {
  const reg = /^[1-9]\d*$/
  return reg.test(str)
}
