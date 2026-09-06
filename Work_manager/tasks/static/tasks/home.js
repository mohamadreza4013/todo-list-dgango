// ==================================================
// ADD TASK
// ==================================================

/*
    Handles the Add Task form using AJAX.
    The page will not reload after adding a task.
*/

const addTaskForm =
    document.querySelector(
        ".add-task-form-container"
    );


if (addTaskForm) {

    addTaskForm.addEventListener(
        "submit",
        async function(event) {

            // Prevent normal form submission
            event.preventDefault();


            try {

                // Send form data to Django
                const response =
                    await fetch(
                        window.location.href,
                        {
                            method: "POST",

                            body:
                                new FormData(
                                    addTaskForm
                                ),

                            headers: {
                                "X-Requested-With":
                                    "XMLHttpRequest"
                            }
                        }
                    );


                // Convert Django response to JSON
                const data =
                    await response.json();


                // Continue only if task was created successfully
                if (data.success) {

                    const todoList =
                        document.querySelector(
                            ".todo-list"
                        );


                    // Remove empty state
                    const emptyState =
                        todoList.querySelector(
                            ".empty-state"
                        );


                    if (emptyState) {

                        emptyState.remove();

                    }


                    // Create new task card
                    const card =
                        createTodoCard(data);


                    // Add task to the beginning
                    todoList.insertAdjacentHTML(
                        "afterbegin",
                        card
                    );


                    // Clear form
                    addTaskForm.reset();


                    // Update statistics
                    updateStats();

                }

            }

            catch (error) {

                console.error(
                    "Error adding task:",
                    error
                );

            }

        }
    );

}


// ==================================================
// FILTERS
// ==================================================

/*
    Handles All / Active / Completed filters
    without reloading the page.
*/

document
    .querySelectorAll(
        ".filter-button"
    )
    .forEach(button => {

        button.addEventListener(
            "click",
            async function(event) {

                // Prevent normal navigation
                event.preventDefault();


                const url =
                    button.href;


                try {

                    // Request filtered page from Django
                    const response =
                        await fetch(
                            url,
                            {
                                headers: {
                                    "X-Requested-With":
                                        "XMLHttpRequest"
                                }
                            }
                        );


                    // Get returned HTML
                    const html =
                        await response.text();


                    // Convert HTML string to DOM document
                    const parser =
                        new DOMParser();


                    const doc =
                        parser.parseFromString(
                            html,
                            "text/html"
                        );


                    // Find task list in returned page
                    const newTodoList =
                        doc.querySelector(
                            ".todo-list"
                        );


                    // Find current task list
                    const currentTodoList =
                        document.querySelector(
                            ".todo-list"
                        );


                    // Replace current tasks
                    currentTodoList.innerHTML =
                        newTodoList.innerHTML;


                    // ==================================================
                    // UPDATE ACTIVE FILTER
                    // ==================================================

                    document
                        .querySelectorAll(
                            ".filter-button"
                        )
                        .forEach(btn => {

                            btn.classList.remove(
                                "active"
                            );

                        });


                    button.classList.add(
                        "active"
                    );


                    // ==================================================
                    // UPDATE URL
                    // ==================================================

                    window.history.pushState(
                        {},
                        "",
                        url
                    );

                }

                catch (error) {

                    console.error(
                        "Error filtering tasks:",
                        error
                    );

                }

            }
        );

    });


// ==================================================
// UPDATE STATISTICS
// ==================================================

/*
    Calculates statistics based on the task cards
    currently visible on the page.
*/

function updateStats() {

    // Get all visible task cards
    const cards =
        document.querySelectorAll(
            ".todo-card"
        );


    // Number of completed tasks
    let completed = 0;


    // Check every task
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


    // Total visible tasks
    const total =
        cards.length;


    // Remaining tasks
    const remaining =
        total - completed;


    // Get statistics elements
    const statNumbers =
        document.querySelectorAll(
            ".stat-number"
        );


    // Make sure all three statistics exist
    if (statNumbers.length >= 3) {

        // Total
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