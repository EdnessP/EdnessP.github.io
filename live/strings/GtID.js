// A heavily simplified JavaScript reimplementation of Burnout's  GtIDCompress
// and  GtIDUnCompress  functions - an 8 byte compressed format for strings up
// to 12 characters long using upper-case alphanumeric symbols.

// Written by Edness   v1.1   2022-09-09 - 2023-02-27

const boCharSize = 12;

const boChars = " -/0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_";

const boCmpChars = new Uint8Array(256);
for (let x = 0; x < boChars.length; x++) {
    boCmpChars[boChars.charCodeAt(x)] = x;
}

function boCompGtID(str) {
    const input = reverseString(str.toUpperCase().replace(/[^\s0-9A-Z-/_]/g, " ").padEnd(boCharSize, " "));
    const output = document.getElementById("bo-id-comp-output");
    let result = new BigUint64Array([0n]);
    for (let i = 0; i < boCharSize; i++) {
        // I'm aware of the 53-bit precision limit in JS but none of these BigInt() calculations
        // should exceed that.  Only the result should, which is mitigated by BigUint64Array().
        result[0] += BigInt(boCmpChars[input.charCodeAt(i)]) * BigInt(boChars.length ** i);
    }
    output.value = toHex(result[0], 16);
}

function boDecompGtID(str) {
    const input = new BigUint64Array([hexInput(str, 16, "bo-id-comp-output")]);
    const output = document.getElementById("bo-id-decomp-output");
    let string = "";
    for (let i = 0; i < boCharSize; i++) {
        string += boChars[input[0] % BigInt(boChars.length)];
        input[0] /= BigInt(boChars.length);
    }
    output.value = reverseString(string).replace(/\s+$/g, "");
}
