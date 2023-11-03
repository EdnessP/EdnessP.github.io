// Parses and prints DVD Physical Format Information (PFI) and XGD Security Sector (SS) data

// Written by Edness   v1.5   2023-09-18 - 2023-11-03

const pfiMaxLength = 0x10 * 2; // Up to dual layer
let pfiSsComboParse = false; // toggle via console for now

function parsePfi() {
    pfiSsComboParse ? parsePfiCombo() : parsePfiSingle();
    //document.querySelector("#pfi-ss-combo-parse").checked ? parsePfiCombo() : parsePfiSingle();
}

function parsePfiSingle() {
    const pfiData = hexField("pfi-parse-input", pfiMaxLength, "08020000");
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

function parsePfiCombo() {
    const pfiData = hexField("pfi-parse-input", pfiMaxLength * 2);
    const output = document.getElementById("pfi-parse-output");
    const verbose = document.querySelector("#pfi-parse-verbose").checked;

    if (pfiData.length < 0x14 * 2) {
        output.value = "";
        return;
    }

    const pfi = new HexReader(pfiData);
    let pfiOutput = "";

    /*if (pfiData.length < 0x10 * 2) {
        pfiOutput += "Warning: PFI data too short!\n";
    } else if (pfiData.length < 0x20 * 2) {
        pfiOutput += "Warning: SS data too short!\n";
    }*/

    pfi.seek(0x4);
    const pfiStart = pfi.readInt(0x4);
    const pfiEndDiff = pfi.readInt(0x4);
    const pfiEndLayer = pfi.readInt(0x4);
    pfi.seek(0x14);
    const ssStart = pfi.readInt(0x4);
    const ssEndDiff = pfi.readInt(0x4);
    const ssEndLayer = pfi.readInt(0x4);

    const pfiL0 = pfiEndLayer + 1 - pfiStart;
    const pfiL1 = pfiL0 + (pfiEndDiff + 1 << 8 >> 8) + pfiStart;
    const pfiSize = pfiL0 + pfiL1;

    const ssL0 = ssEndLayer + 1 - ssStart;
    const ssL1 = ssL0 + (ssEndDiff + 1 << 8 >> 8) + ssStart;
    const ssSize = ssL0 + ssL1;

    const padL0 = ssStart - 1 - pfiEndLayer;
    const padL1 = padL0 + ssL0 - ssL1;
    const padSize = padL0 + padL1;

    const totalSize = pfiSize + ssSize + padSize;
    const layer0Size = pfiL0 + padL0 + ssL0;
    const layer1Size = ssL1 + padL1 + pfiL1;

    pfiOutput += verbose
        ? `Layer 0 - Start: ${toHex(pfiStart)}/${toHex(ssStart)} - End: ${toHex(pfiEndLayer)}/${toHex(ssEndLayer)} - Size: ${toHex(layer0Size)} (${layer0Size} sectors, ${layer0Size * 2048} bytes)\n`
        + `Layer 1 - Difference from Layer 0: ${toHex(pfiEndDiff)}/${toHex(ssEndDiff)} - Size: ${toHex(layer1Size)} (${layer1Size} sectors, ${layer1Size * 2048} bytes)\n`
        +`Total size: ${toHex(totalSize)} (${totalSize} sectors, ${totalSize * 2048} bytes)`
        : `Layer 0 - Size: ${layer0Size} sectors, ${layer0Size * 2048} bytes\n`
        + `Layer 1 - Size: ${layer1Size} sectors, ${layer1Size * 2048} bytes\n`
        + `Total size: ${totalSize} sectors, ${totalSize * 2048} bytes`;

    output.value = pfiOutput;
}
