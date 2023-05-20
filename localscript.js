// Written by Edness   2022-09-07 - 2023-05-20

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

        entryLink.href = `#${entryJump}`;

        entryLink.innerHTML = "#";
        headings[i].setAttribute("id", entryJump);
        headings[i].innerHTML = `${entryLink.outerHTML} ${headings[i].innerHTML}`;
        headings[i].outerHTML = `<br>${headings[i].outerHTML}<hr>`;

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
