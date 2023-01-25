// PS3 Data1 <-> DiscKey AES-128 CBC encryption routine
// Script is based on publicly available information!
// Written by Edness   v1.1   2023-01-23 - 2023-01-27

function keyArrToInt(keyArr) {
    let key = 0n;
    for (i = 0; i < 16; i++) {
        key <<= 8n;
        key |= BigInt(keyArr[i]);
    }
    return key;
}

function keyIntToArr(keyInt, arrLen = 16) {
    let key = new Uint8Array(arrLen);
    for (i = 15; i >= 0; i--) {
        key[i] = Number(keyInt & 0xFFn);
        keyInt >>= 8n;
    }
    return key;
}

function keyStrToArr(keyStr, arrLen = 16) {
    let key = 0n;
    key |= BigInt(parseInt(keyStr.slice(0, 10), 16)) << 96n;
    key |= BigInt(parseInt(keyStr.slice(10, 18), 16)) << 64n;
    key |= BigInt(parseInt(keyStr.slice(18, 26), 16)) << 32n;
    key |= BigInt(parseInt(keyStr.slice(26, 34), 16));
    return keyIntToArr(key, arrLen);
}

async function decryptDkey(str) {
    const input = hexInput(str, 32, "ps3-disc-key");
    const output = document.getElementById("ps3-data1");
    const dKey = keyStrToArr(input, 32).buffer;
    const data1KeyType = await data1KeySetup();
    // I can't for the life of me figure out why this doesn't work...
    let data1 = await window.crypto.subtle.decrypt(data1IvType, data1KeyType, dKey);
    data1 = keyArrToInt(new Uint8Array(data1, 0, 16));
    output.value = toHex(data1, 32);
}

async function encryptDkey(str) {
    const input = hexInput(str, 32, "ps3-data1");
    const output = document.getElementById("ps3-disc-key");
    const data1 = keyStrToArr(input);
    const data1KeyType = await data1KeySetup();
    let dKey = await window.crypto.subtle.encrypt(data1IvType, data1KeyType, data1);
    dKey = keyArrToInt(new Uint8Array(dKey, 0, 16));
    output.value = toHex(dKey, 32);
}

const data1Key = keyIntToArr(0x380BCF0B53455B3C7817AB4FA3BA90EDn);
const data1Iv = keyIntToArr(0x69474772AF6FDAB342743AEFAA186287n);

const data1IvType = {name: "AES-CBC", iv: data1Iv};
async function data1KeySetup() {
    return await window.crypto.subtle.importKey(
        "raw", data1Key, {name: "AES-CBC"}, true, ["encrypt", "decrypt"]
    );
}
