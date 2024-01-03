// Parses and prints DVD Physical Format Information (PFI) and XGD Security Sector (SS) data

// Written by Edness   v1.7.1   2023-09-18 - 2024-01-03

const pfiMaxLength = 0x10 * 2; // Up to dual layer

function pfiComboToggle() {
    const combo = document.querySelector("#pfi-combo-parse").checked;

    if (combo) {
        // allows for 2 separate PFIs to be calculated together
        // PS2 DVD-9 PFI and Xbox/X360 XGD PFI+SS combinations
        const field = document.getElementById("pfi-combo-parse-input");
        const input = document.getElementById("pfi-parse-input");
        input.classList.remove("local-pfi-input");
        input.classList.add("local-pfi-combo-input");

        const clone = input.cloneNode();
        clone.id = "pfi-combo-input";
        clone.value = "";
        field.appendChild(clone);
    } else {
        document.getElementById("pfi-combo-input").remove();
        const input = document.getElementById("pfi-parse-input");
        input.classList.remove("local-pfi-combo-input");
        input.classList.add("local-pfi-input");
    }
    parsePfi();
}

function parsePfi() {
    document.querySelector("#pfi-combo-parse").checked ? parsePfiCombo() : parsePfiSingle();
}

function parsePfiData(elem, idx = "") {
    const input = hexField(elem, pfiMaxLength, "08020000");

    const pfiData = new Object();

    if (input.length < 0x4 * 2) {
        return pfiData;
    }

    pfiData.output = "";

    if (input.length < 0xC * 2) {
        if (idx.toString().length) { idx = " " + idx; }
        pfiData.output += `Warning: PFI${idx} data is too short!\n`;
    }

    const pfi = new HexReader(input);

    pfi.seek(0x4); // Maybe add some warnings if this has bad data?
    // If layer end is empty, end diff is calculated for the size
    // otherwise end diff determines the size difference for L1
    pfiData.start = signExtend(pfi.readInt(0x4), 24);
    pfiData.endDiff = signExtend(pfi.readInt(0x4), 24);
    pfiData.endLayer = signExtend(pfi.readInt(0x4), 24);

    return pfiData;
}

function parsePfiSingle() {
    const pfiData = parsePfiData("pfi-parse-input");
    const output = document.getElementById("pfi-parse-output");
    const verbose = document.querySelector("#pfi-parse-verbose").checked;

    if (!Object.keys(pfiData).length) {
        output.value = "";
        return;
    }

    let totalSize = 0;
    if (!pfiData.endLayer) { // Single Layer PFI
        const layerSize = pfiData.endDiff + 1 - pfiData.start;
        totalSize += layerSize;
        pfiData.output += verbose
            ? `Layer 0 - Start: ${toHex(pfiData.start, 8, 6)} - End: ${toHex(pfiData.endDiff, 8, 6)} - Size: ${toHex(layerSize)} (${layerSize} sectors, ${layerSize * 2048} bytes)\n`
            : `Layer 0 - Size: ${layerSize} sectors, ${layerSize * 2048} bytes\n`;
    } else { // Dual Layer PFI/SS
        const layer0Size = pfiData.endLayer + 1 - pfiData.start;
        const layer1Size = layer0Size + pfiData.endDiff + 1 + pfiData.start;
        totalSize += layer0Size + layer1Size;
        pfiData.output += verbose
            ? `Layer 0 - Start: ${toHex(pfiData.start, 8, 6)} - End: ${toHex(pfiData.endLayer, 8, 6)} - Size: ${toHex(layer0Size)} (${layer0Size} sectors, ${layer0Size * 2048} bytes)\n`
            + `Layer 1 - Difference from Layer 0: ${toHex(pfiData.endDiff, 8, 6)} - Size: ${toHex(layer1Size)} (${layer1Size} sectors, ${layer1Size * 2048} bytes)\n`
            : `Layer 0 - Size: ${layer0Size} sectors, ${layer0Size * 2048} bytes\n`
            + `Layer 1 - Size: ${layer1Size} sectors, ${layer1Size * 2048} bytes\n`;
        //pfiData.output += `Layerbreak: ${layer0Size}`;
    }

    if (totalSize) {
        pfiData.output += verbose
            ? `Total size: ${toHex(totalSize)} (${totalSize} sectors, ${totalSize * 2048} bytes)`
            : `Total size: ${totalSize} sectors, ${totalSize * 2048} bytes`;
    }
    output.value = pfiData.output;
}

function parsePfiCombo() {
    const pfi0Data = parsePfiData("pfi-parse-input", 0);
    const pfi1Data = parsePfiData("pfi-combo-input", 1);
    const output = document.getElementById("pfi-parse-output");
    const verbose = document.querySelector("#pfi-parse-verbose").checked;

    if (!Object.keys(pfi0Data).length || !Object.keys(pfi1Data).length) {
        output.value = "";
        return;
    }

    let pfiOutput = pfi0Data.output + pfi1Data.output;

    let totalSize = 0;
    if (!pfi0Data.endLayer && !pfi1Data.endLayer) { // SL+SL (PS2 DVD-9 PFI)
        const layer0Size = pfi0Data.endDiff + 1 - pfi0Data.start;
        const layer1Size = pfi1Data.endDiff + 1 - pfi1Data.start;
        totalSize += layer0Size + layer1Size;

        pfiOutput += verbose
            ? `Layer 0 - Start: ${toHex(pfi0Data.start, 8, 6)} - End: ${toHex(pfi0Data.endDiff, 8, 6)} - Size: ${toHex(layer0Size)} (${layer0Size} sectors, ${layer0Size * 2048} bytes)\n`
            + `Layer 1 - Start: ${toHex(pfi1Data.start, 8, 6)} - End: ${toHex(pfi1Data.endDiff, 8, 6)} - Size: ${toHex(layer1Size)} (${layer1Size} sectors, ${layer1Size * 2048} bytes)\n`
            : `Layer 0 - Size: ${layer0Size} sectors, ${layer0Size * 2048} bytes\n`
            + `Layer 1 - Size: ${layer1Size} sectors, ${layer1Size * 2048} bytes\n`;
    }
    else if (pfi0Data.endLayer && pfi1Data.endLayer) { // DL+DL (XGD PFI+SS)
        const pfi0L0 = pfi0Data.endLayer + 1 - pfi0Data.start;
        const pfi0L1 = pfi0L0 + pfi0Data.endDiff + 1 + pfi0Data.start;
        const pfi0Size = pfi0L0 + pfi0L1;

        const pfi1L0 = pfi1Data.endLayer + 1 - pfi1Data.start;
        const pfi1L1 = pfi1L0 + pfi1Data.endDiff + 1 + pfi1Data.start;
        const pfi1Size = pfi1L0 + pfi1L1;

        const padL0 = pfi1Data.start - 1 - pfi0Data.endLayer;
        const padL1 = padL0 + pfi1L0 - pfi1L1;
        const padSize = padL0 + padL1;

        totalSize += pfi0Size + pfi1Size + padSize;
        const layer0Size = pfi0L0 + padL0 + pfi1L0;
        const layer1Size = pfi1L1 + padL1 + pfi0L1;

        pfiOutput += verbose
            ? `Layer 0 - Start: ${toHex(pfi0Data.start, 8, 6)}/${toHex(pfi1Data.start, 8, 6)} - End: ${toHex(pfi0Data.endLayer, 8, 6)}/${toHex(pfi1Data.endLayer, 8, 6)} - Size: ${toHex(layer0Size)} (${layer0Size} sectors, ${layer0Size * 2048} bytes)\n`
            + `Layer 1 - Difference from Layer 0: ${toHex(pfi0Data.endDiff, 8, 6)}/${toHex(pfi1Data.endDiff, 8, 6)} - Size: ${toHex(layer1Size)} (${layer1Size} sectors, ${layer1Size * 2048} bytes)\n`
            : `Layer 0 - Size: ${layer0Size} sectors, ${layer0Size * 2048} bytes\n`
            + `Layer 1 - Size: ${layer1Size} sectors, ${layer1Size * 2048} bytes\n`;
    } else {
        pfiOutput += "Error: Invalid PFI combination! Both fields need to be either single layer (PS2 DVD-9) or dual layer (XGD PFI+SS).";
    }

    if (totalSize) {
        pfiOutput += verbose
            ? `Total size: ${toHex(totalSize)} (${totalSize} sectors, ${totalSize * 2048} bytes)`
            : `Total size: ${totalSize} sectors, ${totalSize * 2048} bytes`;
    }
    output.value = pfiOutput;
}
