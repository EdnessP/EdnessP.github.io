// Written by Edness   2022-09-07 - 2022-09-23

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
