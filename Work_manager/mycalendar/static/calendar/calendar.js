document.addEventListener("DOMContentLoaded", function () {

    "use strict";


    // ==================================================
    // CONSTANTS
    // ==================================================

    const MONTH_NAMES = [
        "فروردین",
        "اردیبهشت",
        "خرداد",
        "تیر",
        "مرداد",
        "شهریور",
        "مهر",
        "آبان",
        "آذر",
        "دی",
        "بهمن",
        "اسفند"
    ];


    const WEEKDAYS = [
        "شنبه",
        "یکشنبه",
        "دوشنبه",
        "سه‌شنبه",
        "چهارشنبه",
        "پنجشنبه",
        "جمعه"
    ];


    // ==================================================
    // DOM
    // ==================================================

    const modal =
        document.getElementById("calendar-picker-modal");

    const monthTitle =
        document.getElementById("month-title");

    const weekdaysElement =
        document.getElementById("weekdays");

    const calendarGrid =
        document.getElementById("calendar-grid");

    const previousMonthButton =
        document.getElementById("previous-month");

    const nextMonthButton =
        document.getElementById("next-month");

    const closeButton =
        document.getElementById("calendar-picker-close");

    const overlay =
        document.querySelector(".calendar-picker-overlay");


    // ==================================================
    // CHECK DOM
    // ==================================================

    if (
        !modal ||
        !monthTitle ||
        !weekdaysElement ||
        !calendarGrid ||
        !previousMonthButton ||
        !nextMonthButton
    ) {

        console.error(
            "MyCalendar: required HTML elements are missing."
        );

        return;
    }


    // ==================================================
    // STATE
    // ==================================================

    const today =
        getTodayJalali();

    let currentYear =
        today.year;

    let currentMonth =
        today.month;

    let targetInput =
        null;


    // ==================================================
    // PUBLIC API
    // ==================================================

    window.MyCalendar = {

        open: function (input) {
            openCalendar(input);
        },

        close: function () {
            closeCalendar();
        }

    };


    // ==================================================
    // OPEN CALENDAR
    // ==================================================

    function openCalendar(input) {

        if (!input) {
            return;
        }


        targetInput = input;


        // If input already contains a date,
        // open the same month.
        const parts =
            input.value.trim().split("/");


        if (
            parts.length === 3 &&
            isValidNumber(parts[0]) &&
            isValidNumber(parts[1]) &&
            isValidNumber(parts[2])
        ) {

            const year =
                Number(parts[0]);

            const month =
                Number(parts[1]);

            const day =
                Number(parts[2]);


            if (
                isValidJalaaliDate(
                    year,
                    month,
                    day
                )
            ) {

                currentYear =
                    year;

                currentMonth =
                    month;

            }

        }
        else {

            currentYear =
                today.year;

            currentMonth =
                today.month;

        }


        renderCalendar();


        modal.hidden = false;


        document.body.classList.add(
            "calendar-open"
        );

    }


    // ==================================================
    // CLOSE CALENDAR
    // ==================================================

    function closeCalendar() {

        modal.hidden = true;

        targetInput = null;

        document.body.classList.remove(
            "calendar-open"
        );

    }


    // ==================================================
    // WEEKDAYS
    // ==================================================

    function renderWeekdays() {

        weekdaysElement.innerHTML = "";


        WEEKDAYS.forEach(
            function (day) {

                const element =
                    document.createElement("div");


                element.className =
                    "weekday";


                element.textContent =
                    day;


                weekdaysElement.appendChild(
                    element
                );

            }
        );

    }


    // ==================================================
    // CALENDAR
    // ==================================================

    function renderCalendar() {

        monthTitle.textContent =
            `${MONTH_NAMES[currentMonth - 1]} ${currentYear}`;


        calendarGrid.innerHTML =
            "";


        const firstWeekday =
            getFirstWeekday(
                currentYear,
                currentMonth
            );


        const daysInMonth =
            jalaaliMonthLength(
                currentYear,
                currentMonth
            );


        // --------------------------------------------------
        // EMPTY CELLS
        // --------------------------------------------------

        for (
            let i = 0;
            i < firstWeekday;
            i++
        ) {

            const emptyCell =
                document.createElement("div");


            emptyCell.className =
                "calendar-day empty";


            calendarGrid.appendChild(
                emptyCell
            );

        }


        // --------------------------------------------------
        // DAYS
        // --------------------------------------------------

        for (
            let day = 1;
            day <= daysInMonth;
            day++
        ) {

            const button =
                document.createElement("button");


            button.type =
                "button";


            button.className =
                "calendar-day";


            button.textContent =
                day;


            // Today
            if (
                day === today.day &&
                currentMonth === today.month &&
                currentYear === today.year
            ) {

                button.classList.add(
                    "today"
                );

            }


            // Selected value
            if (
                targetInput &&
                targetInput.value
            ) {

                const selectedParts =
                    targetInput.value.split("/");


                if (
                    selectedParts.length === 3 &&
                    Number(selectedParts[0]) === currentYear &&
                    Number(selectedParts[1]) === currentMonth &&
                    Number(selectedParts[2]) === day
                ) {

                    button.classList.add(
                        "selected"
                    );

                }

            }


            button.addEventListener(
                "click",
                function () {

                    selectDate(
                        currentYear,
                        currentMonth,
                        day
                    );

                }
            );


            calendarGrid.appendChild(
                button
            );

        }

    }


    // ==================================================
    // SELECT DATE
    // ==================================================

    function selectDate(
        year,
        month,
        day
    ) {

        if (!targetInput) {
            return;
        }


        const value =
            `${year}/${pad(month)}/${pad(day)}`;


        targetInput.value =
            value;


        targetInput.dispatchEvent(
            new Event(
                "change",
                {
                    bubbles: true
                }
            )
        );


        closeCalendar();

    }


    // ==================================================
    // PREVIOUS MONTH
    // ==================================================

    previousMonthButton.addEventListener(
        "click",
        function () {

            currentMonth--;


            if (
                currentMonth < 1
            ) {

                currentMonth =
                    12;

                currentYear--;

            }


            renderCalendar();

        }
    );


    // ==================================================
    // NEXT MONTH
    // ==================================================

    nextMonthButton.addEventListener(
        "click",
        function () {

            currentMonth++;


            if (
                currentMonth > 12
            ) {

                currentMonth =
                    1;

                currentYear++;

            }


            renderCalendar();

        }
    );


    // ==================================================
    // CLOSE
    // ==================================================

    if (closeButton) {

        closeButton.addEventListener(
            "click",
            closeCalendar
        );

    }


    if (overlay) {

        overlay.addEventListener(
            "click",
            closeCalendar
        );

    }


    // ==================================================
    // ESC KEY
    // ==================================================

    document.addEventListener(
        "keydown",
        function (event) {

            if (
                event.key === "Escape" &&
                !modal.hidden
            ) {

                closeCalendar();

            }

        }
    );


    // ==================================================
    // CONNECT INPUTS
    // ==================================================

    document
        .querySelectorAll(
            ".jalali-date-input"
        )
        .forEach(
            function (input) {

                input.addEventListener(
                    "click",
                    function () {

                        openCalendar(
                            this
                        );

                    }
                );

            }
        );


    // ==================================================
    // TODAY
    // ==================================================

    function getTodayJalali() {

        const formatter =
            new Intl.DateTimeFormat(
                "en-US-u-ca-persian",
                {
                    year: "numeric",
                    month: "numeric",
                    day: "numeric"
                }
            );


        const parts =
            formatter.formatToParts(
                new Date()
            );


        return {

            year: Number(
                parts.find(
                    part =>
                        part.type === "year"
                ).value
            ),

            month: Number(
                parts.find(
                    part =>
                        part.type === "month"
                ).value
            ),

            day: Number(
                parts.find(
                    part =>
                        part.type === "day"
                ).value
            )

        };

    }


    // ==================================================
    // JALAALI -> JULIAN DAY
    // BORKOWSKI ALGORITHM
    // ==================================================

    function j2d(
        jy,
        jm,
        jd
    ) {

        const breaks = [
            -61,
            9,
            38,
            199,
            426,
            686,
            756,
            818,
            1111,
            1181,
            1210,
            1635,
            2060,
            2097,
            2192,
            2262,
            2324,
            2394,
            2456,
            3178
        ];


        const bl =
            breaks.length;


        let gy =
            jy + 621;


        let leapJ =
            -14;


        let jp =
            breaks[0];


        let jump;


        let leapG;


        let march;


        let n;


        for (
            let i = 1;
            i < bl;
            i++
        ) {

            const current =
                breaks[i];


            if (
                jy < current
            ) {

                break;

            }


            jp =
                current;

        }


        const index =
            breaks.indexOf(jp);


        if (
            index + 1 < bl
        ) {

            jump =
                breaks[index + 1] - jp;

        }
        else {

            jump = 0;

        }


        n =
            jy - jp;


        leapJ =
            Math.floor(n / 33) * 8 +
            Math.floor(
                (
                    (n % 33) + 3
                ) / 4
            );


        if (
            jump > 0 &&
            (
                (n + 1) % 33
            ) === 0
        ) {

            leapJ--;

        }


        leapG =
            Math.floor(
                gy / 4
            )
            -
            Math.floor(
                (
                    Math.floor(
                        gy / 100
                    ) + 1
                ) * 3 / 4
            )
            -
            150;


        march =
            20 +
            leapJ -
            leapG;


        const marchJdn =
            g2d(
                gy,
                3,
                march
            );


        if (
            jm <= 7
        ) {

            return (
                marchJdn +
                (jm - 1) * 31 +
                jd -
                1
            );

        }


        return (
            marchJdn +
            6 * 31 +
            (jm - 7) * 30 +
            jd -
            1
        );

    }


    // ==================================================
    // GREGORIAN -> JULIAN DAY
    // ==================================================

    function g2d(
        gy,
        gm,
        gd
    ) {

        return (
            Math.floor(
                (
                    1461 *
                    (
                        gy +
                        4800 +
                        Math.floor(
                            (
                                gm - 14
                            ) / 12
                        )
                    )
                ) / 4
            )
            +
            Math.floor(
                (
                    367 *
                    (
                        gm -
                        2 -
                        12 *
                        Math.floor(
                            (
                                gm - 14
                            ) / 12
                        )
                    )
                ) / 12
            )
            -
            Math.floor(
                (
                    3 *
                    Math.floor(
                        (
                            gy +
                            4900 +
                            Math.floor(
                                (
                                    gm - 14
                                ) / 12
                            )
                        ) / 100
                    )
                ) / 4
            )
            +
            gd
            -
            32075
        );

    }


    // ==================================================
    // JULIAN DAY -> GREGORIAN
    // ==================================================

    function d2g(
        jdn
    ) {

        const j =
            jdn;


        const f =
            j + 1401;


        const e =
            4 * f + 274277;


        const g =
            Math.floor(
                e / 146097
            ) * 3;


        const h =
            e -
            Math.floor(
                e / 146097
            ) *
            146097;


        const i =
            Math.floor(
                h / 36524
            );


        const k =
            Math.floor(
                (
                    h -
                    i * 36524
                ) / 1461
            );


        const y =
            Math.floor(
                (
                    g +
                    k
                ) / 4
            );


        const l =
            h -
            365 * y;


        const m =
            Math.floor(
                (
                    5 * l +
                    2
                ) / 153
            );


        const day =
            l -
            Math.floor(
                (
                    153 * m +
                    2
                ) / 5
            ) +
            1;


        const month =
            m +
            3 -
            12 *
            Math.floor(
                m / 10
            );


        const year =
            y -
            4800 +
            Math.floor(
                m / 10
            );


        return {

            gy: year,
            gm: month,
            gd: day

        };

    }


    // ==================================================
    // JALAALI -> GREGORIAN
    // ==================================================

    function jalaaliToGregorian(
        jy,
        jm,
        jd
    ) {

        return d2g(
            j2d(
                jy,
                jm,
                jd
            )
        );

    }


    // ==================================================
    // FIRST WEEKDAY
    // ==================================================

    function getFirstWeekday(
        jy,
        jm
    ) {

        const gregorian =
            jalaaliToGregorian(
                jy,
                jm,
                1
            );


        const date =
            new Date(
                Date.UTC(
                    gregorian.gy,
                    gregorian.gm - 1,
                    gregorian.gd
                )
            );


        /*
        JavaScript:
            Sunday = 0
            Monday = 1
            ...
            Saturday = 6

        Calendar:
            Saturday = 0
            Sunday   = 1
            ...
            Friday   = 6
        */

        return (
            date.getUTCDay() + 1
        ) % 7;

    }


    // ==================================================
    // LEAP YEAR
    // ==================================================

    function isLeapJalaaliYear(
        jy
    ) {

        /*
        A Jalali year is leap when
        Esfand has 30 days.
        */

        const currentYearLastDay =
            j2d(
                jy,
                12,
                30
            );


        const nextYearFirstDay =
            j2d(
                jy + 1,
                1,
                1
            );


        return (
            nextYearFirstDay -
            currentYearLastDay ===
            1
        );

    }


    // ==================================================
    // MONTH LENGTH
    // ==================================================

    function jalaaliMonthLength(
        jy,
        jm
    ) {

        if (
            jm >= 1 &&
            jm <= 6
        ) {

            return 31;

        }


        if (
            jm >= 7 &&
            jm <= 11
        ) {

            return 30;

        }


        return isLeapJalaaliYear(
            jy
        )
            ? 30
            : 29;

    }


    // ==================================================
    // VALIDATION
    // ==================================================

    function isValidJalaaliDate(
        jy,
        jm,
        jd
    ) {

        if (
            !Number.isInteger(jy) ||
            !Number.isInteger(jm) ||
            !Number.isInteger(jd)
        ) {

            return false;

        }


        if (
            jm < 1 ||
            jm > 12
        ) {

            return false;

        }


        return (
            jd >= 1 &&
            jd <=
                jalaaliMonthLength(
                    jy,
                    jm
                )
        );

    }


    function isValidNumber(
        value
    ) {

        return (
            value !== "" &&
            !Number.isNaN(
                Number(value)
            )
        );

    }


    function pad(
        value
    ) {

        return String(
            value
        ).padStart(
            2,
            "0"
        );

    }


    // ==================================================
    // INITIALIZE
    // ==================================================

    renderWeekdays();

});