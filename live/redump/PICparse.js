// Parses and prints Blu-ray Permanent Information & Control (PIC) data

// Written by Edness   v1.7.1   2022-09-25 - 2023-11-18

const picMaxLength = 0xC0 * 2; // Up to triple layer pressed BDs;  (0x40 * layers) * 2

function picReadConstInfo(pic) {
    const picConst = new Object();
    picConst.totalLayers = pic.readInt(0x1) >> 4;
    pic.seek(0x7, 1);
    picConst.totalSectors = pic.readInt(0x4) - 1;
    return picConst;
}

function parsePic() {
    const picData = hexField("pic-parse-input", picMaxLength, "10020000");
    const output = document.getElementById("pic-parse-output");
    const verbose = document.querySelector("#pic-parse-verbose").checked;

    // See the original standalone Python implementation for comments
    const pic = new HexReader(picData);
    let picOutput = "";

    let totalSize = 0;
    let layerbreak = [0];
    while (pic.tell() < picData.length && pic.readStr(0x2) === "DI") {
        pic.seek(0x3, 1);
        let layer = pic.readInt(0x1);
        if (pic.readStr(0x1) !== " ") {
            picOutput += "Error: Not a pressed Blu-Ray disc PIC!\n";
            break;
        }
        pic.seek(0x1, 1);
        let identifier = pic.readStr(0x4);
        if (layer === 0) {
            var picConst = picReadConstInfo(pic);
        } else {
            let _picConst = picReadConstInfo(pic);
            if (!objCompare(picConst, _picConst)) {
                picOutput += `Warning: Constant data mismatch for Layer ${layer}! The final output might be incorrect!\n`;
            }
        }
        var layerSectorStart = pic.readInt(0x4);
        let layerSectorEnd = pic.readInt(0x4);
        pic.seek(0x20, 1);

        var layerSize = layerSectorEnd + 2 - layerSectorStart;
        layerbreak.push(layerbreak.at(-1) + layerSize);
        totalSize += layerSize;
        picOutput += verbose
            ? `${identifier} - Layer ${layer} - Start: ${toHex(layerSectorStart)} - End: ${toHex(layerSectorEnd)} - Size: ${toHex(layerSize)} (${layerSize} sectors, ${layerSize * 2048} bytes)\n`
            : `Layer ${layer} - Size: ${layerSize} sectors, ${layerSize * 2048} bytes\n`;
    }

    layerbreak.pop();
    layerbreak.shift();
    if (layerbreak.length) {
        picOutput += `Layerbreak${layerbreak.length > 1 ? "s" : ""}: ${layerbreak.join(", ")}\n`;
    }

    if (totalSize) {
        let actualSize = (totalSize - layerSize) + (picConst.totalSectors - layerSectorStart + 2);
        picOutput += verbose
            ? `\nTotal size (Used): ${toHex(actualSize)} (${actualSize} sectors, ${actualSize * 2048} bytes) - Disc end: ${toHex(picConst.totalSectors + 1)}\n`
            + `Total size (Full): ${toHex(totalSize)} (${totalSize} sectors, ${totalSize * 2048} bytes)\n`
            : `\nTotal size (Used): ${actualSize} sectors, ${actualSize * 2048} bytes\n`
            + `Total size (Full): ${totalSize} sectors, ${totalSize * 2048} bytes\n`;
        picOutput += `Total layers: ${picConst.totalLayers}`;
    }
    output.value = picOutput;
}
