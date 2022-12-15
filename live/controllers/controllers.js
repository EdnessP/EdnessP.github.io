// Written by Edness   v1.0   2022-12-15

function ctrlBtnSelected(sys, btn, len) {
    const output = document.getElementById(`ctrl-${sys}-output`);
    const btnCell = `#controller-${sys} #${btn}`;
    const btnClr = "rgba(0, 0, 0, 0.267)"; // #0004
    $(btnCell).css("background-color") === btnClr
        ? $(btnCell).css("background-color", "")
        : $(btnCell).css("background-color", btnClr);
    output.value = toHex(output.value ^ 1 << btn, len);
}

function ctrlGCN(btn) {
    ctrlBtnSelected("gcn", btn, 4);
}

function ctrlPS2(btn) {
    ctrlBtnSelected("ps2", btn, 4);
}

function ctrlPSP(btn) {
    ctrlBtnSelected("psp", btn, 6);
}

function ctrlWii(btn) {
    ctrlBtnSelected("wii", btn, 4);
}

/*function ctrlXbx(btn) {
    ctrlBtnSelected("xbx", btn, 6);
}*/
