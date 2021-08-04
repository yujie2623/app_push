const getters = {
  sidebar: state => state.app.sidebar,
  device: state => state.app.device,
  token: state => state.user.token,
  avatar: state => state.user.avatar,
  name: state => state.user.name,
  firstlogin: state => state.user.firstlogin,
  active: state => state.user.active,
  permission_routers: state => state.premission.routes,
  addRoutes: state => state.premission.addRoutes
}
export default getters
