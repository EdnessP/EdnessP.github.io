// Parses and prints DVD Physical Format Information (PFI) and XGD Security Sector (SS) data

// Written by Edness   v1.0   2023-09-18

const pfiMaxLength = 0xA0; // 0x10*2, up to dual layer, but setting to 5 lines for alignment

function parsePfi() {
    let input = document.getElementById("pfi-parse-input");
    let output = document.getElementById("pfi-parse-output");
    let verbose = document.querySelector("#pfi-parse-verbose").checked;

    let pfiData = input.value.toUpperCase().replace(/(\r|\n|\s)/g, "").replace(/[^0-9A-F]/g, "0").slice(0, pfiMaxLength);
    let curPos = input.selectionStart;
    input.value = pfiData;
    input.setSelectionRange(curPos, curPos);

    let pfi = new HexReader(pfiData);
    let pfiOutput = "";

    pfi.seek(0x4);
    // If layer end is empty, end diff is calculated for the size
    // otherwise end diff determines the size difference for L1
    let pfiStart = pfi.readInt(0x4);
    let pfiEndDiff = pfi.readInt(0x4);
    let pfiEndLayer = pfi.readInt(0x4);

    if (pfiEndLayer === 0) {
        let layerSize = pfiEndDiff + 1 - pfiStart;
        pfiOutput = verbose
            ? `Layer 0 - Start: ${toHex(pfiStart)} - End: ${toHex(pfiEndDiff)} - Size: ${toHex(layerSize)} (${layerSize} sectors, ${layerSize * 2048} bytes)\n`
            : `Layer 0 - Size: ${layerSize} sectors, ${layerSize * 2048} bytes\n`;
    } else { // Dual Layer PFI/SS
        let layer0Size = pfiEndLayer + 1 - pfiStart;
        let layer1Size = layer0Size + (pfiEndDiff + 1 << 8 >> 8) + pfiStart;
        let totalSize = layer0Size + layer1Size;
        pfiOutput = verbose
            ? `Layer 0 - Start: ${toHex(pfiStart)} - End: ${toHex(pfiEndLayer)} - Size: ${toHex(layer0Size)} (${layer0Size} sectors, ${layer0Size * 2048} bytes)\n`
            + `Layer 1 - Difference from Layer 0: ${toHex(pfiEndDiff)} - Size: ${toHex(layer1Size)} (${layer1Size} sectors, ${layer1Size * 2048} bytes)\n`
            + `Total size: ${toHex(totalSize)} (${totalSize} sectors, ${totalSize * 2048} bytes)`
            : `Layer 0 - Size: ${layer0Size} sectors, ${layer0Size * 2048} bytes\n`
            + `Layer 1 - Size: ${layer1Size} sectors, ${layer1Size * 2048} bytes\n`
            + `Total size: ${totalSize} sectors, ${totalSize * 2048} bytes`;
        //pfiOutput += `Layerbreak: ${layer0Size}`;
    }
    output.value = pfiOutput;
}
