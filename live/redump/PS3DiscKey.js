// PS3 Data1 <-> DiscKey / Data2 <-> DiscID AES-128 CBC encryption routine
// Script is based on publicly available information from the PS3 Dev Wiki
// Written by Edness   v1.6   2023-01-23 - 2023-07-30

async function decryptKey(elem, outElem, dataKeySetup, dataIvType, fixSubtleCrypto) {
    const input = intToArr(hexInput(elem, 32), 64, 15);
    const output = document.getElementById(outElem);
    input[47] = fixSubtleCrypto; // See the comment at the end
    const dataKeyType = await dataKeySetup();
    let result = await window.crypto.subtle.decrypt(dataIvType, dataKeyType, input);
    result = arrToInt(new Uint8Array(result, 0, 16));
    output.value = toHex(result, 32);
}

async function encryptKey(elem, outElem, dataKeySetup, dataIvType) {
    const input = intToArr(hexInput(elem, 32), 16);
    const output = document.getElementById(outElem);
    const dataKeyType = await dataKeySetup();
    let result = await window.crypto.subtle.encrypt(dataIvType, dataKeyType, input);
    result = arrToInt(new Uint8Array(result, 0, 16));
    output.value = toHex(result, 32);
}

async function decryptD1Key() {
    await decryptKey("ps3-disc-key", "ps3-data1", data1KeySetup, data1IvType, 0xB0);
}

async function encryptD1Key() {
    await encryptKey("ps3-data1", "ps3-disc-key", data1KeySetup, data1IvType);
}

async function decryptD2ID() {
    await decryptKey("ps3-data2", "ps3-disc-id", data2KeySetup, data2IvType, 0x59);
}

async function encryptD2ID() {
    await encryptKey("ps3-disc-id", "ps3-data2", data2KeySetup, data2IvType);
}

// Data1 <-> DiscKey
const data1Key = intToArr(0x380BCF0B53455B3C7817AB4FA3BA90EDn, 16);
const data1Iv = intToArr(0x69474772AF6FDAB342743AEFAA186287n, 16);

const data1IvType = {name: "AES-CBC", iv: data1Iv};
async function data1KeySetup() {
    return await window.crypto.subtle.importKey(
        "raw", data1Key, {name: "AES-CBC"}, true, ["encrypt", "decrypt"]
    );
}

// Data2 <-> DiscID
const data2Key = intToArr(0x7CDD0E02076EFE4599B1B82C359919B3n, 16);
const data2Iv = intToArr(0x2226928D44032F436AFD267E748B2393n, 16);

const data2IvType = {name: "AES-CBC", iv: data2Iv};
async function data2KeySetup() {
    return await window.crypto.subtle.importKey(
        "raw", data2Key, {name: "AES-CBC"}, true, ["encrypt", "decrypt"]
    );
}

/* Original:
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

 * Update:
 * Turns out what the 15th index from the end needs to be set to depends on the
 * input key, which I found out from adding Data2 DiscID support.  With the now
 * redone decryption/encryption function calls, they can be bruteforced much a
 * lot more easily like this:

async function decryptUnk() {
    for (let i = 0; i < 256; i++) {
        try {
            await decryptKey("in-elem", "out-elem", unkKeySetup, unkIvType, i);
            console.log(i);
        } catch (e) {
            continue;
        }
    }
}

 */
