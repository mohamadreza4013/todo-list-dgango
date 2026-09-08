document.addEventListener("DOMContentLoaded", function () {

    const tasksDataElement =
        document.getElementById("tasks-data");

    const tasksByDay =
        tasksDataElement
            ? JSON.parse(tasksDataElement.textContent)
            : {};


    const dayElements =
        document.querySelectorAll(".calendar-day[data-day]");


    const selectedDayTitle =
        document.getElementById(
            "selected-day-title"
        );


    const selectedDayTasks =
        document.getElementById(
            "selected-day-tasks"
        );


    dayElements.forEach(function (dayElement) {

        dayElement.addEventListener(
            "click",
            function () {

                const day =
                    this.dataset.day;


                selectDay(day);

            }
        );

    });


    function selectDay(day) {

        selectedDayTitle.textContent =
            `${day} ${getCurrentMonthName()} ${currentYear}`;


        const tasks =
            tasksByDay[day] || [];


        if (tasks.length === 0) {

            selectedDayTasks.innerHTML = `
                <div class="empty-message">
                    برای این روز کاری ثبت نشده است.
                </div>
            `;

            return;

        }


        selectedDayTasks.innerHTML =
            tasks
                .map(function (task) {

                    return createTaskCard(task);

                })
                .join("");

    }


    function createTaskCard(task) {

        const status =
            task.completed
                ? "تکمیل شده"
                : "در انتظار";


        const type =
            task.type === "start"
                ? "شروع"
                : "مهلت";


        return `
            <div
                class="selected-task
                    ${task.completed ? "completed" : ""}
                    ${task.important ? "important" : ""}
                "
            >

                <div class="selected-task-main">

                    <div class="selected-task-title">

                        ${escapeHTML(task.title)}

                    </div>


                    ${
                        task.description
                            ? `
                                <div class="selected-task-description">
                                    ${escapeHTML(task.description)}
                                </div>
                            `
                            : ""
                    }

                </div>


                <div class="selected-task-meta">

                    <span class="task-type">
                        ${type}
                    </span>

                    <span class="task-status">
                        ${status}
                    </span>

                    ${
                        task.important
                            ? `<span class="task-important">★</span>`
                            : ""
                    }

                </div>

            </div>
        `;

    }


    function escapeHTML(value) {

        const div =
            document.createElement("div");

        div.textContent =
            value ?? "";

        return div.innerHTML;

    }


    function getCurrentMonthName() {

        const months = [
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

        return months[currentMonth - 1];

    }

});