import type {
  ArrowFunctionExpression,
  Collection,
  CommentBlock,
  ExportDefaultDeclaration,
  ExpressionStatement,
  FunctionExpression,
  Identifier,
  ImportDeclaration,
  ObjectExpression,
  ObjectMethod,
  ObjectProperty,
  VariableDeclaration
} from 'jscodeshift'

export type Imports = 'vue' | 'vue-router' | 'vuex'

export type Collector = {
  nodes: {
    props: VariableDeclaration[]
    ref: Map<string, VariableDeclaration>
    reactive: Map<string, VariableDeclaration>
    $refs: Map<string, VariableDeclaration>
    computed: Map<string, VariableDeclaration>
    method: Map<string, VariableDeclaration>
    watch: ExpressionStatement[]
    imports: ImportDeclaration[]
    lifecycleHooks: Map<string, ExpressionStatement>
    routerHooks: Map<string, ExpressionStatement>
  }
  comments: Map<string, CommentBlock>
  propsNames: string[]
}
export type CollectorKeys = keyof Collector['nodes']

export type CollectorValues = Collector['nodes'][CollectorKeys]

export type ExportDefaultCollection = Collection<ExportDefaultDeclaration>
export interface TransformParams {
  defaultExport: ExportDefaultCollection
  collector: Collector
}

export interface ObjectMethodWithKey extends ObjectMethod {
  key: Identifier
}

export interface ObjectPropertyWithKey extends ObjectProperty {
  value: ArrowFunctionExpression | FunctionExpression
  key: Identifier
}

export type ObjectFunction = ObjectMethodWithKey | ObjectPropertyWithKey

export type Property = ObjectExpression['properties'][number]
