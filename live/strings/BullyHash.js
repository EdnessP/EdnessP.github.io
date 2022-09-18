// Written by Edness   v1.0   2022-09-08

function bullyRstmHash(str) {
    /*
       Reimplemented from the  zipHashFile::Hash  function
       Used for looking up RSTM audio files by their hashed names

       The game normally checks if it starts with a quotation mark and strips it,
       and also terminates the hash loop if/when a quotation mark is encountered.
    */
    const input = str.toLowerCase().replace(/\\/g, "/");
    const output = document.getElementById("bully-rstm-output");
    let hash = new Uint32Array([0]);
    for (let i = 0; i < input.length; i++) {
        hash[0] = (hash[0] + input.charCodeAt(i)) * 0x401;
        hash[0] ^= (hash[0] >>> 6);
    }
    hash[0] *= 9;
    hash[0] = (hash[0] ^ hash[0] >>> 11) * 0x8001;
    output.value = toHex(hash[0]);
}

function bullyLabelHash(str) {
    // Reimplemented from the  HashUCstring & HashStringJS  functions
    // Used for looking up strings by their hashed labels
    const input = str.toUpperCase();
    const output = document.getElementById("bully-label-output");
    let hash = 0x00000000;
    for (let i = 0; i < input.length; i++) {
        hash = input.charCodeAt(i) + hash * 0x83 & 0x7FFFFFFF;
    }
    output.value = toHex(hash);
}
