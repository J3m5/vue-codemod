import type { CollectorValues, TransformParams } from './utils'

const toArray = (nodes: CollectorValues) => {
  return Array.isArray(nodes) ? nodes : [...nodes.values()]
}

export const insertNodes = ({ defaultExport, collector }: TransformParams) => {
  const nodes = Object.values(collector.nodes)
    .map(nodeValues => toArray(nodeValues))
    .flat()

  defaultExport.insertBefore(nodes)
}
