﻿/*
* Kendo UI Mobile v2012.2.710 (http://kendoui.com)
* Copyright 2012 Telerik AD. All rights reserved.
*
* Kendo UI Mobile commercial licenses may be obtained at http://kendoui.com/mobile-license
* If you do not own a commercial license, this file shall be governed by the trial license terms.
*/
﻿(function( window, undefined ) {
    kendo.cultures["am"] = {
        name: "am",
        numberFormat: {
            pattern: ["-n"],
            decimals: 1,
            ",": ",",
            ".": ".",
            groupSize: [3,0],
            percent: {
                pattern: ["-n%","n%"],
                decimals: 1,
                ",": ",",
                ".": ".",
                groupSize: [3,0],
                symbol: "%"
            },
            currency: {
                pattern: ["-$n","$n"],
                decimals: 2,
                ",": ",",
                ".": ".",
                groupSize: [3,0],
                symbol: "ETB"
            }
        },
        calendars: {
            standard: {
                days: {
                    names: ["እሑድ","ሰኞ","ማክሰኞ","ረቡዕ","ሐሙስ","ዓርብ","ቅዳሜ"],
                    namesAbbr: ["እሑድ","ሰኞ","ማክሰ","ረቡዕ","ሐሙስ","ዓርብ","ቅዳሜ"],
                    namesShort: ["እ","ሰ","ማ","ረ","ሐ","ዓ","ቅ"]
                },
                months: {
                    names: ["ጃንዩወሪ","ፌብሩወሪ","ማርች","ኤፕረል","ሜይ","ጁን","ጁላይ","ኦገስት","ሴፕቴምበር","ኦክተውበር","ኖቬምበር","ዲሴምበር",""],
                    namesAbbr: ["ጃንዩ","ፌብሩ","ማርች","ኤፕረ","ሜይ","ጁን","ጁላይ","ኦገስ","ሴፕቴ","ኦክተ","ኖቬም","ዲሴም",""]
                },
                AM: ["ጡዋት","ጡዋት","ጡዋት"],
                PM: ["ከሰዓት","ከሰዓት","ከሰዓት"],
                patterns: {
                    d: "d/M/yyyy",
                    D: "dddd '፣' MMMM d 'ቀን' yyyy",
                    F: "dddd '፣' MMMM d 'ቀን' yyyy h:mm:ss tt",
                    g: "d/M/yyyy h:mm tt",
                    G: "d/M/yyyy h:mm:ss tt",
                    m: "MMMM d ቀን",
                    M: "MMMM d ቀን",
                    s: "yyyy'-'MM'-'dd'T'HH':'mm':'ss",
                    t: "h:mm tt",
                    T: "h:mm:ss tt",
                    u: "yyyy'-'MM'-'dd HH':'mm':'ss'Z'",
                    y: "MMMM yyyy",
                    Y: "MMMM yyyy"
                },
                "/": "/",
                ":": ":",
                firstDay: 0
            }
        }
    }
})(this);
;