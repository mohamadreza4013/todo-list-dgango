// ==================================================
// JALALI CALENDAR
// ==================================================

// Wait until the entire HTML document has been loaded
// before running the calendar code.
document.addEventListener("DOMContentLoaded", function () {

    // Enable strict mode for safer JavaScript execution.
    "use strict";


    // ==================================================
    // CONSTANTS
    // ==================================================

    // Store the names of the twelve Jalali months.
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


    // Store the names of the days of the week.
    // The calendar starts from Saturday.
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

    // Get the main calendar modal element.
    const modal =
        document.getElementById("calendar-picker-modal");

    // Get the element used to display the current month and year.
    const monthTitle =
        document.getElementById("month-title");

    // Get the container used to display weekday names.
    const weekdaysElement =
        document.getElementById("weekdays");

    // Get the container used to display calendar days.
    const calendarGrid =
        document.getElementById("calendar-grid");

    // Get the button used to move to the previous month.
    const previousMonthButton =
        document.getElementById("previous-month");

    // Get the button used to move to the next month.
    const nextMonthButton =
        document.getElementById("next-month");

    // Get the button used to close the calendar.
    const closeButton =
        document.getElementById("calendar-picker-close");

    // Get the calendar overlay element.
    const overlay =
        document.querySelector(".calendar-picker-overlay");


    // ==================================================
    // CHECK DOM
    // ==================================================

    // Make sure all required calendar elements exist.
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

    // Get today's date in the Jalali calendar.
    const today =
        getTodayJalali();

    // Set the initially displayed Jalali year.
    let currentYear =
        today.year;

    // Set the initially displayed Jalali month.
    let currentMonth =
        today.month;

    // Store the input currently connected to the calendar.
    let targetInput =
        null;


    // ==================================================
    // PUBLIC API
    // ==================================================

    // Expose calendar functions globally.
    window.MyCalendar = {

        // Open the calendar for a specific input.
        open: function (input) {
            openCalendar(input);
        },

        // Close the calendar.
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

        // Store the input that opened the calendar.
        targetInput = input;

        // Get the current value from the input.
        let value = input.value.trim();

        // Convert Persian digits to English digits.
        value = persianToEnglishDigits(value);

        // Support both "/" and "-" separators.
        value = value.replace(/-/g, "/");

        // Try to parse the existing date.
        const selectedDate =
            parseDateFromInput(value);

        if (selectedDate) {

            // Open calendar on the existing date.
            currentYear =
                selectedDate.year;

            currentMonth =
                selectedDate.month;

        } else {

            // If there is no valid date,
            // open the current month.
            currentYear =
                today.year;

            currentMonth =
                today.month;

        }

        // Render calendar.
        renderCalendar();

        // Show modal.
        modal.hidden = false;

        // Add class to body.
        document.body.classList.add(
            "calendar-open"
        );
    }
    // ==================================================
    // CLOSE CALENDAR
    // ==================================================

    // Close the calendar picker.
    function closeCalendar() {

        // Hide the modal.
        modal.hidden = true;

        // Remove the target input reference.
        targetInput = null;

        // Remove calendar-open class.
        document.body.classList.remove(
            "calendar-open"
        );

    }


    // ==================================================
    // WEEKDAYS
    // ==================================================

    // Render weekday names.
    function renderWeekdays() {

        // Clear existing weekdays.
        weekdaysElement.innerHTML = "";


        // Create weekday elements.
        WEEKDAYS.forEach(
            function (day) {

                // Create weekday element.
                const element =
                    document.createElement("div");


                // Add CSS class.
                element.className =
                    "weekday";


                // Set weekday text.
                element.textContent =
                    day;


                // Add element to calendar.
                weekdaysElement.appendChild(
                    element
                );

            }
        );

    }


    // ==================================================
    // RENDER CALENDAR
    // ==================================================

    // Generate the calendar for the current month.
    function renderCalendar() {

        // Display month name and year.
        monthTitle.textContent =
            `${MONTH_NAMES[currentMonth - 1]} ${toPersianDigits(currentYear)}`;


        // Clear existing calendar days.
        calendarGrid.innerHTML =
            "";


        // Calculate the weekday of the first day.
        const firstWeekday =
            getFirstWeekday(
                currentYear,
                currentMonth
            );


        // Calculate the number of days in the month.
        const daysInMonth =
            jalaaliMonthLength(
                currentYear,
                currentMonth
            );


        // --------------------------------------------------
        // EMPTY CELLS
        // --------------------------------------------------

        // Add empty cells before the first day.
        for (
            let i = 0;
            i < firstWeekday;
            i++
        ) {

            // Create empty cell.
            const emptyCell =
                document.createElement("div");


            // Assign classes.
            emptyCell.className =
                "calendar-day empty";


            // Add to calendar.
            calendarGrid.appendChild(
                emptyCell
            );

        }


        // --------------------------------------------------
        // DAYS
        // --------------------------------------------------

        // Create each day of the month.
        for (
            let day = 1;
            day <= daysInMonth;
            day++
        ) {

            // Create day button.
            const button =
                document.createElement("button");


            // Prevent form submission.
            button.type =
                "button";


            // Assign CSS class.
            button.className =
                "calendar-day";


            // Display Persian day number.
            button.textContent =
                toPersianDigits(day);


            // --------------------------------------------------
            // TODAY
            // --------------------------------------------------

            // Highlight today's date.
            if (
                day === today.day &&
                currentMonth === today.month &&
                currentYear === today.year
            ) {

                button.classList.add(
                    "today"
                );

            }


            // --------------------------------------------------
            // SELECTED DATE
            // --------------------------------------------------

            /*
                Check whether this day is the date currently
                stored in the input.

                Example input:

                ۱۴۰۵/۰۶/۱۸

                It is converted to:

                1405/06/18
            */

            if (
                targetInput &&
                targetInput.value
            ) {

                const selectedDate =
                    parseDateFromInput(
                        targetInput.value
                    );


                // If the input contains a valid date,
                // compare it with the current calendar day.
                if (
                    selectedDate &&
                    selectedDate.year === currentYear &&
                    selectedDate.month === currentMonth &&
                    selectedDate.day === day
                ) {

                    button.classList.add(
                        "selected"
                    );

                }

            }


            // --------------------------------------------------
            // SELECT DAY
            // --------------------------------------------------

            // Select this date when clicked.
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


            // Add button to calendar.
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

        // Build English date.
        const englishValue =
            `${year}/${pad(month)}/${pad(day)}`;

        // Convert to Persian digits.
        const persianValue =
            toPersianDigits(
                englishValue
            );

        // Put selected date into input.
        targetInput.value =
            persianValue;

        // Notify other JavaScript code.
        targetInput.dispatchEvent(
            new Event(
                "change",
                {
                    bubbles: true
                }
            )
        );

        // Close calendar.
        closeCalendar();
    }

    // ==================================================
    // PREVIOUS MONTH
    // ==================================================

    // Move to previous month.
    previousMonthButton.addEventListener(
        "click",
        function () {

            currentMonth--;


            // Move to previous year if necessary.
            if (
                currentMonth < 1
            ) {

                currentMonth =
                    12;

                currentYear--;

            }


            // Re-render calendar.
            renderCalendar();

        }
    );


    // ==================================================
    // NEXT MONTH
    // ==================================================

    // Move to next month.
    nextMonthButton.addEventListener(
        "click",
        function () {

            currentMonth++;


            // Move to next year if necessary.
            if (
                currentMonth > 12
            ) {

                currentMonth =
                    1;

                currentYear++;

            }


            // Re-render calendar.
            renderCalendar();

        }
    );


    // ==================================================
    // CLOSE BUTTON
    // ==================================================

    // Close the calendar when close button is clicked.
    if (closeButton) {

        closeButton.addEventListener(
            "click",
            closeCalendar
        );

    }


    // ==================================================
    // OVERLAY
    // ==================================================

    // Close the calendar when overlay is clicked.
    if (overlay) {

        overlay.addEventListener(
            "click",
            closeCalendar
        );

    }


    // ==================================================
    // ESC KEY
    // ==================================================

    // Close the calendar with Escape.
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
    // CONNECT DATE INPUTS
    // ==================================================

    // Find all Jalali date inputs.
    document
        .querySelectorAll(
            ".jalali-date-input"
        )
        .forEach(
            function (input) {

                // Open calendar when input is clicked.
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
    // GET TODAY JALALI
    // ==================================================

    // Get today's date in Jalali calendar.
    function getTodayJalali() {

        // Create Persian calendar formatter.
        const formatter =
            new Intl.DateTimeFormat(
                "en-US-u-ca-persian",
                {
                    year: "numeric",
                    month: "numeric",
                    day: "numeric"
                }
            );


        // Convert current Gregorian date
        // to Persian calendar parts.
        const parts =
            formatter.formatToParts(
                new Date()
            );


        // Extract year.
        const year =
            Number(
                parts.find(
                    part =>
                        part.type === "year"
                ).value
            );


        // Extract month.
        const month =
            Number(
                parts.find(
                    part =>
                        part.type === "month"
                ).value
            );


        // Extract day.
        const day =
            Number(
                parts.find(
                    part =>
                        part.type === "day"
                ).value
            );


        // Return Jalali date.
        return {
            year: year,
            month: month,
            day: day
        };

    }


    // ==================================================
    // JALAALI CALENDAR BREAKS
    // ==================================================

    // Define the Jalali calendar break points.
    const JALAALI_BREAKS = [
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


    // ==================================================
    // INTEGER DIVISION
    // ==================================================

    // Perform integer division.
    function div(
        a,
        b
    ) {

        return Math.trunc(
            a / b
        );

    }


    // ==================================================
    // MODULO
    // ==================================================

    // Calculate mathematical modulo.
    function mod(
        a,
        b
    ) {

        return (
            a -
            div(a, b) * b
        );

    }


    // ==================================================
    // JALAALI CALCULATION
    // ==================================================

    // Calculate Jalali calendar information.
    function jalCal(
        jy,
        withoutLeap
    ) {

        const breaks =
            JALAALI_BREAKS;

        const bl =
            breaks.length;

        let gy =
            jy + 621;

        let leapJ =
            -14;

        let jp =
            breaks[0];

        let jm;

        let jump;

        let leap;

        let leapG;

        let march;

        let n;


        // Validate Jalali year.
        if (
            jy < breaks[0] ||
            jy >= breaks[bl - 1]
        ) {

            throw new Error(
                "Jalaali year is out of supported range."
            );

        }


        // Find the current calendar cycle.
        for (
            let i = 1;
            i < bl;
            i++
        ) {

            jm =
                breaks[i];

            jump =
                jm - jp;


            if (
                jy < jm
            ) {

                break;

            }


            leapJ +=
                div(
                    jump,
                    33
                ) * 8
                +
                div(
                    mod(
                        jump,
                        33
                    ),
                    4
                );


            jp =
                jm;

        }


        // Number of years since the current break.
        n =
            jy - jp;


        // Calculate additional leap years.
        leapJ +=
            div(
                n,
                33
            ) * 8
            +
            div(
                mod(
                    n,
                    33
                ) + 3,
                4
            );


        // Special leap-year case.
        if (
            mod(
                jump,
                33
            ) === 4 &&
            jump - n === 4
        ) {

            leapJ++;

        }


        // Calculate Gregorian leap years.
        leapG =
            div(
                gy,
                4
            )
            -
            div(
                (
                    div(
                        gy,
                        100
                    ) + 1
                ) * 3,
                4
            )
            -
            150;


        // Calculate the Gregorian March day.
        march =
            20 +
            leapJ -
            leapG;


        // Return basic calendar information.
        if (
            withoutLeap
        ) {

            return {
                gy: gy,
                march: march
            };

        }


        // Calculate leap position.
        n =
            jy - breaks[0];


        leap =
            mod(
                mod(
                    n + 1,
                    33
                ) - 1,
                4
            );


        // Convert -1 to 4.
        if (
            leap === -1
        ) {

            leap =
                4;

        }


        // Return complete information.
        return {
            leap: leap,
            gy: gy,
            march: march
        };

    }


    // ==================================================
    // JALAALI -> JULIAN DAY
    // ==================================================

    // Convert Jalali date to Julian Day Number.
    function j2d(
        jy,
        jm,
        jd
    ) {

        const calendar =
            jalCal(
                jy,
                true
            );


        return (
            g2d(
                calendar.gy,
                3,
                calendar.march
            )
            +
            (
                jm - 1
            ) * 31
            -
            div(
                jm,
                7
            ) *
            (
                jm - 7
            )
            +
            jd -
            1
        );

    }


    // ==================================================
    // GREGORIAN -> JULIAN DAY
    // ==================================================

    // Convert Gregorian date to Julian Day Number.
    function g2d(
        gy,
        gm,
        gd
    ) {

        let d =
            div(
                (
                    gy +
                    div(
                        gm - 8,
                        6
                    ) +
                    100100
                ) * 1461,
                4
            )
            +
            div(
                153 *
                mod(
                    gm + 9,
                    12
                ) + 2,
                5
            )
            +
            gd -
            34840408;


        d =
            d -
            div(
                div(
                    gy +
                    100100 +
                    div(
                        gm - 8,
                        6
                    ),
                    100
                ) * 3,
                4
            )
            +
            752;


        return d;

    }


    // ==================================================
    // JULIAN DAY -> GREGORIAN
    // ==================================================

    // Convert Julian Day Number to Gregorian date.
    function d2g(
        jdn
    ) {

        let j =
            4 * jdn +
            139361631;


        j =
            j +
            div(
                div(
                    4 * jdn +
                    183187720,
                    146097
                ) * 3,
                4
            ) * 4
            -
            3908;


        const i =
            div(
                mod(
                    j,
                    1461
                ),
                4
            ) * 5
            +
            308;


        const gd =
            div(
                mod(
                    i,
                    153
                ),
                5
            )
            +
            1;


        const gm =
            mod(
                div(
                    i,
                    153
                ),
                12
            )
            +
            1;


        const gy =
            div(
                j,
                1461
            )
            -
            100100
            +
            div(
                8 - gm,
                6
            );


        return {
            gy: gy,
            gm: gm,
            gd: gd
        };

    }


    // ==================================================
    // JALAALI -> GREGORIAN
    // ==================================================

    // Convert Jalali date to Gregorian date.
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

    // Calculate the weekday of the first day of a Jalali month.
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

    // Determine whether a Jalali year is a leap year.
    function isLeapJalaaliYear(
        jy
    ) {

        const calendar =
            jalCal(
                jy,
                false
            );


        return (
            calendar.leap === 0
        );

    }


    // ==================================================
    // MONTH LENGTH
    // ==================================================

    // Return the number of days in a Jalali month.
    function jalaaliMonthLength(
        jy,
        jm
    ) {

        // First six months have 31 days.
        if (
            jm >= 1 &&
            jm <= 6
        ) {

            return 31;

        }


        // Months 7 through 11 have 30 days.
        if (
            jm >= 7 &&
            jm <= 11
        ) {

            return 30;

        }


        // Esfand has 29 or 30 days.
        return isLeapJalaaliYear(
            jy
        )
            ? 30
            : 29;

    }


    // ==================================================
    // DATE VALIDATION
    // ==================================================

    // Validate a complete Jalali date.
    function isValidJalaaliDate(
        jy,
        jm,
        jd
    ) {

        // Make sure all values are integers.
        if (
            !Number.isInteger(jy) ||
            !Number.isInteger(jm) ||
            !Number.isInteger(jd)
        ) {

            return false;

        }


        // Make sure month is between 1 and 12.
        if (
            jm < 1 ||
            jm > 12
        ) {

            return false;

        }


        // Make sure day is valid for the month.
        return (
            jd >= 1 &&
            jd <=
                jalaaliMonthLength(
                    jy,
                    jm
                )
        );

    }


    // ==================================================
    // PERSIAN -> ENGLISH DIGITS
    // ==================================================

    // Convert Persian digits to English digits.
    function persianToEnglishDigits(
        value
    ) {

        if (
            value === null ||
            value === undefined
        ) {

            return value;

        }


        return String(value).replace(
            /[۰-۹]/g,
            function (digit) {

                return String(
                    "۰۱۲۳۴۵۶۷۸۹".indexOf(
                        digit
                    )
                );

            }
        );

    }


    // ==================================================
    // ENGLISH -> PERSIAN DIGITS
    // ==================================================

    // Convert English digits to Persian digits.
    function toPersianDigits(
        value
    ) {

        if (
            value === null ||
            value === undefined
        ) {

            return value;

        }


        return String(value).replace(
            /\d/g,
            function (digit) {

                return "۰۱۲۳۴۵۶۷۸۹"[digit];

            }
        );

    }


    // ==================================================
    // PARSE DATE FROM INPUT
    // ==================================================

    // Read and parse a Jalali date from an input.

    function parseDateFromInput(value) {

        if (!value) {
            return null;
        }

        // Convert Persian digits to English.
        let englishValue =
            persianToEnglishDigits(value);

        // Support both "/" and "-" separators.
        englishValue =
            englishValue.replace(/-/g, "/");

        // Remove extra spaces.
        englishValue =
            englishValue.trim();

        // Split date.
        const parts =
            englishValue.split("/");

        if (parts.length !== 3) {
            return null;
        }

        const year =
            Number(parts[0]);

        const month =
            Number(parts[1]);

        const day =
            Number(parts[2]);

        if (
            !Number.isInteger(year) ||
            !Number.isInteger(month) ||
            !Number.isInteger(day)
        ) {
            return null;
        }

        if (
            !isValidJalaaliDate(
                year,
                month,
                day
            )
        ) {
            return null;
        }

        return {
            year: year,
            month: month,
            day: day
        };
    }
    // ==================================================
    // NUMBER VALIDATION
    // ==================================================

    // Check whether a value represents a valid number.
    function isValidNumber(
        value
    ) {

        if (
            value === null ||
            value === undefined ||
            String(value).trim() === ""
        ) {

            return false;

        }


        // Convert Persian digits first.
        const englishValue =
            persianToEnglishDigits(
                value
            );


        // Check numeric validity.
        return !Number.isNaN(
            Number(englishValue)
        );

    }


    // ==================================================
    // PAD NUMBER
    // ==================================================

    // Add a leading zero to single-digit numbers.
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

    // Render weekday names.
    renderWeekdays();

});