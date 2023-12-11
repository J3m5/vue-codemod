import type { Collection } from 'jscodeshift'
import j from 'jscodeshift'
import type { CollectorValues, TransformParams } from './types'

const toArray = (nodes: CollectorValues) => {
  return Array.isArray(nodes) ? nodes : [...nodes.values()]
}

export const insertNodes = ({
  defaultExport,
  collector,
  root
}: TransformParams & { root: Collection }) => {
  const nodes = Object.values(collector.nodes)
    .map(nodeValues => toArray(nodeValues))
    .flat()

  defaultExport.insertBefore(nodes)

  root.find(j.Program).nodes()[0].comments = [...collector.comments.values()]
}
