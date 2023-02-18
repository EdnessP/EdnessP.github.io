/*
   Call of Duty: Finest Hour filename hashing function reimplementation
   from the function at  001429B8  in the PS2 PAL  SPS.BIN  executable.
   There is a secondary loop break condition, if the character is a ;
*/

// Written by Edness   v1.1   2022-10-10 - 2023-02-18

function codfhSparkHash(str) {
    const input = strInput(str.toUpperCase().replace(/[/]/g, "\\").split(";")[0]);
    const output = document.getElementById("codfh-hash-output");

    let hash = new BigUint64Array([0x84222325CBF29CE4n]);
    for (let i = 0; i < input.length; i++) {
        hash[0] = BigInt(input[i]) ^ (hash[0] << 40n) + hash[0] * 0x1B3n;
    }
    output.value = toHex(hash[0], 16);
}
