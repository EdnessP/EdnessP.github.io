// Written by Edness   2022-09-07 - 2023-01-26

function hexInput(str, size, elem) {
    const strPad = `0x${str.replace(/\s/g, "").slice(2, size + 2).toUpperCase().replace(/[^0-9A-F]/g, "0").padEnd(size, "0")}`;
    const input = document.getElementById(elem);
    let curPos = input.selectionStart; // identical to selectionEnd
    if (curPos < 2) { curPos = 2; } // force to stay after 0x
    input.value = strPad;
    input.setSelectionRange(curPos, curPos);
    return strPad;
}

function reverseString(str) {
    return str.split("").reverse().join("");
}

function toHex(num, size = 8) {
    return `0x${num.toString(16).padStart(size, "0").toUpperCase()}`;
}

// I'll be honest I never bothered to look up if JS has any native method of reading bytes like a file,
// I just wrote this on a whim because I needed it for the Permanent Information & Control parser.
class HexReader {
    constructor(hexData) {
        this.hexData = hexData;
        this.hexOffset = 0x0; // Multiplied by 2 because technically it's always reading in nibbles
    }

    readInt(bytes) {
        return parseInt(this.hexData.slice(this.hexOffset, this.hexOffset += bytes * 2), 16);
    }

    readStr(bytes) {
        let str = "";
        for (let i = 0; i < bytes; i++) {
            let strByte = this.readInt(1);
            let decode = String.fromCharCode(strByte);
            str += decode.match(/[\x20-\x7E]/g) ? decode : `\\${toHex(strByte, 2).slice(1)}`;
        }
        return str;
    }

    seek(bytes, relative = false) {
        return this.hexOffset = (relative ? this.hexOffset : 0) + bytes * 2;
    }

    tell() {
        return this.hexOffset;
    }
}

$("#load-nav").load("/internal/navbar.html", function prepNavbar() {
    let navBtn = document.getElementsByClassName("nav-link");
    let navPath = window.location.pathname.split("/")[1];
    for (let i = 0; i < navBtn.length; i++) {
        if (navBtn[i].pathname.split("/")[1] === navPath) {
            navBtn[i].classList.add("active");
            break;
        }
    }
});

$("#load-toc").append(function prepMainToc() {
    let headings = document.getElementsByTagName("h3");
    let tocHead = document.createElement("h5");
    tocHead.innerHTML = "Table of Contents";
    let toc = document.createElement("ol");

    for (let i = 0; i < headings.length; i++) {
        let entry = document.createElement("li");
        let entryName = headings[i].textContent;
        let entryLink = document.createElement("a");
        let entryJump = entryName.replace(/ /g, "_");

        headings[i].setAttribute("id", entryJump);
        headings[i].outerHTML = `<br>${headings[i].outerHTML}<hr>`;
        entryLink.href = `#${entryJump}`;
        entryLink.innerHTML = entryName;

        entry.appendChild(entryLink);
        toc.appendChild(entry);
    }
    if (headings.length > 3) {
        return tocHead.outerHTML + toc.outerHTML;
    }
});

$(".info-table").each(function populateInfoTables() {
    let tblContent = this.children;
    let tblNew = document.createElement("table");
    for (let i = 0; i < tblContent.length; i++) {
        let tblTitle = (function() {
            switch (tblContent[i].id) {
                case "about":
                    return "About";
                case "indepth":
                    return "How it works";
                case "source":
                    return "Source code";
                default:
                    return tblContent[i].id;
            }
        })().replace(/ /g, "&nbsp;");

        let tblRow = tblNew.insertRow();
        let tblHead = tblRow.insertCell();
        let tblText = tblRow.insertCell();
        tblHead.outerHTML = `<th>${tblTitle}</th>`;
        tblText.innerHTML = tblContent[i].innerHTML;
    }
    this.innerHTML = tblNew.outerHTML;
});
