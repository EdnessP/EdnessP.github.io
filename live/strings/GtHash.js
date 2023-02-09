/*
   JS reimplementation of Burnout's  CGtHash::CalculateHash  function.
   A derivative of CRC-32 with the main difference being the output result
   not being XORd with 0xFFFFFFFF (like CRC-32/JAMCRC) and in the loop the
   hash has to be signed before shifting right 8 bits and then become an
   unsigned integer after it as the final output.
*/

// Written by Edness   v1.0   2022-09-09

function boGtHash(str) {
    const output = document.getElementById("bo-hash-output");
    let hash = new Uint32Array([-1]);
    for (let i = 0; i < str.length; i++) {
        hash[0] = hash[0] >> 8 ^ crcHashTable[str.charCodeAt(i) ^ hash[0] & 0xFF];
    }
    output.value = toHex(hash[0]);
}
