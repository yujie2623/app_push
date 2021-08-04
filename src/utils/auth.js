import Cookies from 'js-cookie'

const TokenKey = 'admin-token'
const TokenId = 'id'
const TokenPass = 'Pass'
const Logined = 'Logined'
export function getToken() {
  return Cookies.get(TokenKey)
}

export function setToken(token) {
  return Cookies.set(TokenKey, token)
}

export function removeToken() {
  return Cookies.remove(TokenKey)
}

// 存个id
export function getID() {
  return Cookies.get(TokenId)
}

export function setID(token) {
  return Cookies.set(TokenId, token)
}

export function removeID() {
  return Cookies.remove(TokenId)
}

// 存个密码 因为修改密码的旧密码需要验证
export function getPass() {
  return Cookies.get(TokenPass)
}

export function setPass(token) {
  return Cookies.set(TokenPass, token)
}

export function removePass() {
  return Cookies.remove(TokenPass)
}

// 存储第一次登录的状态 显示引导页
export function getLogined() {
  return Cookies.get(Logined)
}

export function setLogined(val) {
  return Cookies.set(Logined, val)
}

export function removeLogined() {
  return Cookies.remove(Logined)
}
