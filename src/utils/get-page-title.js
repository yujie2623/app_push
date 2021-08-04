import defaultSettings from '@/settings'

const title = defaultSettings.title || '异构云应用推送系统'

export default function getPageTitle(pageTitle) {
  // if (pageTitle) {
  //   return `${pageTitle} - ${title}`
  // }
  return `${title}`
}
