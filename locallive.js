// Written by Edness   2022-09-07 - 2023-05-08

function toInt(hexStr) {
    const nybbles = 12; // limit is 1<<53 (13.25), but using 1<<48 (12) to be byte aligned,
    const bits = BigInt(nybbles * 4); // so it's possible to increase to 1<<52 (13), but eh
    const input = hexStr.startsWith("0x") ? hexStr.slice(2) : hexStr;
    if (input.length <= nybbles) {
        return parseInt(input, 16);
    }
    let output = 0n;
    for (var idx = input.length, shift = 0n; idx > nybbles; idx -= nybbles, shift += bits) {
        output |= BigInt(parseInt(input.slice(idx - nybbles, idx), 16)) << shift;
    }
    output |= BigInt(parseInt(input.slice(0, idx), 16)) << shift;
    return output;
}

function hexInput(elem, size) {
    const input = document.getElementById(elem);
    const strFix = `0x${input.value.replace(/\s/g, "").slice(2, size + 2).toUpperCase().replace(/[^0-9A-F]/g, "0").padEnd(size, "0")}`;
    let curPos = input.selectionStart; // identical to selectionEnd
    if (curPos < 2) { curPos = 2; } // force to stay after 0x
    input.value = strFix;
    input.setSelectionRange(curPos, curPos);
    return toInt(strFix);
}

function toHex(num, size = 8) {
    return `0x${num.toString(16).padStart(size, "0").toUpperCase()}`;
}

/*
// I originally didn't realise TextEncoder had a separate method that automatically
// allocates a large enough buffer, so I wrote this whole thing to work around it...
function strInput(str, nullTerminate = false) {
    const strArr = new Uint8Array(str.length * 3 + 1);
    const textEncoder = new TextEncoder();
    textEncoder.encodeInto(str, strArr);
    //while (strArr.at(nullTerminate ? -2 : -1) === 0) {
    //    strArr.pop(); // can't use .pop() on Uint8Array
    //}
    for (var idx = strArr.length - 1; idx >= 0; idx--) {
        if (strArr[idx] !== 0) {
            break;
        }
    }
    return strArr.slice(0, idx + (nullTerminate ? 2 : 1));
}*/

function strInput(str) {
    return new TextEncoder().encode(str);
}

function toStr(strArr) {
    return new TextDecoder().decode(strArr);
}

function strReverse(str) {
    return str.split("").reverse().join("");
}

function rTrim(str) {
    return str.replace(/\s+$/g, "");
}

function arrCompare(arrLeft, arrRight) {
    if (arrLeft.length !== arrRight.length) {
        return false;
    }
    for (let i = 0; i < arrLeft.length; i++) {
        if (arrLeft[i] !== arrRight[i]) {
            return false;
        }
    }
    return true;
}

function objCompare(objLeft, objRight) {
    return arrCompare(Object.keys(objLeft), Object.keys(objRight)) && arrCompare(Object.values(objLeft), Object.values(objRight));
}

// I'll be honest I never bothered to look up if JS has any native method of reading bytes like a file,
// I just wrote this on a whim because I needed it for the Permanent Information & Control parser.
class HexReader {
    constructor(hexData) {
        this.hexData = hexData;
        this.hexOffset = 0x0; // Multiplied by 2 because technically it's always reading in nybbles
    }

    readInt(bytes) {
        return toInt(this.hexData.slice(this.hexOffset, this.hexOffset += bytes * 2));
    }

    readStr(bytes) {
        let str = "";
        for (let i = 0; i < bytes; i++) {
            let strByte = this.readInt(1);
            let decode = String.fromCharCode(strByte);
            str += decode.match(/[\x20-\x7E]/g) ? decode : `\\${toHex(strByte, 2).slice(1)}`;
        }
        return str;
    }

    seek(bytes, relative = false) {
        return this.hexOffset = (relative ? this.hexOffset : 0) + bytes * 2;
    }

    tell() {
        return this.hexOffset;
    }
}
