// Rewritten from the functions at  00120558  and  00120338
// for decoding, and the function at  00120160  for encoding
// in the PS2 PAL v1.00 executable of The Sims 2: Pets console

// Written by Edness   v1.0   2023-03-18

const s2PetsKeyLen = 19;
const s2PetsDecLen = 13;
const s2PetsChars = "12346789ABCDEFGHIJKLMNPQRTUVWXYZO05SabcdefghijklmnopqrstuvwxyzÀÁÄÆÈÉÌÍÑÒÓÖÙÚÜŒàáâäæçèéêëìíîïñòóôöùúûüßœ -.!@#~%^&*()+=:;,\\/?'\"{}";
const s2PetsGifts = { // head fashion icons for cats reuse the ones for dogs
     0: "Unused ID (Dog Hats)",
     1: "Cat Neckwear - Pink Bandana",            // d_cl_bandana_pink
     2: "Dog Shirts - Green Shirt",               // d_tm_shirt_green
     3: "Cat Glasses - Magenta Aviators",         // d_gl_aviators_magenta
     4: "Dog Hats - Green Tight Cowboy Hat",      // d_ht_cowboytight_green
     5: "Cat Hats - Red-White Bucket Hat",        // d_ht_bucket_redwhite
     6: "Dog Neckwear - Pink Bandana",            // d_cl_bandana_pink
     7: "Dog Neckwear - Red Leather with Bone",   // d_cl_medal_leatherred
     8: "Cat Fur Colors - Red",                   // f_furcolor_red
     9: "Dog Fur Marking Colors - Pink",          // d_furcolor_pink
    10: "Dog Fur Colors - Green",                 // d_furcolor_green
    11: "Cat Fur Marking Colors - Pink",          // f_furcolor_pink
    12: "Cat Shirts - Orange Shirt",              // f_tm_shirt_orange
    13: "Cat Neckwear - Green Bandana",           // d_cl_bandana_green
    14: "Cat Fur Colors - Blue",                  // f_furcolor_blue
    15: "Dog Glasses - Green Cat's Eyes",         // d_gl_catseyes
    16: "Cat Glasses - Blue Elvis Glasses",       // d_gl_elvis_blue
    17: "Dog Fur Marking Colors - Purple",        // d_furcolor_purple
    18: "Dog Fur Colors - Red",                   // d_furcolor_redkisspoint
    19: "Cat Fur Marking Colors - Purple",        // f_furcolor_purple
    20: "Cat Neckwear - Green Leather with Bone", // d_cl_medal_leathergreen
    21: "Dog Fur Colors - Pink",                  // d_furcolor_pink
    22: "Dog Neckwear - Green Bandana",           // d_cl_bandana_green
    23: "Dog Glasses - Magenta Aviators",         // d_gl_aviators_magenta
    24: "Cat Glasses - Green Cat's Eyes",         // d_gl_catseyes
    25: "Dog Neckwear - Green Leather with Bone", // d_cl_medal_leathergreen
    26: "Dog Fur Marking Colors - Red",           // d_furcolor_redkisspoint
    27: "Cat Fur Marking Colors - Blue",          // f_furcolor_blue
    28: "Cat Fur Colors - Purple",                // f_furcolor_purple
    29: "Cat Fur Marking Colors - Red",           // f_furcolor_red
    30: "Cat Hats - Blue Head Bandana",           // d_ht_headbandana_blue
    31: "Dog Fur Marking Colors - Green",         // d_furcolor_green
    32: "Dog Fur Colors - Blue",                  // d_furcolor_blue
    33: "Dog Glasses - Purple Elvis Glasses",     // d_gl_elvis_purple
    34: "Cat Fur Marking Colors - Green",         // f_furcolor_green
    35: "Cat Neckwear - Red Leather with Bone",   // d_cl_medal_leatherred
    36: "Cat Shirts - Green Shirt",               // f_tm_shirt_green
    37: "Dog Shirts - Orange Shirt",              // d_tm_shirt_orange
    38: "Cat Fur Colors - Pink",                  // f_furcolor_pink
    39: "Dog Hats - Blonde-Violet Golf Hat",      // d_ht_golf_blondeviolet
    40: "Dog Fur Marking Colors - Blue",          // d_furcolor_blue
    41: "Cat Fur Colors - Green",                 // f_furcolor_green
    42: "Cat Fur Marking Patterns - Panda",       // f_mark_panda
    43: "Dog Fur Marking Patterns - Zebra",       // d_mark_zebra
    44: "Dog Fur Colors - Purple",                // d_furcolor_purple
    45: "Dog Fur Marking Patterns - Stars",       // d_mark_stars
    46: "Cat Fur Marking Patterns - Bandit Mask", // f_mark_banditmask
    47: "Unused ID",
    48: "Unused ID",
    49: "Unused ID",
    50: "Unused ID"
};

function s2PetsDecodeKey(key) {
    const inKey = key.toUpperCase().replace(/[^0-9A-Z]/g, "").slice(0, s2PetsKeyLen);
    const outKey = document.getElementById("sims2pets-key-output");
    const outName = document.getElementById("sims2pets-key-name-output");
    const outGiftID = document.getElementById("sims2pets-gift-id-output");
    const outGiftName = document.getElementById("sims2pets-gift-name-output");
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
    for (i = 0; i < s2PetsKeyLen; i++) {
        keyEnc[i] = s2PetsChars.indexOf(inKey[i]);
    }

    // Originally this was a very long routine on PS2 that's been significantly simplified here.
    const keyDec = new Uint8Array(s2PetsDecLen);
    for (let i = 0, j = 0; i < 2; i++, j += 5) {
        for (let k = 0; k < 7; k++) {
            for (let g = j; g < j + 5; g++) {
                keyDec[g] = keyEnc[k + i * 7] >>> g - j & 1 ? keyDec[g] | 1 << k : keyDec[g] & ~(1 << k);
                                /* char 0-14 */ /*>>0-4*/
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
    for (let i = 0; i < 3; i++) {
        keyDec[i + 10] = keyInt >>> 8 * i & 0x7F;
    }
    // This algorithm has a significant flaw, where it for whatever reason converts first 9 bytes
    // of the decoded key to UTF-16 (putting NULLs after every byte) however it still hashes the
    // first 9 bytes (name + gift id) of the converted key even though it's now 18 bytes large.
    const keyDecConv = new Uint8Array(9);
    for (let i = 0; i < 5; i++) {
        keyDecConv[i * 2] = keyDec[i];
    }
    let keyHashCalc = crcCalculate(keyDecConv) & 0x7F7F7F7F;
    let keyHashStore = 0;
    for (let i = s2PetsDecLen - 4, shift = 24; i < s2PetsDecLen; i++, shift -= 8) {
        keyHashStore |= keyDec[i] << shift;
    }
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

    let keyName = "";
    for (let i = 0; i < 8; i++) {
        keyName += s2PetsChars[keyDec[i]];
    }
    outName.value = keyName.replace(/\s+$/g, "");
}

function s2PetsEncodeKey() {
    const outKey = document.getElementById("sims2pets-key-output");
    const outName = document.getElementById("sims2pets-key-name-output");
    const outGiftID = document.getElementById("sims2pets-gift-id-output");
    const outGiftName = document.getElementById("sims2pets-gift-name-output");

    const keyName = outName.value.padEnd(8, " ");
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
    let keyHash = crcCalculate(keyDecConv);
    for (let i = s2PetsDecLen - 1; i >= s2PetsDecLen - 4 ; i--) {
        keyDec[i] = keyHash & 0x7F;
        keyHash >>>= 8;
    }
    // Originally this was a very long routine on PS2 that's been significantly simplified here.
    for (let i = 0, j = 0; i < 2; i++, j += 5) {
        for (let k = 0; k < 7; k++) {
            for (let g = j; g < j + 5; g++) {
                let idx = k + i * 7; // char 0-14
                keyEnc[idx] = keyDec[g] >>> k & 1 ? keyEnc[idx] | 1 << g - j : keyEnc[idx] & ~(1 << g - j);
            }
        }
    }
    let keyInt = 0;
    for (let i = s2PetsDecLen - 1; i > s2PetsDecLen - 4; i--) {
        keyInt <<= 8;
        keyInt |= keyDec[i];
    }
    for (let i = 0; i < 24; i++) {
        let dIdx = parseInt(i / 5);
        let eIdx = i % 5 + 14;
        keyEnc[eIdx] = keyInt >>> i & 1 ? keyEnc[eIdx] | 1 << dIdx : keyEnc[eIdx] & ~(1 << dIdx);
    }
    let key = "";
    for (let i = 0; i < s2PetsKeyLen; i++) {
        key += s2PetsChars[keyEnc[i]];
    }
    outKey.value = key.match(/.{1,4}/g).join("-");
}
