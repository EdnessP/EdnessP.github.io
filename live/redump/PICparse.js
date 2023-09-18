// Parses and prints Blu-ray Permanent Information & Control (PIC) data

// Written by Edness   v1.5   2022-09-25 - 2023-05-08

const picMaxLength = 0xC4 * 2; // Up to triple layer pressed BDs;  (0x4 + 0x40 * layers) * 2

function picReadConstInfo(pic) {
    let picConst = {};
    picConst.totalLayers = pic.readInt(0x1) >> 4;
    pic.seek(0x7, 1);
    picConst.totalSectors = pic.readInt(0x4) - 1;
    return picConst;
}

function parsePic() {
    let input = document.getElementById("pic-parse-input");
    let output = document.getElementById("pic-parse-output");
    let verbose = document.querySelector("#pic-parse-verbose").checked;

    let picData = input.value.toUpperCase().replace(/(\r|\n|\s)/g, "").replace(/[^0-9A-F]/g, "0").slice(0, picMaxLength);
    let curPos = input.selectionStart;
    input.value = picData;
    input.setSelectionRange(curPos, curPos);

    // See the original standalone Python implementation for comments
    let pic = new HexReader(picData);
    let picOutput = "";

    let totalSize = 0;
    let layerbreak = [0];
    pic.seek(pic.readStr(0x2) !== "DI" ? 0x4 : 0x0);
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
        var layerSectorStart = pic.readInt(0x4) - 2;
        let layerSectorEnd = pic.readInt(0x4);
        pic.seek(0x20, 1);

        var layerSize = layerSectorEnd - layerSectorStart;
        layerbreak.push(layerbreak.at(-1) + layerSize);
        totalSize += layerSize;
        picOutput += verbose
            ? `${identifier} - Layer ${layer} - Start: ${toHex(layerSectorStart + 2)} - End: ${toHex(layerSectorEnd)} - Size: ${toHex(layerSize)} (${layerSize} sectors, ${layerSize * 2048} bytes)\n`
            : `Layer ${layer} - Size: ${layerSize} sectors, ${layerSize * 2048} bytes\n`;
    }

    layerbreak.pop();
    layerbreak.shift();
    if (layerbreak.length) {
        picOutput += `Layerbreak${layerbreak.length > 1 ? "s" : ""}: ${layerbreak.join(", ")}\n`;
    }

    if (totalSize) {
        let actualSize = (totalSize - layerSize) + (picConst.totalSectors - layerSectorStart);
        picOutput += verbose
            ? `\nTotal size (Used): ${toHex(actualSize)} (${actualSize} sectors, ${actualSize * 2048} bytes) - Disc end: ${toHex(picConst.totalSectors + 1)}\n`
            + `Total size (Full): ${toHex(totalSize)} (${totalSize} sectors, ${totalSize * 2048} bytes)\n`
            : `\nTotal size (Used): ${actualSize} sectors, ${actualSize * 2048} bytes\n`
            + `Total size (Full): ${totalSize} sectors, ${totalSize * 2048} bytes\n`;
        picOutput += `Total layers: ${picConst.totalLayers}`;
    }
    output.value = picOutput;
}
