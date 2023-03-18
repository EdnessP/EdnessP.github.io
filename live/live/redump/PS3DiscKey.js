// PS3 Data1 <-> DiscKey AES-128 CBC encryption routine
// Script is based on publicly available information from the PS3 Dev Wiki
// Written by Edness   v1.4   2023-01-23 - 2023-03-09

function keyArrToInt(keyArr) {
    let key = 0n;
    for (let i = 0; i < 16; i++) {
        key <<= 8n;
        key |= BigInt(keyArr[i]);
    }
    return key;
}

function keyIntToArr(keyInt, arrLen = 16) {
    let key = new Uint8Array(arrLen);
    for (let i = 15; i >= 0; i--) {
        key[i] = Number(keyInt & 0xFFn);
        keyInt >>= 8n;
    }
    return key;
}

async function decryptDkey(elem) {
    const input = keyIntToArr(hexInput(elem, 32), 64);
    const output = document.getElementById("ps3-data1");
    input[47] = 0xB0; // See the comment at the end
    const data1KeyType = await data1KeySetup();
    let data1 = await window.crypto.subtle.decrypt(data1IvType, data1KeyType, input.buffer);
    data1 = keyArrToInt(new Uint8Array(data1, 0, 16));
    output.value = toHex(data1, 32);
}

async function encryptDkey(elem) {
    const input = keyIntToArr(hexInput(elem, 32));
    const output = document.getElementById("ps3-disc-key");
    const data1KeyType = await data1KeySetup();
    let dKey = await window.crypto.subtle.encrypt(data1IvType, data1KeyType, input);
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

/* 
 * Let me tell you about the unimaginable brain damage I obtained from writing
 * this.  More specifically the  crypto.subtle.decrypt  call, which for a good
 * while I thought was bugged and non-functioning, until by complete accident
 * I noticed that every number where the last byte is specifically 0xB0 would
 * actually work.  At this stage I had it written to pad to a 256-bit buffer.
 * If it had any other value, I would simply get a completely useless error in
 * the console that read  "Uncaught (in promise) DOMException: The operation
 * failed for an operation-specific reason"  and had me losing my mind for days
 * 
 * I realise this whole thing could've been avoided if I just switched to, say,
 * CryptoJS but I had already committed to finishing this in the HTTPS natively
 * provided SubtleCrypto.  I didn't want to let some weird bug make me give up.
 * 
 * Anyway, I then started thinking what if it's possible to have this mysterious
 * number that's outside of the useable area, so it can be masked away and still
 * return the correct key I need.  So I just wrote a bruteforcer to find all of
 * these magic numbers which can be found below.
 * And it turns out regardless of the ArrayBuffer size, the last 128 bits seem
 * always be reserved for them, so extending it to 64 bytes / 512 bits gives me
 * more than enough room to make this work.
 * 
 * It's a good thing I noticed that too, because after my initial discovery with
 * a 256-bit buffer, I worked out the various out of bounds numbers I can set so
 * they still cooperate with the changing 15th index that's still in bounds.

async function bruteforce() {
    dummyKey = "0x00000000000000000000000000000000";
    for (let arr15Num = 0; arr15Num < 256; arr15Num++) {
        for (let arrIdx = 16; arrIdx < 32; arrIdx++) {
            for (let arrNum = 0; arrNum < 256; arrNum++) {
                try {
                    await decryptDkey(dummyKey, arrIdx, arr15Num, arrNum);
                } catch (e) {
                    continue;
                }
            }
        }
    }
}

 */
