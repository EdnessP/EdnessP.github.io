// Parses and prints Blu-ray Permanent Information & Control (PIC) data

// Written by Edness   v1.3   2022-09-25 - 2022-09-26

const picMaxLength = 0xC4 * 2; // Up to triple layer pressed BDs

function parsePic() {
    let input = document.getElementById("pic-parse-input");
    let output = document.getElementById("pic-parse-output");
    let verbose = document.querySelector("#pic-parse-verbose").checked;

    let picData = input.value.toUpperCase().replace(/(\r\n|\n|\r|\s)/g, "").replace(/[^0-9A-F]/g, "0").slice(0, picMaxLength);
    let curPos = input.selectionStart;
    input.value = picData;
    input.setSelectionRange(curPos, curPos);

    let pic = new hexReader(picData);
    let picOutput = "";

    // See the original standalone Python implementation for comments
    let totalSize = 0;
    let layerBreak = [0];
    pic.seek(pic.readStr(0x2) !== "DI" ? 0x4 : 0x0);
    while (pic.tell() < picData.length && pic.readStr(0x2) === "DI") {
        pic.seek(0x3, 1);
        let layer = pic.readInt(0x1);
        let type = pic.readStr(0x1);
        if (type !== " ") {
            picOutput += "Error: Not a pressed Blu-Ray disc PIC!\n";
            break;
        }
        pic.seek(0x1, 1);
        let identifier = pic.readStr(0x4);
        /* Doesn't work in JS
        if (layer === 0) {
            let picConst = readConstInfo();
        } else if (picConst !== readConstInfo()) {
            picOutput += "Warning: Constant data mismatch! The calculated sizes might be incorrect!\n";
        } */
        var totalLayers = pic.readInt(0x1) >> 4;
        pic.seek(0x7, 1);
        var totalSectors = pic.readInt(0x4) - 1;
        var layerSectorStart = pic.readInt(0x4) - 2;
        let layerSectorEnd = pic.readInt(0x4);
        pic.seek(0x20, 1);

        var layerSize = layerSectorEnd - layerSectorStart;
        layerBreak.push(layerBreak.at(-1) + layerSize);
        totalSize += layerSize;
        picOutput += verbose
            ? `${identifier} - Layer ${layer} - Start: ${toHex(layerSectorStart + 2)} - End: ${toHex(layerSectorEnd)} - Size: ${toHex(layerSize)} (${layerSize} sectors, ${layerSize * 2048} bytes)\n`
            : `Layer ${layer} - Size: ${layerSize} sectors, ${layerSize * 2048} bytes\n`;
    }

    layerBreak.pop();
    layerBreak.shift();
    if (layerBreak.length) {
        picOutput += `Layerbreak${layerBreak.length > 1 ? "s" : ""}: ${layerBreak.join(", ")}\n`;
    }

    if (totalSize) {
        let actualSize = (totalSize - layerSize) + (totalSectors - layerSectorStart);
        picOutput += verbose
            ? `\nTotal size (Used): ${toHex(actualSize)} (${actualSize} sectors, ${actualSize * 2048} bytes) - Disc end: ${toHex(totalSectors + 1)}\n`
            + `Total size (Full): ${toHex(totalSize)} (${totalSize} sectors, ${totalSize * 2048} bytes)\n`
            : `\nTotal size (Used): ${actualSize} sectors, ${actualSize * 2048} bytes\n`
            + `Total size (Full): ${totalSize} sectors, ${totalSize * 2048} bytes\n`;
        picOutput += `Total layers: ${totalLayers}`;
    }
    output.value = picOutput;
}
