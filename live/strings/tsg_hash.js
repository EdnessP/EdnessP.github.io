/*
   The Simpsons Game (NewGen) string label hash function
   Reimplemented from the function at  827451C0  in the
   Xbox 360 version, or from  00522090 in the PS3 version
*/

// Written by Edness   v1.0   2022-09-23

function tsgHash(str) {
    const input = str.toLowerCase();
    const output = document.getElementById("tsg-hash-output");
    let hash = new Uint32Array([0]);
    for (let i = 0; i < input.length; i++) {
        hash[0] = 0x1003F * hash[0] + input.charCodeAt(i);
    }
    output.value = toHex(hash[0]);
}
