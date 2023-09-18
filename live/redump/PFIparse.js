// Parses and prints DVD Physical Format Information (PFI) and XGD Security Sector (SS) data

// Written by Edness   v1.3   2023-09-18

const pfiMaxLength = 0x10 * 2; // Up to dual layer

function parsePfi() {
    const pfiData = hexField("pfi-parse-input", pfiMaxLength);
    const output = document.getElementById("pfi-parse-output");
    const verbose = document.querySelector("#pfi-parse-verbose").checked;

    if (pfiData.length < 0x4 * 2) {
        output.value = "";
        return;
    }

    const pfi = new HexReader(pfiData);
    let pfiOutput = "";

    if (pfiData.length < 0xC * 2) {
        pfiOutput += "Warning: PFI data too short!\n";
    }

    pfi.seek(0x4); // Maybe add some warnings if this has bad data?
    // If layer end is empty, end diff is calculated for the size
    // otherwise end diff determines the size difference for L1
    const pfiStart = pfi.readInt(0x4);
    const pfiEndDiff = pfi.readInt(0x4);
    const pfiEndLayer = pfi.readInt(0x4);

    let totalSize = 0;
    if (!pfiEndLayer) { // Single Layer PFI
        let layerSize = pfiEndDiff + 1 - pfiStart;
        totalSize += layerSize;
        pfiOutput += verbose
            ? `Layer 0 - Start: ${toHex(pfiStart)} - End: ${toHex(pfiEndDiff)} - Size: ${toHex(layerSize)} (${layerSize} sectors, ${layerSize * 2048} bytes)\n`
            : `Layer 0 - Size: ${layerSize} sectors, ${layerSize * 2048} bytes\n`;
    } else { // Dual Layer PFI/SS
        let layer0Size = pfiEndLayer + 1 - pfiStart;
        let layer1Size = layer0Size + (pfiEndDiff + 1 << 8 >> 8) + pfiStart;
        totalSize += layer0Size + layer1Size;
        pfiOutput += verbose
            ? `Layer 0 - Start: ${toHex(pfiStart)} - End: ${toHex(pfiEndLayer)} - Size: ${toHex(layer0Size)} (${layer0Size} sectors, ${layer0Size * 2048} bytes)\n`
            + `Layer 1 - Difference from Layer 0: ${toHex(pfiEndDiff)} - Size: ${toHex(layer1Size)} (${layer1Size} sectors, ${layer1Size * 2048} bytes)\n`
            : `Layer 0 - Size: ${layer0Size} sectors, ${layer0Size * 2048} bytes\n`
            + `Layer 1 - Size: ${layer1Size} sectors, ${layer1Size * 2048} bytes\n`;
        //pfiOutput += `Layerbreak: ${layer0Size}`;
    }
    pfiOutput += verbose
        ? `Total size: ${toHex(totalSize)} (${totalSize} sectors, ${totalSize * 2048} bytes)`
        : `Total size: ${totalSize} sectors, ${totalSize * 2048} bytes`;
    output.value = pfiOutput;
}
