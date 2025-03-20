export class WrongTaskStatusException extends Error {
  constructor() {
    super('Wrong task status order');

    this.name = 'WrongTaskStatusException';
  }
}
