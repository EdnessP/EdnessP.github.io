// Reimplemented from the function at  000A09B8  on the IOP
// of the  OVERLRD2.IRX  module in the PAL version of Jak 3

// Written by Edness   v1.0   2023-05-11

const jakChars = " ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-";

function jakDecompVagdir(elem) {
    const input = new BigUint64Array([hexInput(elem, 16)]);
    const outName = document.getElementById("jak-decomp-output");
    const outOffset = document.getElementById("jak-decomp-offset");
    const outFrequency = document.getElementById("jak-decomp-frequency");

    if (!input[0]) {
        outName.value = "";
        outOffset.value = "";
        outFrequency.value = "";
        $("#jak-decomp-stereo-toggle").prop("checked", false);
        $("#jak-decomp-vwint-toggle").prop("checked", false);
        return;
    }

    const cmpName = input[0] & 0x3FFFFFFFFFFn;
    const isStereo = input[0] >> 42n & 0x1n;
    const isVagwadInt = input[0] >> 43n & 0x1n;
    const inFrequency = input[0] >> 44n & 0xFn;
    const inOffset = input[0] >> 48n << 15n;

    let inName = "";
    let tmpName = cmpName & 0x1FFFFFn;
    for (let i = 0; i < 8; i++) {
        if (i === 4) {
            tmpName = cmpName >> 21n;
        }
        inName += jakChars[Number(tmpName) % jakChars.length];
        tmpName = BigInt(parseInt(tmpName / BigInt(jakChars.length)));
    }

    outName.value = rTrim(strReverse(inName));
    outOffset.value = toHex(inOffset, 8);
    outFrequency.value = toHex(inFrequency, 1);

    $("#jak-decomp-stereo-toggle").prop("checked", isStereo);
    $("#jak-decomp-vwint-toggle").prop("checked", isVagwadInt);
}

function jakCompVagdir(strCall) {
    const inOffset = hexInput("jak-decomp-offset", 8);
    const inFrequency = hexInput("jak-decomp-frequency", 1);
    const output = document.getElementById("jak-comp-output");
    const inName = document.getElementById("jak-decomp-output").value;
    const isStereo = document.querySelector("#jak-decomp-stereo-toggle").checked;
    const isVagwadInt = document.querySelector("#jak-decomp-vwint-toggle").checked;

    if (strCall && !inName && !inOffset && !inFrequency && !isStereo && !isVagwadInt) {
        output.value = toHex(0, 16);
        document.getElementById("jak-decomp-offset").value = "";
        document.getElementById("jak-decomp-frequency").value = "";
        //$("#jak-decomp-stereo-toggle").prop("checked", false);
        //$("#jak-decomp-vwint-toggle").prop("checked", false);
        return;
    }

    const input = inName.toUpperCase().replace(/[^\s0-9A-Z]/g, "-").padEnd(8, " ");
    const entry = new BigUint64Array([0n]);

    let tmpName = 0n;
    for (let i = 0; i < 8; i++) {
        if (i === 4) {
            entry[0] |= tmpName << 21n;
            tmpName = 0n;
        }
        tmpName *= BigInt(jakChars.length);
        tmpName += BigInt(jakChars.indexOf(input[i]));
    }
    entry[0] |= tmpName;

    entry[0] |= BigInt(isStereo) << 42n;
    entry[0] |= BigInt(isVagwadInt) << 43n;
    entry[0] |= BigInt(inFrequency) << 44n;
    entry[0] |= BigInt(inOffset) >> 15n << 48n;

    //if (inOffset < 0) {
    //if (inOffset & 0x7FFF) {
    //    outOffset.value = toHex(((inOffset >> 15) + 1) << 15, 8);
    //}

    output.value = toHex(entry[0], 16);
}
