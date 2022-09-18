// Midnight Club STMA/RSTM lookup hashing function
// Written by Edness   v1.0   2022-09-10

function mclubAudioHash(str) {
    /*
       Reimplemented from the function at  004F9298  in the
       PS2 PAL version of Midnight Club 3: DUB Edition Remix
       Also found at  00386DB0  in PS2 PAL Midnight Club 2

       For Midnight Club 2 the sound files are supposed to
       end with .STM, but for Midnight Club 3 - with .RSM
    */
    const input = str.toUpperCase().replace(/\\/g, "/");
    const output = document.getElementById("mcl-hash-output");
    let hash = new Uint32Array([0]);
    for (let i = 1, idx = 0; idx < input.length; i++, idx++) {
        hash[0] = (hash[0] << 1 | hash >>> 31) + input.charCodeAt(idx) * i;
    }
    output.value = toHex(hash[0]);
}
