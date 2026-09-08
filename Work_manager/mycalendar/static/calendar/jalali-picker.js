(function () {

    "use strict";


    function initializeJalaliPicker() {

        if (typeof $ === "undefined") {

            console.error(
                "jQuery is not loaded."
            );

            return;

        }


        if (
            typeof $.fn.persianDatepicker !==
            "function"
        ) {

            console.error(
                "Persian Datepicker is not loaded."
            );

            return;

        }


        $(".jalali-date-input").each(
            function () {

                const input = $(this);


                // جلوگیری از initialize شدن چندباره
                if (
                    input.data(
                        "jalali-initialized"
                    )
                ) {
                    return;
                }


                input.data(
                    "jalali-initialized",
                    true
                );


                input.persianDatepicker({

                    formatDate:
                        "YYYY/MM/DD",

                    autoClose:
                        true,

                    initialValue:
                        false,

                    calendarType:
                        "persian",

                    responsive:
                        true,

                    observer:
                        true

                });

            }
        );

    }


    // وقتی DOM آماده شد
    $(document).ready(function () {

        initializeJalaliPicker();

    });


    // اجازه استفاده در فایل‌های دیگر
    window.initializeJalaliPicker =
        initializeJalaliPicker;


})();