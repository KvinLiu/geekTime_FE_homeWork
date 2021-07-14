class NumberConvert {
  constructor(number) {
    const dict = "0123456789abcdefghigklmnopqrstuvwxyzABCDEFGHIGKLMNOPQRSTUVWXYZ#$".split(
      ""
    );
    // 用于判断是 decode 或是 encode, false => decode
    this.type = false;
    if (typeof number === "number") {
      this.type = true;
    }
    this.number = number;
    this.dict = dict;
    this.radix = dict.length;
  }
  preProcess() {
    let pN = String(this.number);
    let wN, fR, sM;
    if (pN[0] === "-") {
      pN = pN.substring(1);
      sM = "-";
    }
    if (pN[0] === "+") {
      pN = pN.substring(1);
    }
    let idx = pN.indexOf(".");
    wN = pN;
    if (idx !== -1) {
      wN = pN.substring(0, idx);
      fR = pN.substring(idx + 1);
    }
    return { wN, fR, sM };
  }
  // 将十进制转化为64进制
  _tenTosf(num) {
    let radix = this.radix,
      mod,
      arr = [];
    do {
      mod = num % radix;
      num = (num - mod) / radix;
      arr.unshift(this.dict[mod]);
    } while (num);

    return arr.join("");
  }
  // 将 64 进制 转回 10 进制
  _sfToten(sf) {
    let num = 0;
    let radix = this.radix;
    let ln = sf.length;
    for (let i in sf) {
      let n = this.dict.indexOf(sf[i]);
      num += Math.pow(radix, ln - i - 1) * n;
    }
    return num;
  }

  _comp(fn) {
    let { wN, fR, sM } = this.preProcess(this.number);
    if (this.type) {
      wN = Number(wN);
      fR = Number(fR);
    }
    let result = fn.bind(this)(wN);
    if (fR) {
      result = result + "." + fn.bind(this)(fR);
    }
    if (sM) {
      result = sM + result;
    }
    if (!this.type) result = Number(result);
    return result;
  }

  value() {
    if (this.type) return this._comp(this._tenTosf);
    return this._comp(this._sfToten);
  }
}

const newConvert = new NumberConvert("+9RYNGGZD.c");

console.log(newConvert.value());
