// Disney Epic Mickey Wii string lookup hash algorithm.
// Reimplemented from the function at  80A1D070  in the
// secondary relocatable executable from the US release

// Written by Edness   v1.1   2023-12-27 - 2023-12-28

function epicMickeyHash() {
    const input = strInput(document.getElementById("epic-mickey-hash-input").value.toLowerCase());
    const output = document.getElementById("epic-mickey-hash-output");

    const chunks = parseInt(input.length / 12);
    const hash = new Uint32Array(5);
    // Unique hash seed present at 0x8 in all
    // of the language .DCT dictionary files.
    hash[0] = hexInput("epic-mickey-id-input", 8);
    hash[1] = 0x9E3779B9;
    hash[2] = hash[1];
    // Can't tell if this is PowerPC loop unrolling at play,
    // or if it's just this unnecessarily over-engineered...
    // The different iterations can likely be consolidated
    // further; I do see some very vague rotating patterns
    let idx = Number();
    for (let i = 0; i < chunks; i++) {
        hash[4] = hash[0] + arrToInt(input.slice(idx + 8, idx + 12).reverse());
        hash[3] = hash[1] + arrToInt(input.slice(idx + 4, idx +  8).reverse());
        hash[1] = hash[2] + arrToInt(input.slice(idx + 0, idx +  4).reverse());
        hash[1] = (hash[1] - hash[3]) - hash[4] ^ hash[4] >>> 13;
        hash[3] = (hash[3] - hash[4]) - hash[1] ^ hash[1] <<   8;
        hash[2] = (hash[4] - hash[1]) - hash[3] ^ hash[3] >>> 13;
        hash[1] = (hash[1] - hash[3]) - hash[2] ^ hash[2] >>> 12;
        hash[3] = (hash[3] - hash[2]) - hash[1] ^ hash[1] <<  16;
        hash[4] = (hash[2] - hash[1]) - hash[3] ^ hash[3] >>>  5;
        hash[2] = (hash[1] - hash[3]) - hash[4] ^ hash[4] >>>  3;
        hash[1] = (hash[3] - hash[4]) - hash[2] ^ hash[2] <<  10;
        hash[0] = (hash[4] - hash[2]) - hash[1] ^ hash[1] >>> 15;
        idx += 12;
    }
    hash[0] += input.length;
    hash[0] += arrToInt(input.slice(idx + 8, idx + 11).reverse()) << 8;
    hash[1] += arrToInt(input.slice(idx + 4, idx +  8).reverse());
    hash[2] += arrToInt(input.slice(idx + 0, idx +  4).reverse());
    hash[2] = (hash[2] - hash[1]) - hash[0] ^ hash[0] >>> 13;
    hash[4] = (hash[1] - hash[0]) - hash[2] ^ hash[2] <<   8;
    hash[3] = (hash[0] - hash[2]) - hash[4] ^ hash[4] >>> 13;
    hash[1] = (hash[2] - hash[4]) - hash[3] ^ hash[3] >>> 12;
    hash[4] = (hash[4] - hash[3]) - hash[1] ^ hash[1] <<  16;
    hash[2] = (hash[3] - hash[1]) - hash[4] ^ hash[4] >>>  5;
    hash[1] = (hash[1] - hash[4]) - hash[2] ^ hash[2] >>>  3;
    hash[3] = (hash[4] - hash[2]) - hash[1] ^ hash[1] <<  10;
    hash[0] = (hash[2] - hash[1]) - hash[3] ^ hash[3] >>> 15;

    output.value = toHex(hash[0]);
}
