export class Blob {
  constructor(data) {
    this.type = "blob";
    this.data = data;
    this.oid = null;
  }
  toString() {
    return this.data;
  }
  static parse(content) {
    return new Blob(content);
  }
}
