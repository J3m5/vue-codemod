// Custom global variables
export type GlobalApi = {
  name: string
  path: string
}

export type ManualList = {
  path: string
  position: string
  name: string
  suggest: string
  website: string
}

declare global {
  // Use to add global variables used by components to main.js
  let globalApi: GlobalApi[]
  let manualList: ManualList[]
  let scriptLine: number
  let outputReport: { [key: string]: number }
  let subRules: { [key: string]: number }
}

export {}
