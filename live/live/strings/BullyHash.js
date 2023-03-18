// Written by Edness   v1.2   2022-09-08 - 2023-02-18

function bullyRstmHash(str, mcl) {
    /*
       Reimplemented from the  zipHashFile::Hash  function at  0040CDF0  in PS2 PAL
       Used for looking up RSTM audio files by their hashed names

       The game normally checks if it starts with a quotation mark and strips it,
       and also terminates the hash loop if/when a quotation mark is encountered.

        A similar algorithm is also used in Midnight Club string tables, with the
        main difference being not converting to lowercase and leaving backslashes
        located at  002BE788  in Midnight Club 3: DUB Edition Remix PS2 PAL.
    */

    inOut = mcl ? [str, "mcl-bully-hash-output"]
                : [str.toLowerCase().replace(/\\/g, "/"), "bully-rstm-output"];
    const input = strInput(inOut[0]);
    const output = document.getElementById(inOut[1]);
    let hash = new Uint32Array([0]);
    for (let i = 0; i < input.length; i++) {
        hash[0] = (hash[0] + input[i]) * 0x401;
        hash[0] ^= (hash[0] >>> 6);
    }
    hash[0] *= 9;
    hash[0] = (hash[0] ^ hash[0] >>> 11) * 0x8001;
    output.value = toHex(hash[0]);
}

function bullyLabelHash(str) {
    // Reimplemented from the  HashUCstring & HashStringJS  functions
    // Used for looking up strings by their hashed labels
    const input = strInput(str.toUpperCase());
    const output = document.getElementById("bully-label-output");
    let hash = 0x00000000;
    for (let i = 0; i < input.length; i++) {
        hash = input[i] + hash * 0x83 & 0x7FFFFFFF;
    }
    output.value = toHex(hash);
}
