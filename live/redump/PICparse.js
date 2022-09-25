// Parses and prints Blu-ray Permanent Information & Control (PIC) data

// Written by Edness   v1.0   2022-09-25

const picMaxLength = 0xC4 * 2; // Up to triple layer pressed BDs

function parsePic() {
    let input = document.getElementById("pic-parse-input");
    let output = document.getElementById("pic-parse-output");
    let checkbox = document.querySelector("#pic-parse-checkbox").checked;

    picData = input.value.toUpperCase().replace(/(\r\n|\n|\r|\s)/g, "").replace(/[^0-9A-F]/g, "0").slice(0, picMaxLength);
    let curPos = input.selectionStart;
    input.value = picData;
    input.setSelectionRange(curPos, curPos);

    picPos = 0x0;
    let picOutput = "";

    // See the original standalone Python implementation for comments
    let totalSize = 0;
    readSeek(readStr(0x2) !== "DI" ? 0x4 : 0x0);
    while (picPos < picMaxLength && readStr(0x2) === "DI") {
        readSeek(0x3, 1);
        let layer = readInt(0x1);
        let type = readStr(0x1);
        if (type !== " ") {
            picOutput += "Error: Not a pressed Blu-Ray disc PIC!\n";
            break;
        }
        readSeek(0x1, 1);
        let identifier = readStr(0x4);
        var picConst = readConstInfo();
        /* Doesn't work in JS
        if (layer === 0) {
            let picConst = readConstInfo();
        } else if (picConst !== readConstInfo()) {
            picOutput += "Warning: Constant data mismatch! The calculated sizes might be incorrect!\n";
        } */
        var layerSectorStart = readInt(0x4) - 2;
        let layerSectorEnd = readInt(0x4);
        readSeek(0x20, 1);

        var layerSize = layerSectorEnd - layerSectorStart;
        totalSize += layerSize;
        picOutput += checkbox
            ? `${identifier} - Layer ${layer} - Start: ${toHex(layerSectorStart + 2)} - End: ${toHex(layerSectorEnd)} - Size: ${toHex(layerSize)} (${layerSize} sectors, ${layerSize * 2048} bytes)\n`
            : `Layer ${layer} - Size: ${layerSize} sectors, ${layerSize * 2048} bytes\n`;
    }
    if (typeof picConst !== "undefined") {
        let actualSize = (totalSize - layerSize) + (picConst[1] /* totalSectors */ - layerSectorStart);
        picOutput += checkbox
            ? `\nTotal size (Used): ${toHex(actualSize)} (${actualSize} sectors, ${actualSize * 2048} bytes) - Disc end: ${toHex(picConst[1] /* totalSectors */ + 1)}\n`
            + `Total size (Full): ${toHex(totalSize)} (${totalSize} sectors, ${totalSize * 2048} bytes)\n`
            + `Total layers: ${picConst[0] /* totalLayers */}`
            : `\nTotal size (Used): ${actualSize} sectors, ${actualSize * 2048} bytes\n`
            + `Total size (Full): ${totalSize} sectors, ${totalSize * 2048} bytes\n`
            + `Total layers: ${picConst[0] /* totalLayers */}`;
    }
    output.value = picOutput;
}

// I'll be honest I never bothered to look up if JS has any native
// method of reading bytes like a file, I just wrote this on a whim

const readInt = (bytes) => {
    return parseInt(picData.slice(picPos, picPos += bytes * 2), 16);
}

const readStr = (bytes) => {
    str = "";
    for (let i = 0; i < bytes; i++) {
        strByte = readInt(1);
        decode = String.fromCharCode(strByte);
        str += decode.match(/[\x20-\x7E]/g) ? decode : `\\${toHex(strByte, 2).slice(1)}`;
    }
    return str;
}

const readSeek = (bytes, relative = false) => {
    relative ? picPos += bytes * 2 : picPos = bytes * 2;
}

const readConstInfo = () => {
    totalLayers = readInt(0x1) >> 4;
    readSeek(0x7, 1);
    totalSectors = readInt(0x4) - 1;
    return [totalLayers, totalSectors];
}
