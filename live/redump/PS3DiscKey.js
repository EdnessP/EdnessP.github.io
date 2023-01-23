// PS3 Data1 <-> DiscKey AES-128 CBC encryption routine
// Information based on publicly available information!
// Written by Edness   v1.0   2023-01-23

function keyArrToInt(keyArr) {
    let key = 0n;
    for (i = 0; i < 16; i++) {
        key <<= 8n;
        key |= BigInt(keyArr[i]);
    }
    return key;
}

function keyIntToArr(keyInt) {
    let key = new Uint8Array(32);
    for (i = 15; i >= 0; i--) {
        key[i] = Number(keyInt & 0xFFn);
        keyInt >>= 8n;
    }
    return key;
}

function keyStrToArr(keyStr) {
    let key = 0n;
    key |= BigInt(parseInt(keyStr.slice(0, 10), 16)) << 96n;
    key |= BigInt(parseInt(keyStr.slice(10, 18), 16)) << 64n;
    key |= BigInt(parseInt(keyStr.slice(18, 26), 16)) << 32n;
    key |= BigInt(parseInt(keyStr.slice(26, 34), 16));
    return keyIntToArr(key);
}

async function decryptDkey(input) {
    let dKey = keyStrToArr(input);
    let data1 = await window.crypto.subtle.decrypt(data1IvType, data1KeyType, dKey);
    let output = keyArrToInt(new Uint8Array(data1, 0, 16));
    return output;
}

async function encryptDkey(input) {
    let data1 = keyStrToArr(input);
    let dKey = await window.crypto.subtle.encrypt(data1IvType, data1KeyType, data1);
    let output = keyArrToInt(new Uint8Array(dKey, 0, 16));
    return output;
}

const data1Key = keyIntToArr(0x380BCF0B53455B3C7817AB4FA3BA90EDn);
const data1Iv = keyIntToArr(0x69474772AF6FDAB342743AEFAA186287n);

const data1IvType = {name: "AES-CBC", iv: data1Iv};
const data1KeyType = await window.crypto.subtle.importKey(
    "raw", data1Key, {name: "AES-CBC"}, true, ["encrypt", "decrypt"]
);
