﻿/*
* Kendo UI Mobile v2012.2.710 (http://kendoui.com)
* Copyright 2012 Telerik AD. All rights reserved.
*
* Kendo UI Mobile commercial licenses may be obtained at http://kendoui.com/mobile-license
* If you do not own a commercial license, this file shall be governed by the trial license terms.
*/
﻿(function( window, undefined ) {
    kendo.cultures["km-KH"] = {
        name: "km-KH",
        numberFormat: {
            pattern: ["- n"],
            decimals: 2,
            ",": ",",
            ".": ".",
            groupSize: [3,0],
            percent: {
                pattern: ["-n%","n%"],
                decimals: 2,
                ",": ",",
                ".": ".",
                groupSize: [3,0],
                symbol: "%"
            },
            currency: {
                pattern: ["-n$","n$"],
                decimals: 2,
                ",": ",",
                ".": ".",
                groupSize: [3],
                symbol: "៛"
            }
        },
        calendars: {
            standard: {
                days: {
                    names: ["ថ្ងៃអាទិត្យ","ថ្ងៃច័ន្ទ","ថ្ងៃអង្គារ","ថ្ងៃពុធ","ថ្ងៃព្រហស្បតិ៍","ថ្ងៃសុក្រ","ថ្ងៃសៅរ៍"],
                    namesAbbr: ["អាទិ.","ច.","អ.","ពុ","ព្រហ.","សុ.","ស."],
                    namesShort: ["អា","ច","អ","ពុ","ព្","សុ","ស"]
                },
                months: {
                    names: ["មករា","កុម្ភៈ","មិនា","មេសា","ឧសភា","មិថុនា","កក្កដា","សីហា","កញ្ញា","តុលា","វិច្ឆិកា","ធ្នូ",""],
                    namesAbbr: ["១","២","៣","៤","៥","៦","៧","៨","៩","១០","១១","១២",""]
                },
                AM: ["ព្រឹក","ព្រឹក","ព្រឹក"],
                PM: ["ល្ងាច","ល្ងាច","ល្ងាច"],
                patterns: {
                    d: "yyyy-MM-dd",
                    D: "d MMMM yyyy",
                    F: "d MMMM yyyy HH:mm:ss",
                    g: "yyyy-MM-dd H:mm tt",
                    G: "yyyy-MM-dd HH:mm:ss",
                    m: "'ថ្ងៃទី' dd 'ខែ' MM",
                    M: "'ថ្ងៃទី' dd 'ខែ' MM",
                    s: "yyyy'-'MM'-'dd'T'HH':'mm':'ss",
                    t: "H:mm tt",
                    T: "HH:mm:ss",
                    u: "yyyy'-'MM'-'dd HH':'mm':'ss'Z'",
                    y: "'ខែ' MM 'ឆ្នាំ' yyyy",
                    Y: "'ខែ' MM 'ឆ្នាំ' yyyy"
                },
                "/": "-",
                ":": ":",
                firstDay: 0
            }
        }
    }
})(this);
;