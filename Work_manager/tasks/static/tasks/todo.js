// ==================================================
// TODO CARD
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
                    class="complete-button"
                    title="Mark as completed"
                ></button>

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

            </div>


            <!-- Todo Actions -->
            <div class="todo-actions">

                <span class="status">
                    Pending
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
                        class="important-button"
                        title="Mark as important"
                    >
                        ★
                    </button>

                </form>


                <!-- Edit -->
                <a
                    href="/todo/${todo.todo_id}/edit/"
                    class="edit-button"
                >
                    ✎ Edit
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
                        🗑 Delete
                    </button>

                </form>


                <!-- Date -->
                <span class="todo-date">
                    ${todo.created_at}
                </span>

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

                    button.classList.toggle(
                        "completed",
                        data.completed
                    );

                    if (data.completed) {

                        button.textContent = "✓";

                        button.title = "Mark as active";

                        status.textContent = "Completed";

                        status.classList.add("completed");

                    }

                    else {

                        button.textContent = "";

                        button.title = "Mark as completed";

                        status.textContent = "Pending";

                        status.classList.remove("completed");

                    }

                    // Update Important page statistics
                    if (
                        window.location.pathname === "/important/"
                    ) {
                        updateImportantStats();
                    }

                    // Update Dashboard statistics
                    if (
                        typeof updateStats === "function"
                    ) {
                        updateStats();
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
                            ? "Remove from important"
                            : "Mark as important";


                    /*
                        If we are on the Important page
                        and the task is no longer important,
                        remove it immediately.
                    */

                    if (
                        !data.important &&
                        window.location.pathname
                            === "/important/"
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
                    "Are you sure you want to delete this task?"
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


                    /*
                        Dashboard statistics
                    */
                    if (
                        typeof updateStats ===
                        "function"
                    ) {

                        updateStats();

                    }


                    /*
                        Important page statistics
                    */
                    if (
                        window.location.pathname
                            === "/important/"
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

        /*
            Important Tasks
        */
        statNumbers[0].textContent =
            total;


        /*
            Completed
        */
        statNumbers[1].textContent =
            completed;


        /*
            Remaining
        */
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
                    No important tasks
                </h3>

                <p>
                    Mark a task as important
                    and it will appear here.
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