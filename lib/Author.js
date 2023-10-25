export class Author {
  constructor(name, email, time) {
    this.name = name;
    this.email = email;
    this.time = time;
  }
  toString() {
    return `${this.name} <${this.email}> ${this.time}`;
  }
}
