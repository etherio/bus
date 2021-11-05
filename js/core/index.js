function toBurmeseString() {
  return this.toString()
    .split("")
    .map((x) => ["၀", "၁", "၂", "၃", "၄", "၅", "၆", "၇", "၈", "၉"][x] || x)
    .join("");
}

Number.prototype.toBurmeseString = toBurmeseString;
String.prototype.toBurmeseString = toBurmeseString;
