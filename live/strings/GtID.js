// A heavily simplified JavaScript reimplementation of Burnout's  GtIDCompress
// and  GtIDUnCompress  functions - an 8 byte compressed format for strings up
// to 12 characters long using upper-case alphanumeric symbols.

// Written by Edness   v1.2   2022-09-09 - 2023-03-09

const boCharSize = 12;

const boChars = " -/0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_";

const boCmpChars = new Uint8Array(256);
for (let x = 0; x < boChars.length; x++) {
    boCmpChars[boChars.charCodeAt(x)] = x;
}

function boCompGtID(str) {
    const input = strReverse(str.toUpperCase().replace(/[^\s0-9A-Z-/_]/g, " ").padEnd(boCharSize, " "));
    const output = document.getElementById("bo-id-comp-output");
    let result = new BigUint64Array([0n]);
    for (let i = 0; i < boCharSize; i++) {
        result[0] += BigInt(boCmpChars[input.charCodeAt(i)]) * (BigInt(boChars.length) ** BigInt(i));
    }
    output.value = toHex(result[0], 16);
}

function boDecompGtID(elem) {
    const input = new BigUint64Array([hexInput(elem, 16)]);
    const output = document.getElementById("bo-id-decomp-output");
    let string = "";
    for (let i = 0; i < boCharSize; i++) {
        string += boChars[input[0] % BigInt(boChars.length)];
        input[0] /= BigInt(boChars.length);
    }
    output.value = rTrim(strReverse(string));
}
