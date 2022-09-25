// Written by Edness   2022-09-07 - 2022-09-25

function hexInput(str, size, elem) {
    const strPad = "0x" + str.slice(2, size + 2).toUpperCase().replace(/[^0-9A-F]/g, "0").padEnd(size, "0");
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
    return "0x" + num.toString(16).padStart(size, "0").toUpperCase();
}

$("#load-nav").load("/internal/navbar.html", function prepNavbar() {
    let navBtn = document.getElementsByClassName("nav-link");
    for (let i = 0; i < navBtn.length; i++) {
        if (navBtn[i].pathname.split("/")[1] === window.location.pathname.split("/")[1]) {
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

//////////////////////////
//   Tools page stuff   //
//////////////////////////
$(".tool-entry > #title").each(function fixToolTitles() {
    this.innerHTML = this.innerHTML.trim().replace(/ /g, "&nbsp;").replace(/-/g, "&#8209;");
});

$(".tool-entry > #source").each(function createSourceLinks() {
    let srcView = document.createElement("a");
    srcView.href = this.innerHTML.trim();
    srcView.setAttribute("target", "_blank");
    srcView.innerHTML = "View";
    // Originally used a ternary, but thought it's safer to check if innerHTML exists
    if (this.innerHTML.includes("github.com") && this.innerHTML.includes("/blob/")) {
        let srcDown = document.createElement("a");
        // Doing just .replace("/blob/", "/raw/") won't work because it's a redirect and it doesn't like that
        let rawUrl = this.innerHTML.replace("github.com", "raw.githubusercontent.com").replace("/blob/", "/").trim();
        srcDown.href = `javascript:githubRawDownload("${rawUrl}")`;
        srcDown.innerHTML = "Download";
        this.innerHTML = `${srcView.outerHTML}&nbsp;|&nbsp;${srcDown.outerHTML}`;
    } else if (this.innerHTML.trim()) {
        this.innerHTML = srcView.outerHTML;
    }
});

$(".tool-table").each(function populateToolTables() {
    const tblHeadNames = [
        "Name",
        "Platform",
        "Source",
        "Additional information"
    ];

    this.classList.add("px-lg-5");
    let sectHead = document.createElement("h4");
    sectHead.innerHTML = this.id;

    let tblNew = document.createElement("table");
    let tblHead = tblNew.createTHead();
    let tblHeadRow = tblHead.insertRow();
    tblNew.classList.add("table");
    tblHeadNames.forEach((tblHeadCell, idx) => {
        tblHeadTitle = tblHeadRow.insertCell();
        tblHeadTitle.outerHTML = // this is awful
            `${(idx < tblHeadNames.length - 1) ? "<th class=local-min>" : "<th>"}${tblHeadCell.replace(/ /g, "&nbsp;")}</th>`;
    });

    //$(".tool-table > .tool-entry").each(function populateToolEntries() {
    // Originally I had this in jQuery, but it'd apply to every tool-entry multiple times
    let tblBody = tblNew.createTBody();
    let tblEntries = this.children;
    for (i = 0; i < tblEntries.length; i++) {
        let tblContent = tblEntries[i].children;
        let tblRow = tblBody.insertRow();

        let tblEntryName = tblRow.insertCell();
        let tblEntryPlatf = tblRow.insertCell();
        let tblEntrySrc = tblRow.insertCell();
        let tblEntryNotes = tblRow.insertCell();
        for (let j = 0; j < tblContent.length; j++) {
            (function() {
                switch (tblContent[j].id) {
                    case "title":
                        return tblEntryName;
                    case "platform":
                        return tblEntryPlatf;
                    case "source":
                        return tblEntrySrc;
                    case "additional":
                        return tblEntryNotes;
                }
            })().innerHTML = tblContent[j].innerHTML;
        }
    }

    this.innerHTML = tblNew.outerHTML;
    this.outerHTML = `<br>${sectHead.outerHTML}${this.outerHTML}`;
});

$("#tool-toc").append(function prepToolToc() {
    let headings = document.getElementsByTagName("h4");
    let tocHead = document.createElement("h5");
    tocHead.innerHTML = "<br>Table of Contents";
    let toc = document.createElement("ol");

    for (let i = 0; i < headings.length; i++) {
        let entry = document.createElement("li");
        let entryName = headings[i].textContent;
        let entryLink = document.createElement("a");
        let entryJump = entryName.replace(/ /g, "_");

        headings[i].setAttribute("id", entryJump);
        entryLink.href = `#${entryJump}`;
        entryLink.innerHTML = entryName;

        entry.appendChild(entryLink);
        toc.appendChild(entry);
    }
    return tocHead.outerHTML + toc.outerHTML;
});

function githubRawDownload(url) {
    // Borrowed from https://codepen.io/theConstructor/pen/vKNRdE
    let filename = url.substring(url.lastIndexOf("/") + 1);
    let xhr = new XMLHttpRequest();
    xhr.responseType = "blob";
    xhr.onload = function() {
        let a = document.createElement("a");
        a.href = window.URL.createObjectURL(xhr.response);
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        delete a;
    }
    xhr.open("GET", url);
    xhr.send();
}
