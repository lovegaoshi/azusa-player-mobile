declare namespace NoxRegExt {
  type Operation = [OPERATIONTYPE, string[]?];
  interface JSONExtractor {
    uploaders: string[];
    operations: Operation[];
  }
}
