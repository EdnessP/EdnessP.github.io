// Midnight Club STMA/RSTM and string lookup hashing functions
// Written by Edness   v1.2   2022-09-10 - 2023-02-18

function mclubAudioHash(str) {
    /*
       Reimplemented from the function at  004F9298  in the
       PS2 PAL version of Midnight Club 3: DUB Edition Remix
       Also found at  00386DB0  in PS2 PAL Midnight Club 2

       For Midnight Club 2 the sound files are supposed to
       end with .STM, but for Midnight Club 3 - with .RSM
    */
    const input = strInput(str.toUpperCase().replace(/\\/g, "/"));
    const output = document.getElementById("mcl-audio-hash-output");
    let hash = new Uint32Array([0]);
    for (let i = 1, idx = 0; idx < input.length; i++, idx++) {
        hash[0] = (hash[0] << 1 | hash >>> 31) + input[idx] * i;
    }
    output.value = toHex(hash[0]);
}

function mclubStringHash(str) {
    /*
       Reimplemented from function at  003587E8  from the
       PS2 PAL version of Midnight Club 2

       Midnight Club 3's string hashing function is nearly
       identical to Bully's, just without the conversion to
       lowercase and backslashes to forward slashes, which
       can be found at  /live/strings/BullyHash.js
    */
    const input = strInput(str);
    const output = document.getElementById("mcl-str-hash-output");
    let hash = 0x00000000;
    for (let i = 0; i < input.length; i++) {
        hash = (hash << 4) + input[i];
        if (mask = hash & 0xF0000000) {
            hash ^= mask >>> 24 ^ mask;
        }
    }
    output.value = toHex(hash);
}
