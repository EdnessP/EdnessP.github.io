// Written by Edness   2022-09-07 - 2023-02-27

function hexInput(str, size, elem) {
    const strPad = `0x${str.replace(/\s/g, "").slice(2, size + 2).toUpperCase().replace(/[^0-9A-F]/g, "0").padEnd(size, "0")}`;
    const input = document.getElementById(elem);
    let curPos = input.selectionStart; // identical to selectionEnd
    if (curPos < 2) { curPos = 2; } // force to stay after 0x
    input.value = strPad;
    input.setSelectionRange(curPos, curPos);
    return toInt(strPad);
}

function toHex(num, size = 8) {
    return `0x${num.toString(16).padStart(size, "0").toUpperCase()}`;
}

function toInt(hexStr) {
    const input = hexStr.startsWith("0x") ? hexStr.slice(2) : hexStr;
    if (input.length <= 12) { // limit is 1<<53, but using 1<<48 just because
        return parseInt(input, 16);
    }
    let output = 0n;
    for (var idx = input.length, shift = 0n; idx > 12; idx -= 12, shift += 48n) {
        output |= BigInt(parseInt(input.slice(idx - 12, idx), 16)) << shift;
    }
    output |= BigInt(parseInt(input.slice(0, idx), 16)) << shift;
    return output;
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

function reverseString(str) {
    return str.split("").reverse().join("");
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
