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
    // Stop execution if any required element is missing.
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

    // Set the initially displayed year to the current Jalali year.
    let currentYear =
        today.year;

    // Set the initially displayed month to the current Jalali month.
    let currentMonth =
        today.month;

    // Store the input element currently using the calendar.
    let targetInput =
        null;


    // ==================================================
    // PUBLIC API
    // ==================================================

    // Expose public functions through the global MyCalendar object.
    // Other JavaScript files can use these functions.
    window.MyCalendar = {

        // Open the calendar for a specific input.
        open: function (input) {
            openCalendar(input);
        },

        // Close the currently opened calendar.
        close: function () {
            closeCalendar();
        }

    };


    // ==================================================
    // OPEN CALENDAR
    // ==================================================

    // Open the calendar picker for the given input element.
    function openCalendar(input) {

        // Do nothing if no input element was provided.
        if (!input) {
            return;
        }


        // Store the input that will receive the selected date.
        targetInput = input;


        // If the input already contains a date,
        // open the calendar on that date's month.
        const parts =
            input.value.trim().split("/");


        // Check whether the input contains
        // three valid numeric date components.
        if (
            parts.length === 3 &&
            isValidNumber(parts[0]) &&
            isValidNumber(parts[1]) &&
            isValidNumber(parts[2])
        ) {

            // Convert the year string to a number.
            const year =
                Number(parts[0]);

            // Convert the month string to a number.
            const month =
                Number(parts[1]);

            // Convert the day string to a number.
            const day =
                Number(parts[2]);


            // Check whether the complete Jalali date is valid.
            if (
                isValidJalaaliDate(
                    year,
                    month,
                    day
                )
            ) {

                // Display the selected date's year.
                currentYear =
                    year;

                // Display the selected date's month.
                currentMonth =
                    month;

            }

        }
        else {

            // If no valid date exists in the input,
            // open the current Jalali year.
            currentYear =
                today.year;

            // Open the current Jalali month.
            currentMonth =
                today.month;

        }


        // Render the calendar using the selected/current month.
        renderCalendar();


        // Make the modal visible.
        modal.hidden = false;


        // Add a class to the body while the calendar is open.
        document.body.classList.add(
            "calendar-open"
        );

    }


    // ==================================================
    // CLOSE CALENDAR
    // ==================================================

    // Close the calendar picker.
    function closeCalendar() {

        // Hide the calendar modal.
        modal.hidden = true;

        // Remove the reference to the selected input.
        targetInput = null;

        // Remove the calendar-open class from the body.
        document.body.classList.remove(
            "calendar-open"
        );

    }


    // ==================================================
    // WEEKDAYS
    // ==================================================

    // Render the names of the weekdays.
    function renderWeekdays() {

        // Clear the existing weekday elements.
        weekdaysElement.innerHTML = "";


        // Create one element for each weekday.
        WEEKDAYS.forEach(
            function (day) {

                // Create a new div for the weekday.
                const element =
                    document.createElement("div");


                // Assign the weekday CSS class.
                element.className =
                    "weekday";


                // Set the displayed weekday name.
                element.textContent =
                    day;


                // Add the weekday element to the container.
                weekdaysElement.appendChild(
                    element
                );

            }
        );

    }


    // ==================================================
    // CALENDAR
    // ==================================================

    // Generate the calendar days for the current month.
    function renderCalendar() {

        // Display the current Jalali month and year.
        monthTitle.textContent =
            `${MONTH_NAMES[currentMonth - 1]} ${currentYear}`;


        // Clear the previous calendar days.
        calendarGrid.innerHTML =
            "";


        // Calculate the weekday on which the month starts.
        const firstWeekday =
            getFirstWeekday(
                currentYear,
                currentMonth
            );


        // Calculate the number of days in the current month.
        const daysInMonth =
            jalaaliMonthLength(
                currentYear,
                currentMonth
            );


        // --------------------------------------------------
        // EMPTY CELLS
        // --------------------------------------------------

        // Add empty cells before the first day of the month.
        // These cells align the first day with the correct weekday.
        for (
            let i = 0;
            i < firstWeekday;
            i++
        ) {

            // Create an empty calendar cell.
            const emptyCell =
                document.createElement("div");


            // Assign the calendar-day and empty CSS classes.
            emptyCell.className =
                "calendar-day empty";


            // Add the empty cell to the calendar grid.
            calendarGrid.appendChild(
                emptyCell
            );

        }


        // --------------------------------------------------
        // DAYS
        // --------------------------------------------------

        // Create all days of the current Jalali month.
        for (
            let day = 1;
            day <= daysInMonth;
            day++
        ) {

            // Create a button for the day.
            const button =
                document.createElement("button");


            // Prevent the button from submitting a form.
            button.type =
                "button";


            // Assign the calendar-day CSS class.
            button.className =
                "calendar-day";


            // Display the day number.
            button.textContent =
                day;


            // Today
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


            // Selected value
            // Highlight the date currently stored in the input.
            if (
                targetInput &&
                targetInput.value
            ) {

                // Split the stored date into year, month, and day.
                const selectedParts =
                    targetInput.value.split("/");


                // Check whether the current day matches
                // the selected date.
                if (
                    selectedParts.length === 3 &&
                    Number(selectedParts[0]) === currentYear &&
                    Number(selectedParts[1]) === currentMonth &&
                    Number(selectedParts[2]) === day
                ) {

                    // Add the selected CSS class.
                    button.classList.add(
                        "selected"
                    );

                }

            }


            // Add a click event to select this date.
            button.addEventListener(
                "click",
                function () {

                    // Send the selected year, month, and day
                    // to the date selection function.
                    selectDate(
                        currentYear,
                        currentMonth,
                        day
                    );

                }
            );


            // Add the day button to the calendar grid.
            calendarGrid.appendChild(
                button
            );

        }

    }


    // ==================================================
    // SELECT DATE
    // ==================================================

    // Store the selected Jalali date in the target input.
    function selectDate(
        year,
        month,
        day
    ) {

        // Do nothing if there is no target input.
        if (!targetInput) {
            return;
        }


        // Build the date string in YYYY/MM/DD format.
        const value =
            `${year}/${pad(month)}/${pad(day)}`;


        // Put the selected date into the input field.
        targetInput.value =
            value;


        // Notify other JavaScript code that the input changed.
        targetInput.dispatchEvent(
            new Event(
                "change",
                {
                    bubbles: true
                }
            )
        );


        // Close the calendar after selecting a date.
        closeCalendar();

    }


    // ==================================================
    // PREVIOUS MONTH
    // ==================================================

    // Handle the previous-month button.
    previousMonthButton.addEventListener(
        "click",
        function () {

            // Move one month backward.
            currentMonth--;


            // If the current month becomes smaller than 1,
            // move to Esfand of the previous year.
            if (
                currentMonth < 1
            ) {

                currentMonth =
                    12;

                currentYear--;

            }


            // Re-render the calendar.
            renderCalendar();

        }
    );


    // ==================================================
    // NEXT MONTH
    // ==================================================

    // Handle the next-month button.
    nextMonthButton.addEventListener(
        "click",
        function () {

            // Move one month forward.
            currentMonth++;


            // If the current month becomes larger than 12,
            // move to Farvardin of the next year.
            if (
                currentMonth > 12
            ) {

                currentMonth =
                    1;

                currentYear++;

            }


            // Re-render the calendar.
            renderCalendar();

        }
    );


    // ==================================================
    // CLOSE
    // ==================================================

    // Add a click handler to the close button if it exists.
    if (closeButton) {

        closeButton.addEventListener(
            "click",
            closeCalendar
        );

    }


    // Close the calendar when the overlay is clicked.
    if (overlay) {

        overlay.addEventListener(
            "click",
            closeCalendar
        );

    }


    // ==================================================
    // ESC KEY
    // ==================================================

    // Listen for keyboard events.
    document.addEventListener(
        "keydown",
        function (event) {

            // Close the calendar when Escape is pressed
            // while the modal is visible.
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

    // Find all inputs that use the Jalali date picker.
    document
        .querySelectorAll(
            ".jalali-date-input"
        )
        .forEach(
            function (input) {

                // Open the calendar when the input is clicked.
                input.addEventListener(
                    "click",
                    function () {

                        // Open the calendar for this input.
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

    // Get today's date using the browser's Persian calendar.
    function getTodayJalali() {

        // Create a formatter that uses the Persian calendar.
        const formatter =
            new Intl.DateTimeFormat(
                "en-US-u-ca-persian",
                {
                    year: "numeric",
                    month: "numeric",
                    day: "numeric"
                }
            );


        // Convert the current Gregorian date
        // into Persian calendar date parts.
        const parts =
            formatter.formatToParts(
                new Date()
            );


        // Return the extracted Jalali year, month, and day.
        return {

            // Extract the Jalali year.
            year: Number(
                parts.find(
                    part =>
                        part.type === "year"
                ).value
            ),

            // Extract the Jalali month.
            month: Number(
                parts.find(
                    part =>
                        part.type === "month"
                ).value
            ),

            // Extract the Jalali day.
            day: Number(
                parts.find(
                    part =>
                        part.type === "day"
                ).value
            )

        };

    }


    // ==================================================
    // JALAALI CALENDAR BREAKS
    // ==================================================

    // Define the year break points used by the
    // Borkowski Jalali calendar calculation.
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

// Perform integer division by truncating toward zero.
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

    // Calculate the mathematical modulo value.
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
    // JALAALI CALENDAR CALCULATION
    // ==================================================

    // Calculate important Jalali calendar information
    // for a given Jalali year.
    function jalCal(
        jy,
        withoutLeap
    ) {

        // Use the predefined Jalali year break points.
        const breaks =
            JALAALI_BREAKS;

        // Get the number of break points.
        const bl =
            breaks.length;

        // Convert the Jalali year to an approximate Gregorian year.
        let gy =
            jy + 621;

        // Initial number of Jalali leap years.
        let leapJ =
            -14;

        // Start from the first break point.
        let jp =
            breaks[0];

        // Variables used during calendar calculations.
        let jm;

        let jump;

        let leap;

        let leapG;

        let march;

        let n;


        // Validate the supported Jalali year range.
        if (
            jy < breaks[0] ||
            jy >= breaks[bl - 1]
        ) {

            throw new Error(
                "Jalaali year is out of supported range."
            );

        }


        // Find the calendar cycle containing the requested year.
        for (
            let i = 1;
            i < bl;
            i++
        ) {

            // Get the current break point.
            jm =
                breaks[i];

            // Calculate the distance between break points.
            jump =
                jm - jp;


            // Stop when the requested year
            // is before the current break point.
            if (
                jy < jm
            ) {

                break;

            }


            // Add the leap-year information
            // for the completed cycle.
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


            // Move to the current break point.
            jp =
                jm;

        }


        // Calculate the number of years
        // since the beginning of the current cycle.
        n =
            jy - jp;


        // Calculate additional leap years
        // inside the current cycle.
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


        // Handle the special leap-year case
        // defined by the Borkowski algorithm.
        if (
            mod(
                jump,
                33
            ) === 4 &&
            jump - n === 4
        ) {

            leapJ++;

        }


        // Calculate the number of Gregorian leap years.
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


        // Calculate the Gregorian day of March
        // on which Farvardin 1 begins.
        march =
            20 +
            leapJ -
            leapG;


        // Return only the Gregorian year and March day
        // when leap-year information is not required.
        if (
            withoutLeap
        ) {

            return {
                gy: gy,
                march: march
            };

        }


        // Calculate the position of the leap year.
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


        // Convert -1 to 4 for the leap-year calculation.
        if (
            leap === -1
        ) {

            leap =
                4;

        }


        // Return the complete calendar calculation.
        return {
            leap: leap,
            gy: gy,
            march: march
        };

    }


    // ==================================================
    // JALAALI -> JULIAN DAY
    // ==================================================

    // Convert a Jalali date into a Julian Day Number.
    function j2d(
        jy,
        jm,
        jd
    ) {

        // Calculate the Gregorian year and
        // Farvardin 1 date for the Jalali year.
        const calendar =
            jalCal(
                jy,
                true
            );


        // Calculate the Julian Day Number.
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

    // Convert a Gregorian date into a Julian Day Number.
    function g2d(
        gy,
        gm,
        gd
    ) {

        // Calculate the Julian Day Number
        // using the Gregorian calendar formula.
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


        // Apply the Gregorian century correction.
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


        // Return the calculated Julian Day Number.
        return d;

    }


    // ==================================================
    // JULIAN DAY -> GREGORIAN
    // ==================================================

    // Convert a Julian Day Number back into
    // a Gregorian year, month, and day.
    function d2g(
        jdn
    ) {

        // Convert the Julian Day Number
        // into the intermediate value used by the algorithm.
        let j =
            4 * jdn +
            139361631;


        // Apply the Gregorian calendar correction.
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


        // Calculate the intermediate month/day value.
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


        // Calculate the Gregorian day.
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


        // Calculate the Gregorian month.
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


        // Calculate the Gregorian year.
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


        // Return the Gregorian date.
        return {

            gy: gy,

            gm: gm,

            gd: gd

        };

    }


    // ==================================================
    // JALAALI -> GREGORIAN
    // ==================================================

    // Convert a Jalali date directly into
    // a Gregorian date object.
    function jalaaliToGregorian(
        jy,
        jm,
        jd
    ) {

        // First convert the Jalali date
        // to a Julian Day Number,
        // then convert that value to Gregorian.
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

    // Calculate the weekday on which a Jalali month starts.
    function getFirstWeekday(
        jy,
        jm
    ) {

        // Convert the first day of the Jalali month
        // into a Gregorian date.
        const gregorian =
            jalaaliToGregorian(
                jy,
                jm,
                1
            );


        // Create a UTC JavaScript Date object
        // from the converted Gregorian date.
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

        The formula below shifts the JavaScript
        weekday numbering so Saturday becomes 0.
        */

        return (
            date.getUTCDay() + 1
        ) % 7;

    }


    // ==================================================
    // LEAP YEAR
    // ==================================================

    // Determine whether the given Jalali year is a leap year.
    function isLeapJalaaliYear(
        jy
    ) {

        // Calculate the calendar information
        // for the requested Jalali year.
        const calendar =
            jalCal(
                jy,
                false
            );


        // A leap value of zero means
        // the Jalali year contains 30 days in Esfand.
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

        // The first six Jalali months have 31 days.
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


        // Esfand has either 29 or 30 days,
        // depending on whether the year is a leap year.
        return isLeapJalaaliYear(
            jy
        )
            ? 30
            : 29;

    }


    // ==================================================
    // VALIDATION
    // ==================================================

    // Validate a complete Jalali date.
    function isValidJalaaliDate(
        jy,
        jm,
        jd
    ) {

        // Make sure year, month, and day are integers.
        if (
            !Number.isInteger(jy) ||
            !Number.isInteger(jm) ||
            !Number.isInteger(jd)
        ) {

            return false;

        }


        // Make sure the month is between 1 and 12.
        if (
            jm < 1 ||
            jm > 12
        ) {

            return false;

        }


        // Make sure the day is inside the valid
        // range of the specified Jalali month.
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
    // NUMBER VALIDATION
    // ==================================================

    // Check whether a value is a valid numeric value.
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

    // Render the weekday names when the calendar is initialized.
    renderWeekdays();

});