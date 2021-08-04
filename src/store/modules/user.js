import { login, logout } from '@/api/user'
import { getToken, setToken, removeToken, getID, setID, removeID, getPass, setPass, removePass, getLogined, setLogined, removeLogined } from '@/utils/auth'
// import { resetRouter } from '@/router'
import router, { resetRouter } from '@/router'

const getDefaultState = () => {
  return {
    token: getToken(),
    name: '',
    id: getID(),
    avatar: '',
    pass: getPass(),
    firstlogin: null,
    active: null
  }
}

const state = getDefaultState()

const mutations = {
  RESET_STATE: (state) => {
    Object.assign(state, getDefaultState())
  },
  SET_TOKEN: (state, token) => {
    state.token = token
  },
  SET_NAME: (state, name) => {
    state.name = name
  },
  SET_ID: (state, id) => {
    state.id = id
  },
  SET_PASS: (state, pass) => {
    state.pass = pass
  },
  SET_FIRST_LOGIN: (state, firstlogin) => {
    state.firstlogin = firstlogin
  },
  SET_ACTIVE: (state, active) => {
    state.active = active
  }
}

const actions = {
  // user login
  login({ commit }, userInfo) {
    const { uid, pwd } = userInfo
    return new Promise((resolve, reject) => {
      login({ uid: uid.trim(), pwd: pwd }).then(response => {
        if (response.code === 0) {
          const { uid, logined } = response
          commit('SET_TOKEN', uid)
          commit('SET_FIRST_LOGIN', logined)
          setLogined(logined)
          setToken(uid)
          commit('SET_NAME', uid)
          commit('SET_ID', response.id)
          commit('SET_PASS', pwd)
          setID(response.id)
          setPass(pwd)
        }
        resolve(response)
      }).catch(error => {
        reject(error)
      })
    })
  },
  // 当为on的时候代表有权限 路由next()
  stopEach({ commit }) {
    return new Promise((resolve) => {
      commit('SET_FIRST_LOGIN', getLogined())
      commit('SET_ACTIVE', 'on')
      resolve()
    })
  },

  // 引导页设置完成 路由变化
  async changeRoles({ commit, dispatch }, data) {
    await dispatch('stopEach')
    resetRouter()
    const accessRoutes = await dispatch('GenerateRoutes', data, { root: true })
    console.log(accessRoutes)
    router.addRoutes(accessRoutes)
  },
  // user logout
  logout({ commit, state }) {
    return new Promise((resolve, reject) => {
      logout(state.token).then(() => {
        removeToken() // must remove  token  first
        removeID()
        removePass()
        resetRouter()
        removeLogined()
        commit('RESET_STATE')
        resolve()
      }).catch(error => {
        reject(error)
      })
    })
  },

  // remove token
  resetToken({ commit }) {
    return new Promise(resolve => {
      removeToken() // must remove  token  first
      removeID()
      removePass()
      commit('RESET_STATE')
      resolve()
    })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}

