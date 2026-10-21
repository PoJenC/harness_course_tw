import { defineMermaidSetup } from '@slidev/types'

// 流程圖配色，跟 style.css 的主題色一致
export default defineMermaidSetup(() => ({
  theme: 'base',
  themeVariables: {
    primaryColor: '#eef5f7',
    primaryBorderColor: '#2f6f7e',
    primaryTextColor: '#1f2f33',
    lineColor: '#2f6f7e',
    secondaryColor: '#fff6ee',
    tertiaryColor: '#f8fbfc',
    clusterBkg: '#f8fbfc',
    clusterBorder: '#9cc3cc',
    edgeLabelBackground: '#ffffff',
    fontFamily: 'Noto Sans TC, sans-serif',
  },
}))
