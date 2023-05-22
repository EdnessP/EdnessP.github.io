// Sims Console filename lookup hash

// Written by Edness  v1.3
// 2023-02-09 - 2023-05-22

function simsConsoleHash() {
    let input = document.getElementById("simsc-hash-input").value.toUpperCase().replace(/[^0-9A-Z]/g, "_");
    const doSims1 = document.querySelector("#sims1c-hash-toggle").checked;
    const output = document.getElementById("simsc-hash-output");
    if (!doSims1 && /^[0-9]/.test(input)) {
        input = "_" + input;
    }
    output.value = toHex(calcCrc32(strInput(input)));
}
