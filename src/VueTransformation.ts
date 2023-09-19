import type { FileInfo, Options } from 'jscodeshift'

export default interface VueTransformation {
  (file: FileInfo, options: Options): string | null | undefined | void
  type: string
}
