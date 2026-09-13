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

    // Return the original string if the date is invalid.
    if (isNaN(date.getTime())) {
        return dateString;
    }

    const options = {
        month: 'short',
        day: '2-digit',
        year: 'numeric'
    };

    return date.toLocaleDateString(
        'fa-IR',
        options
    );
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

            <!-- ==================================================
                 COMPLETE
            ================================================== -->

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
                        todo.completed
                            ? 'completed'
                            : ''
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



            <!-- ==================================================
                 TODO CONTENT
            ================================================== -->

            <div class="todo-content">


                <!-- ==================================================
                     TASK TITLE
                ================================================== -->

                <div class="todo-title">

                    ${escapeHTML(
                        todo.title
                    )}

                </div>


                <!-- ==================================================
                     TASK DESCRIPTION
                ================================================== -->

                ${
                    todo.description
                        ? `
                            <div class="todo-description">

                                ${escapeHTML(
                                    todo.description
                                )}

                            </div>
                        `
                        : ""
                }



                <!-- ==================================================
                     TASK META
                ================================================== -->

                <div class="todo-meta">


                    <!-- ==================================================
                         TASK CATEGORY
                    ================================================== -->

                    ${
                        todo.category
                            ? `
                                <span
                                    class="category-badge ${
                                        todo.category === "public"
                                            ? "public"
                                            : "personal"
                                    }"
                                >

                                    ${
                                        todo.category === "public"
                                            ? "عمومی"
                                            : "شخصی"
                                    }

                                </span>
                            `
                            : ""
                    }


                    <!-- ==================================================
                         TASK TOPIC
                    ================================================== -->

                    ${
                        todo.topic
                            ? `
                                <span class="topic-badge">

                                    <span class="topic-icon">
                                        #
                                    </span>

                                    <span class="topic-name">

                                        ${escapeHTML(
                                            todo.topic.name
                                        )}

                                    </span>

                                </span>
                            `
                            : ""
                    }

                </div>

            </div>



            <!-- ==================================================
                 TODO ACTIONS
            ================================================== -->

            <div class="todo-actions">


                <!-- ==================================================
                     STATUS
                ================================================== -->

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



                <!-- ==================================================
                     IMPORTANT
                ================================================== -->

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



                <!-- ==================================================
                     EDIT
                ================================================== -->

                <a
                    href="/todo/${todo.todo_id}/edit/"
                    class="edit-button"
                >

                    ✎ ویرایش

                </a>



                <!-- ==================================================
                     DELETE
                ================================================== -->

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



                <!-- ==================================================
                     TASK DATES
                ================================================== -->

                <div class="todo-dates">


                    <!-- ==================================================
                         CREATION DATE
                    ================================================== -->

                    <span class="todo-date">

                        ایجاد:
                        ${toPersianDigits(
                            todo.created_at
                        )}

                    </span>


                    <!-- ==================================================
                         START DATE
                    ================================================== -->

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


                    <!-- ==================================================
                         COMPLETION DATE
                    ================================================== -->

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


                    <!-- ==================================================
                         DEADLINE
                    ================================================== -->

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
     * Use the AJAX page loader when it exists.
     *
     * This keeps pagination, statistics and the
     * current URL synchronized with Django.
     */

    if (
        typeof loadPage === "function"
    ) {

        await loadPage(
            window.location.href
        );

        return;

    }


    /*
     * Fallback for pages that do not use
     * the AJAX page loader.
     */

    window.location.reload();

}


// ==================================================
// TODO EVENTS
// ==================================================

document.addEventListener(
    "submit",
    async function (event) {


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


                if (!data.success) {

                    throw new Error(
                        data.error ||
                        "خطا در تغییر وضعیت وظیفه."
                    );

                }


                /*
                 * Refresh the current page so Django
                 * recalculates the task list,
                 * statistics and pagination.
                 */

                await refreshCurrentPage();

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


                if (!data.success) {

                    throw new Error(
                        data.error ||
                        "خطا در تغییر وضعیت مهم."
                    );

                }


                /*
                 * Refresh the current page so that
                 * Important membership and pagination
                 * stay synchronized with Django.
                 */

                await refreshCurrentPage();

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


                if (!data.success) {

                    throw new Error(
                        data.error ||
                        "خطا در حذف وظیفه."
                    );

                }


                /*
                 * Refresh instead of manually removing
                 * the card.
                 *
                 * Django will recalculate:
                 * - task list
                 * - statistics
                 * - pagination
                 */

                await refreshCurrentPage();

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

    if (
        text === null ||
        text === undefined
    ) {

        return "";

    }


    const div =
        document.createElement(
            "div"
        );


    div.textContent =
        String(text);


    return div.innerHTML;

}


// ==================================================
// PERSIAN DIGITS
// ==================================================

function toPersianDigits(value) {

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