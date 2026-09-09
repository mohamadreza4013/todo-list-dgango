
// ==================================================
// TODO CARD
// ==================================================


// ==================================================
// FORMAT DATE
// ==================================================

function formatDate(dateString) {

    if (!dateString) {
        return '';
    }

    const date = new Date(dateString);

    // Return the original string if the date is invalid
    if (isNaN(date.getTime())) {
        return dateString;
    }

    const options = {
        month: 'short',
        day: '2-digit',
        year: 'numeric'
    };

    return date.toLocaleDateString('fa-IR', options);
}


// ==================================================
// CREATE TODO CARD
// ==================================================

function createTodoCard(todo) {

    return `
        <div
            class="todo-card"
            data-todo-id="${todo.todo_id}"
        >

            <!-- Complete -->

            <form
                method="POST"
                action="/todo/${todo.todo_id}/toggle/"
                class="complete-form toggle-complete-form"
            >

                <input
                    type="hidden"
                    name="csrfmiddlewaretoken"
                    value="${getCSRFToken()}"
                >

                <button
                    type="submit"
                    class="complete-button ${
                        todo.completed ? 'completed' : ''
                    }"
                    title="${
                        todo.completed
                            ? 'علامت‌گذاری به‌عنوان انجام‌نشده'
                            : 'علامت‌گذاری به‌عنوان انجام‌شده'
                    }"
                >
                    ${
                        todo.completed
                            ? '✓'
                            : ''
                    }
                </button>

            </form>


            <!-- Todo Content -->

            <div class="todo-content">

                <div class="todo-title">
                    ${escapeHTML(todo.title)}
                </div>

                ${
                    todo.description
                        ? `
                            <div class="todo-description">
                                ${escapeHTML(todo.description)}
                            </div>
                        `
                        : ""
                }


                <!-- Category -->

                ${
                    todo.category
                        ? `
                            <div class="todo-category">

                                ${
                                    todo.category === "public"
                                        ? `
                                            <span class="category-badge public">
                                                عمومی
                                            </span>
                                        `
                                        : `
                                            <span class="category-badge personal">
                                                شخصی
                                            </span>
                                        `
                                }

                            </div>
                        `
                        : ""
                }

            </div>


            <!-- Todo Actions -->

            <div class="todo-actions">


                <!-- Status -->

                <span
                    class="status ${
                        todo.completed
                            ? 'completed'
                            : ''
                    }"
                >
                    ${
                        todo.completed
                            ? 'انجام‌شده'
                            : 'در انتظار'
                    }
                </span>


                <!-- Important -->

                <form
                    method="POST"
                    action="/todo/${todo.todo_id}/toggle-important/"
                    class="toggle-important-form"
                >

                    <input
                        type="hidden"
                        name="csrfmiddlewaretoken"
                        value="${getCSRFToken()}"
                    >

                    <button
                        type="submit"
                        class="important-button ${
                            todo.important
                                ? 'important'
                                : ''
                        }"
                        title="${
                            todo.important
                                ? 'حذف از وظایف مهم'
                                : 'افزودن به وظایف مهم'
                        }"
                    >
                        ★
                    </button>

                </form>


                <!-- Edit -->

                <a
                    href="/todo/${todo.todo_id}/edit/"
                    class="edit-button"
                >
                    ✎ ویرایش
                </a>


                <!-- Delete -->

                <form
                    method="POST"
                    action="/todo/${todo.todo_id}/delete/"
                    class="delete-form"
                >

                    <input
                        type="hidden"
                        name="csrfmiddlewaretoken"
                        value="${getCSRFToken()}"
                    >

                    <button
                        type="submit"
                        class="delete-button"
                    >
                        🗑 حذف
                    </button>

                </form>


                <!-- Task Dates -->

                <div class="todo-dates">


                    <!-- Task creation date -->

                    <span class="todo-date">
                        ایجاد:
                       ${toPersianDigits(todo.created_at)}
                    </span>


                    <!-- Task start date -->

                    ${
                        todo.start_date
                            ? `
                                <span class="todo-date">
                                    شروع:
                                    ${todo.start_date}
                                </span>
                            `
                            : ""
                    }


                    <!-- Task end date -->

                    ${
                        todo.end_date
                            ? `
                                <span class="todo-date">
                                    اتمام:
                                    ${todo.end_date}
                                </span>
                            `
                            : ""
                    }


                    <!-- Task deadline -->

                    ${
                        todo.deadline
                            ? `
                                <span class="todo-date">
                                    مهلت:
                                    ${todo.deadline}
                                </span>
                            `
                            : ""
                    }

                </div>

            </div>

        </div>
    `;
}


// ==================================================
// TODO EVENTS
// ==================================================

document.addEventListener(
    "submit",
    async function(event) {


        // ==================================================
        // COMPLETE TODO
        // ==================================================

        const completeForm =
            event.target.closest(
                ".toggle-complete-form"
            );


        if (completeForm) {

            event.preventDefault();


            const card =
                completeForm.closest(
                    ".todo-card"
                );


            const button =
                card.querySelector(
                    ".complete-button"
                );


            const status =
                card.querySelector(
                    ".status"
                );


            try {

                const response =
                    await fetch(
                        completeForm.action,
                        {
                            method: "POST",

                            headers: {
                                "X-CSRFToken":
                                    getCSRFToken(),

                                "X-Requested-With":
                                    "XMLHttpRequest"
                            }
                        }
                    );


                if (!response.ok) {

                    throw new Error(
                        `HTTP error: ${response.status}`
                    );

                }


                const data =
                    await response.json();


                if (data.success) {


                    // ==================================================
                    // UPDATE COMPLETE BUTTON
                    // ==================================================

                    button.classList.toggle(
                        "completed",
                        data.completed
                    );


                    if (data.completed) {

                        button.textContent = "✓";

                        button.title =
                            "علامت‌گذاری به‌عنوان انجام‌نشده";

                        status.textContent =
                            "انجام‌شده";

                        status.classList.add(
                            "completed"
                        );

                    }

                    else {

                        button.textContent = "";

                        button.title =
                            "علامت‌گذاری به‌عنوان انجام‌شده";

                        status.textContent =
                            "در انتظار";

                        status.classList.remove(
                            "completed"
                        );

                    }


                    // ==================================================
                    // UPDATE END DATE
                    // ==================================================

                    const datesContainer =
                        card.querySelector(
                            ".todo-dates"
                        );


                    // Remove the previous completion date
                    const oldEndDate =
                        datesContainer.querySelector(
                            ".end-date"
                        );


                    if (oldEndDate) {

                        oldEndDate.remove();

                    }


                    // Add the completion date if the task is completed
                    if (
                        data.completed &&
                        data.end_date
                    ) {

                        const endDateElement =
                            document.createElement(
                                "span"
                            );

                        endDateElement.className =
                            "todo-date end-date";

                        endDateElement.textContent =
                            `اتمام: ${data.end_date}`;

                        datesContainer.appendChild(
                            endDateElement
                        );

                    }


                    // ==================================================
                    // UPDATE DASHBOARD STATISTICS
                    // ==================================================

                    if (
                        typeof updateStats ===
                        "function"
                    ) {

                        updateStats();

                    }


                    // ==================================================
                    // UPDATE IMPORTANT PAGE STATISTICS
                    // ==================================================

                    if (
                        window.location.pathname ===
                        "/important/"
                    ) {

                        updateImportantStats();

                    }

                }

            }

            catch (error) {

                console.error(
                    "Error toggling todo:",
                    error
                );

            }


            return;
        }



        // ==================================================
        // TOGGLE IMPORTANT
        // ==================================================

        const importantForm =
            event.target.closest(
                ".toggle-important-form"
            );


        if (importantForm) {

            event.preventDefault();


            const card =
                importantForm.closest(
                    ".todo-card"
                );


            const button =
                importantForm.querySelector(
                    ".important-button"
                );


            try {

                const response =
                    await fetch(
                        importantForm.action,
                        {
                            method: "POST",

                            headers: {
                                "X-CSRFToken":
                                    getCSRFToken(),

                                "X-Requested-With":
                                    "XMLHttpRequest"
                            }
                        }
                    );


                if (!response.ok) {

                    throw new Error(
                        `HTTP error: ${response.status}`
                    );

                }


                const data =
                    await response.json();


                if (data.success) {

                    button.classList.toggle(
                        "important",
                        data.important
                    );


                    button.title =
                        data.important
                            ? "حذف از وظایف مهم"
                            : "افزودن به وظایف مهم";


                    /*
                        If we are on the Important page
                        and the Task is no longer important,
                        remove the card.
                    */

                    if (
                        !data.important &&
                        window.location.pathname ===
                            "/important/"
                    ) {

                        card.remove();

                        updateImportantStats();

                        showImportantEmptyState();

                    }

                }

            }

            catch (error) {

                console.error(
                    "Error toggling important:",
                    error
                );

            }


            return;
        }



        // ==================================================
        // DELETE TODO
        // ==================================================

        const deleteForm =
            event.target.closest(
                ".delete-form"
            );


        if (deleteForm) {

            event.preventDefault();


            const confirmed =
                confirm(
                    "آیا از حذف این وظیفه مطمئن هستید؟"
                );


            if (!confirmed) {

                return;

            }


            const card =
                deleteForm.closest(
                    ".todo-card"
                );


            try {

                const response =
                    await fetch(
                        deleteForm.action,
                        {
                            method: "POST",

                            headers: {
                                "X-CSRFToken":
                                    getCSRFToken(),

                                "X-Requested-With":
                                    "XMLHttpRequest"
                            }
                        }
                    );


                if (!response.ok) {

                    throw new Error(
                        `HTTP error: ${response.status}`
                    );

                }


                const data =
                    await response.json();


                if (data.success) {

                    card.remove();


                    // Dashboard statistics

                    if (
                        typeof updateStats ===
                        "function"
                    ) {

                        updateStats();

                    }


                    // Important page statistics

                    if (
                        window.location.pathname ===
                        "/important/"
                    ) {

                        updateImportantStats();

                        showImportantEmptyState();

                    }

                }

            }

            catch (error) {

                console.error(
                    "Error deleting todo:",
                    error
                );

            }


            return;
        }

    }
);


// ==================================================
// IMPORTANT PAGE STATISTICS
// ==================================================

function updateImportantStats() {

    const cards =
        document.querySelectorAll(
            ".todo-card"
        );


    let completed = 0;


    cards.forEach(card => {

        const button =
            card.querySelector(
                ".complete-button"
            );


        if (
            button &&
            button.classList.contains(
                "completed"
            )
        ) {

            completed++;

        }

    });


    const total =
        cards.length;


    const remaining =
        total - completed;


    const statNumbers =
        document.querySelectorAll(
            ".stat-number"
        );


    if (statNumbers.length >= 3) {

        // Important Tasks

        statNumbers[0].textContent =
            total;


        // Completed

        statNumbers[1].textContent =
            completed;


        // Remaining

        statNumbers[2].textContent =
            remaining;

    }

}


// ==================================================
// IMPORTANT PAGE EMPTY STATE
// ==================================================

function showImportantEmptyState() {

    const todoList =
        document.querySelector(
            ".todo-list"
        );


    if (!todoList) {

        return;

    }


    const cards =
        todoList.querySelectorAll(
            ".todo-card"
        );


    if (cards.length === 0) {

        todoList.innerHTML = `
            <div class="empty-state">

                <div class="empty-icon">
                    ★
                </div>

                <h3>
                    وظیفه مهمی وجود ندارد
                </h3>

                <p>
                    یک وظیفه را مهم کنید تا اینجا نمایش داده شود.
                </p>

            </div>
        `;

    }

}


// ==================================================
// CSRF TOKEN
// ==================================================

function getCSRFToken() {

    const token =
        document.querySelector(
            "[name=csrfmiddlewaretoken]"
        );


    return token
        ? token.value
        : "";

}


// ==================================================
// ESCAPE HTML
// ==================================================

function escapeHTML(text) {

    const div =
        document.createElement(
            "div"
        );


    div.textContent =
        text;


    return div.innerHTML;

}