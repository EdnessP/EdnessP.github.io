// Rewritten from the functions at  00120558  and  00120338
// for decoding, and the function at  00120160  for encoding
// in the PS2 PAL v1.00 executable of The Sims 2: Pets console

// Written by Edness   v1.4   2023-03-18 - 2024-01-03

const s2PetsKeyLen = 19;
const s2PetsDecLen = 13;
const s2PetsChars = "12346789ABCDEFGHIJKLMNPQRTUVWXYZO05SabcdefghijklmnopqrstuvwxyzÀÁÄÆÈÉÌÍÑÒÓÖÙÚÜŒàáâäæçèéêëìíîïñòóôöùúûüßœ -.!@#~%^&*()+=:;,\\/?'\"{}";
const s2PetsGifts = { // head fashion icons for cats reuse the ones for dogs
    14: "Cat Fur Colors - Blue",                  // f_furcolor_blue
    41: "Cat Fur Colors - Green",                 // f_furcolor_green
    38: "Cat Fur Colors - Pink",                  // f_furcolor_pink
    28: "Cat Fur Colors - Purple",                // f_furcolor_purple
     8: "Cat Fur Colors - Red",                   // f_furcolor_red
    27: "Cat Fur Marking Colors - Blue",          // f_furcolor_blue
    34: "Cat Fur Marking Colors - Green",         // f_furcolor_green
    11: "Cat Fur Marking Colors - Pink",          // f_furcolor_pink
    19: "Cat Fur Marking Colors - Purple",        // f_furcolor_purple
    29: "Cat Fur Marking Colors - Red",           // f_furcolor_red
    46: "Cat Fur Marking Patterns - Bandit Mask", // f_mark_banditmask
    42: "Cat Fur Marking Patterns - Panda",       // f_mark_panda
    16: "Cat Glasses - Blue Elvis Glasses",       // d_gl_elvis_blue
    24: "Cat Glasses - Green Cat's Eyes",         // d_gl_catseyes
     3: "Cat Glasses - Magenta Aviators",         // d_gl_aviators_magenta
    30: "Cat Hats - Blue Head Bandana",           // d_ht_headbandana_blue
     5: "Cat Hats - Red-White Bucket Hat",        // d_ht_bucket_redwhite
    13: "Cat Neckwear - Green Bandana",           // d_cl_bandana_green
    20: "Cat Neckwear - Green Leather with Bone", // d_cl_medal_leathergreen
     1: "Cat Neckwear - Pink Bandana",            // d_cl_bandana_pink
    35: "Cat Neckwear - Red Leather with Bone",   // d_cl_medal_leatherred
    36: "Cat Shirts - Green Shirt",               // f_tm_shirt_green
    12: "Cat Shirts - Orange Shirt",              // f_tm_shirt_orange
    32: "Dog Fur Colors - Blue",                  // d_furcolor_blue
    10: "Dog Fur Colors - Green",                 // d_furcolor_green
    21: "Dog Fur Colors - Pink",                  // d_furcolor_pink
    44: "Dog Fur Colors - Purple",                // d_furcolor_purple
    18: "Dog Fur Colors - Red",                   // d_furcolor_redkisspoint
    40: "Dog Fur Marking Colors - Blue",          // d_furcolor_blue
    31: "Dog Fur Marking Colors - Green",         // d_furcolor_green
     9: "Dog Fur Marking Colors - Pink",          // d_furcolor_pink
    17: "Dog Fur Marking Colors - Purple",        // d_furcolor_purple
    26: "Dog Fur Marking Colors - Red",           // d_furcolor_redkisspoint
    45: "Dog Fur Marking Patterns - Stars",       // d_mark_stars
    43: "Dog Fur Marking Patterns - Zebra",       // d_mark_zebra
    15: "Dog Glasses - Green Cat's Eyes",         // d_gl_catseyes
    23: "Dog Glasses - Magenta Aviators",         // d_gl_aviators_magenta
    33: "Dog Glasses - Purple Elvis Glasses",     // d_gl_elvis_purple
    39: "Dog Hats - Blonde-Violet Golf Hat",      // d_ht_golf_blondeviolet
     4: "Dog Hats - Green Tight Cowboy Hat",      // d_ht_cowboytight_green
    22: "Dog Neckwear - Green Bandana",           // d_cl_bandana_green
    25: "Dog Neckwear - Green Leather with Bone", // d_cl_medal_leathergreen
     6: "Dog Neckwear - Pink Bandana",            // d_cl_bandana_pink
     7: "Dog Neckwear - Red Leather with Bone",   // d_cl_medal_leatherred
     2: "Dog Shirts - Green Shirt",               // d_tm_shirt_green
    37: "Dog Shirts - Orange Shirt",              // d_tm_shirt_orange
     0: "Unused ID (Dog Hats)",
    47: "Unused ID",
    48: "Unused ID",
    49: "Unused ID",
    50: "Unused ID"
};

function s2pDecodeGiftKey(key) {
    const inKey = key.toUpperCase().replace(/[^0-9A-Z]/g, "").slice(0, s2PetsKeyLen);
    const outKey = document.getElementById("sims-key-output");
    const outName = document.getElementById("sims-key-name-output");
    const outGiftID = document.getElementById("sims-gift-id-output");
    const outGiftName = document.getElementById("sims-gift-name-output");
    if (!inKey.length) {
        outKey.value = "";
        outName.value = "";
        outGiftID.value = "";
        outGiftName.value = "";
        return;
    }
    let curPos = outKey.selectionStart;
    if (!(curPos % 5)) {
        curPos += 1; // parseInt(curPos / 5);
    }
    outKey.value = inKey.match(/.{1,4}/g).join("-");
    outKey.setSelectionRange(curPos, curPos);
    if (inKey.length != s2PetsKeyLen) {
        // max strlen in-game is 24 (29 with hyphens)
        outName.value = "";
        outGiftID.value = "";
        outGiftName.value = "Error: Invalid key length!";
        return;
    }

    const keyEnc = new Uint8Array(s2PetsKeyLen);
    for (let i = 0; i < s2PetsKeyLen; i++) {
        keyEnc[i] = s2PetsChars.indexOf(inKey[i]);
    }

    // Originally this was a very long routine on PS2 that's been significantly simplified here.
    const keyDec = new Uint8Array(s2PetsDecLen);
    for (let i = 0, j = 0; i < 14; i += 7, j += 5) {
        for (let k = 0; k < 7; k++) {
            for (let g = j; g < j + 5; g++) {
                keyDec[g] = keyEnc[k + i] >>> g - j & 1 ? keyDec[g] | 1 << k : keyDec[g] & ~(1 << k);
                                /*chr0-14*/ /*>>0-4*/
            }
        }
    }
    // I feel like this has a more optimal way of writing like above, but I'm too tired to work it out
    let keyInt = 0;
    for (let i = 0; i < 24; i++) {
        let dIdx = parseInt(i / 5);
        let eIdx = i % 5 + 14;
        //keyDec[dIdx] = (keyEnc[eIdx] >>> (dIdx - 10) & 1 ? keyDec[dIdx] | 1 << (i & 7) : keyDec[dIdx] & ~(1 << (i & 7))) & 0x7F;
        keyInt = keyEnc[eIdx] >>> dIdx & 1 ? keyInt | 1 << i : keyInt & ~(1 << i);
    }
    //keyDec.push(...intToArr(keyInt, 3));
    intToArr(intReverse(keyInt, 3), s2PetsDecLen, s2PetsDecLen - 1, keyDec);

    // This algorithm has a significant flaw, where it for whatever reason converts first 9 bytes
    // of the decoded key to UTF-16 (putting NULLs after every byte) however it still hashes the
    // first 9 bytes (name + gift id) of the converted key even though it's now 18 bytes large.
    const keyDecConv = new Uint8Array(9);
    for (let i = 0; i < 5; i++) {
        keyDecConv[i * 2] = keyDec[i];
    }
    let keyHashCalc = calcCrc32(keyDecConv) & 0x7F7F7F7F;
    let keyHashStore = arrToInt(keyDec.slice(-4));
    if (keyHashCalc !== keyHashStore) {
        outName.value = "";
        outGiftID.value = "";
        outGiftName.value = "Error: Invalid checksum!";
        return;
    }
    if (keyDec[8] > 50) {
        outName.value = "";
        outGiftID.value = "";
        outGiftName.value = "Error: Invalid gift ID!";
        return;
    }
    outGiftID.value = keyDec[8];
    outGiftName.value = s2PetsGifts[keyDec[8]];
    outName.value = Array.from(keyDec.slice(0, 8)).map(idx => s2PetsChars[idx]).join("").trimEnd();
}

function s2pEncodeGiftKey() {
    const outKey = document.getElementById("sims-key-output");
    const outName = document.getElementById("sims-key-name-output").value;
    const outGiftID = document.getElementById("sims-gift-id-output");
    const outGiftName = document.getElementById("sims-gift-name-output");

    const keyName = outName.padEnd(8, " ");
    let giftID = outGiftID.value.replace(/[^0-9\x2D]/g, ""); //.slice(0, 2);
    if (!giftID.length) {  // input type=number gives an empty string if there is a letter
        outKey.value = ""; // but i refuse to filter type=text due to the number+- buttons
        outGiftID.value = "";
        outGiftName.value = "";
        return; // A key can be generated with no name, but it must have a valid ID
    }
    // manually typing in the id can allow trailing zeros which sets the name to undefined
    // and <0 doesn't account for -0 which will also set the gift name to undefined
    if (giftID.startsWith("0") && giftID > 0) {
        giftID = giftID[1];
    } else if (giftID < 0 || giftID == -0) {
        giftID = 0;
    } else if (giftID > 50) {
        giftID = 50;
    }
    outGiftID.value = giftID;
    outGiftName.value = s2PetsGifts[giftID];

    const keyDec = new Uint8Array(s2PetsDecLen);
    const keyEnc = new Uint8Array(s2PetsKeyLen);
    for (let i = 0; i < keyName.length; i++) {
        let nameIdx = s2PetsChars.indexOf(keyName[i]);
        if (nameIdx === -1) { // if undefined
            nameIdx = s2PetsChars.indexOf(" "); 
        }
        keyDec[i] = nameIdx;
    }
    keyDec[8] = giftID;
    // broken key hash validation implementation, see comment in s2PetsDecodeKey()
    const keyDecConv = new Uint8Array(9);
    for (let i = 0; i < 5; i++) {
        keyDecConv[i * 2] = keyDec[i];
    }
    let keyHash = calcCrc32(keyDecConv) & 0x7F7F7F7F;
    intToArr(keyHash, s2PetsDecLen, s2PetsDecLen - 1, keyDec);

    // Originally this was a very long routine on PS2 that's been significantly simplified here.
    for (let i = 0, j = 0; i < 14; i += 7, j += 5) {
        for (let k = 0; k < 7; k++) {
            for (let g = j; g < j + 5; g++) {
                let idx = k + i; // char 0-14                        /*<<0-4*/                    /*<<0-4*/
                keyEnc[idx] = keyDec[g] >>> k & 1 ? keyEnc[idx] | 1 << g - j : keyEnc[idx] & ~(1 << g - j);
            }
        }
    }
    let keyInt = intReverse(keyHash, 3);
    for (let i = 0; i < 24; i++) {
        let dIdx = parseInt(i / 5);
        let eIdx = i % 5 + 14;
        keyEnc[eIdx] = keyInt >>> i & 1 ? keyEnc[eIdx] | 1 << dIdx : keyEnc[eIdx] & ~(1 << dIdx);
    }
    outKey.value = Array.from(keyEnc).map(idx => s2PetsChars[idx]).join("").match(/.{1,4}/g).join("-");
}
