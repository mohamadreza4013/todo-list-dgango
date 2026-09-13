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
                                <span class="todo-date end-date">
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
// REFRESH CURRENT PAGE
// ==================================================

async function refreshCurrentPage() {

    /*
     * home.js provides loadPage() for AJAX pagination.
     * Use it when available.
     *
     * On pages where loadPage() is not available,
     * reload the current page normally.
     */

    if (typeof loadPage === "function") {

        await loadPage(window.location.href);

    } else {

        window.location.reload();

    }
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

                    /*
                     * Reload the current server-side page.
                     *
                     * This keeps:
                     * - task list
                     * - statistics
                     * - pagination
                     *
                     * synchronized with Django.
                     */

                    await refreshCurrentPage();

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

                    /*
                     * Refresh the page so that:
                     *
                     * - Important page membership
                     * - Dashboard task list
                     * - Statistics
                     * - Pagination
                     *
                     * are all updated from the database.
                     */

                    await refreshCurrentPage();

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

                    /*
                     * Refresh the current page instead of
                     * manually removing the card.
                     *
                     * This allows Django to recalculate:
                     *
                     * - total tasks
                     * - completed tasks
                     * - remaining tasks
                     * - pagination
                     */

                    await refreshCurrentPage();

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