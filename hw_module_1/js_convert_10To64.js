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
    let wN, fR, sM, valiB;
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
      // 0.00001 处理这种情况
      let temp = pN.substring(idx + 1);
      if (this.type) {
        fR = temp;
        // .00000001 valiB 指的是无效 0 的个数
        valiB = fR.split("").findIndex((val) => val[0] > 0 || val[1] > 0);
      } else {
        let sentinel = temp.indexOf("*");
        if (sentinel === -1) {
          fR = temp;
        } else {
          fR = temp.substring(0, sentinel);
          // "saf.edfac*iex"  valiB 指的是 *后边的64位, 默认位 undefined
          valiB = temp.substring(sentinel + 1);
        }
      }
    }
    return { wN, fR, sM, valiB };
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
    let { wN, fR, sM, valiB } = this.preProcess(this.number);
    if (this.type) {
      wN = Number(wN);
      fR = Number(fR);
    }
    let result = fn.bind(this)(wN);
    if (fR) {
      if (this.type) {
        result = result + "." + fn.bind(this)(fR);
        if (valiB > 0) {
          result = result + "*" + fn.bind(this)(valiB);
        }
      } else {
        if (valiB) {
          let tempString = "";
          for (let i = 0; i < fn.bind(this)(valiB); i++) {
            tempString += "0";
          }
          result = result + "." + tempString + fn.bind(this)(fR);
        } else {
          result = result + "." + fn.bind(this)(fR);
        }
      }
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

// test
// let randomNum = 2423.000000430001;
let randomNum = 998387023340;
console.log("first Num: ", randomNum);
const newValue = new NumberConvert(randomNum);
let converted = newValue.value();
console.log("Converted Num: ", converted);
const secondValue = new NumberConvert(converted);
let secondConverted = secondValue.value();
console.log("Converted Back: ", secondConverted);
console.log("Converted Success? ", secondConverted === randomNum);
