// Written by Edness   v1.0   2023-02-18

const aeEncryptKey = "6Ev2GlK1sWoCa5MfQ0pj43DH8Rzi9UnX";
const aeEncryptHash = 0x0CEB538D;

function aeEncrypt(str) {
    const output = document.getElementById("bullyae-encrypted");
    if (str === "") {
        output.value = "";
        return;
    }

    let encData = "Wx";
    const decData = strInput(str + "\x00");
    const decSize = decData.length - 1;
    const encSize = parseInt((decSize << 3) / 5) + 1;

    let xor = 18;
    let hash = new Uint32Array([aeEncryptHash]);
    for (let i = 0; i < decSize; i++) {
        hash[0] = 0xAB * (hash[0] % 0xB1) - 2 * parseInt(hash[0] / 0xB1);
        decData[i] = (decData[i] - hash[0]) ^ xor;
        xor += 6;
    }

    let idx = 0;
    let sCase = 0;
    let rmChar = false;
    for (let i = 0; i < encSize; i++) {
        let cChar = decData[idx];
        if (idx + 1 < decData.length) {
            var cNext = decData[idx + 1];
        } else {
            rmChar = true;
            cNext = 0;
        }

        switch (sCase) {
            case 0:
                cChar >>= 3;
                break;
            case 1:
                cChar = cChar >> 2 & 0x1F;
                break;
            case 2:
                cChar = cChar >> 1 & 0x1F;
                break;
            case 3:
                cChar &= 0x1F;
                break;
            case 4:
                cChar = (cChar & 0xF) << 1 | cNext >> 7;
                break;
            case 5:
                cChar = (cChar & 0x7) << 2 | cNext >> 6;
                break;
            case 6:
                cChar = (cChar & 0x3) << 3 | cNext >> 5;
                break;
            case 7:
                cChar = (cChar & 0x1) << 4 | cNext >> 4;
                break;
        }
        encData += aeEncryptKey[cChar];

        if ((sCase + 5) % 8 < sCase) {
            idx += 1;
        }
        sCase = (sCase + 5) % 8;
    }
    output.value = rmChar ? encData.slice(0, -1) : encData;
}

function aeDecrypt(str) {
    const output = document.getElementById("bullyae-decrypted");
    if (str === "") {
        output.value = "";
        return;
    } else if (!str.startsWith("Wx")) {
        output.value = "Error: Invalid encrypted input!";
        return;
    } 
    let input = str.slice(2);

    // should be safe because it's checking for chars that don't exist in aeEncryptKey
    const encSize = input.length;
    const decSize = 5 * encSize >> 3;
    const decData = new Uint8Array(decSize + 1);

    let idx = 0;
    let sCase = 0;
    for (let i = 0; i < encSize; i++) {
        if (!aeEncryptKey.includes(input[i])) {
            output.value = "Error: Invalid encrypted input!";
            return;
        }
        let cChar = aeEncryptKey.indexOf(input[i]);
        let cNext = 0;

        switch (sCase) {
            case 0:
                cChar <<= 3;
                break;
            case 1:
                cChar <<= 2;
                break;
            case 2:
                cChar <<= 1;
                break;
            case 3:
                //cChar <<= 0;
                break;
            case 4:
                cNext = cChar << 7;
                cChar >>= 1;
                break;
            case 5:
                cNext = cChar << 6;
                cChar >>= 2;
                break;
            case 6:
                cNext = cChar << 5;
                cChar >>= 3;
                break;
            case 7:
                cNext = cChar << 4;
                cChar >>= 4;
                break;
        }
        decData[idx] |= cChar;
        decData[idx + 1] |= cNext;

        if ((sCase + 5) % 8 < sCase) {
            idx += 1;
        }
        sCase = (sCase + 5) % 8;
    }

    let xor = 18;
    let hash = new Uint32Array([aeEncryptHash]);
    for (let i = 0; i < decSize; i++) {
        hash[0] = 0xAB * (hash[0] % 0xB1) - 2 * parseInt(hash[0] / 0xB1);
        decData[i] = (decData[i] ^ xor) + hash[0];
        xor += 6;
    }
    output.value = toStr(decData.slice(0, -1));
}
