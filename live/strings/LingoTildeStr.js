/*
  This is a very stripped down recreation of the function at 00402630 in SIA Tilde's Lingo (EXE CRC32: EEE06AD9),
  that handles decompressing and loading a random string from the array in the WORDS resource 110 inside the EXE.

  Some creative liberty™ was taken to simplify things further, such as the converted letter switch case normally
  returning lower-case 1257 encoded letters and right after that subtracting by 32 to get its upper-case variant.
  Here it will just return them already in upper-case (and not 1257 encoded either, I hope.)

  My initial inspiration for this was remembering how when I was a kid, there was an insanely rare chance (1/1000)
  I'd get the broken answer GVAAA.  The cause of this, as I've now learned is from the 1st 32 bit value in the res
  which is the number 999 (signifying it has 999 total words) yet that also gets picked up as a compressed string
  and its decompressed result is, as you might've expected - GVAAA.

  A bonus addition not a part of the original game I added was the ability to compress your own string.  It can be
  either replaced in the EXE, or what I did - using a debugger and replacing the loaded value in the ESI register
  when hitting a breakpoint anywhere between instructions at 0040278D and 004027D9.
  ... Or just replace the unpacked string at 0040ACF0 in RAM, but that's no fun and won't change the 1st character.
*/

// Written by Edness   v1.2   2022-09-09 - 2023-03-09

const lingoCharSize = 5;

const lingoChars = {
     0: "A",  1: "Ā",  2: "B",  3: "C",  4: "Č",  5: "D",  6: "E",  7: "Ē",
     8: "F",  9: "G", 10: "Ģ", 11: "H", 12: "I", 13: "Ī", 14: "J", 15: "K",
    16: "Ķ", 17: "L", 18: "Ļ", 19: "M", 20: "N", 21: "Ņ", 22: "O", 23: "P",
    24: "R", 25: "S", 26: "Š", 27: "T", 28: "U", 29: "Ū", 30: "V", 31: "Z",
    32: "Ž"  // "Ž" is normally the switch default in the game
};

const lingoCmpChars = {
    "Ā": "1", "B": "2", "C": "3", "Č": "4", "D": "5", "E": "6", "Ē": "7", "F": "8",
    "G": "9", "Ģ": "a", "H": "b", "I": "c", "Ī": "d", "J": "e", "K": "f", "Ķ": "g",
    "L": "h", "Ļ": "i", "M": "j", "N": "k", "Ņ": "l", "O": "m", "P": "n", "R": "o",
    "S": "p", "Š": "q", "T": "r", "U": "s", "Ū": "t", "V": "u", "Z": "v", "Ž": "w"
};

function lingoCompress(str) {
    const input = strReverse(str.toUpperCase().padEnd(lingoCharSize, "A"));
    const output = document.getElementById("lingo-comp-output");
    let chars = "";
    for (let i = 0; i < lingoCharSize; i++) {
        dChar = lingoCmpChars[input[i]];
        if (!dChar) { dChar = "0"; } // "A" default, used for any char not in the dict
        chars += dChar;
    }
    output.value = toHex(parseInt(chars, 33));
}

function lingoDecompress(elem) {
    const output = document.getElementById("lingo-decomp-output");
    let input = hexInput(elem, 8);
    let string = "";
    for (let i = 0; i < lingoCharSize; i++) {
        string += lingoChars[(input % 33) >> 0];
        input /= 33;
    }
    output.value = string;
}
