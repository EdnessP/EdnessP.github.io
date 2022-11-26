/*
  Tomb Raider: Legend filename hashing algorithm

  Reimplemented from the function at  0009AF00  in
  the Xbox 2005-12-08 pre-release build executable
  and the function at  001A19C0  in the PS2 PAL elf
*/
// Written by Edness   v1.0   2022-11-27

function trLegendHash(str) {
    const input = str.toLowerCase();
    const output = document.getElementById("tr-legend-hash-output");

    let hash = new Uint32Array([-1]);
    for (let i = 0; i < input.length; i++) {
        hash[0] ^= input.charCodeAt(i) << 24;
        for (let j = 0; j < 8; j++) {
            hash[0] = hash[0] >>> 31 ? hash[0] * 2 ^ 0x04C11DB7 : hash[0] << 1;
        }
    }
    hash[0] = ~hash[0];
    output.value = toHex(hash[0], 8);
}
