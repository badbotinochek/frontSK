class EmailValidator {
  static validate(email) {
    const reg = /[a-z0-9.]{3,10}@[a-z]{3,10}\.[a-z]{2,6}/;
    return reg.test(email);
  }
}
