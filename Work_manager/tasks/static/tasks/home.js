// ==================================================
// ADD TASK
// ==================================================

const addTaskForm = document.querySelector(
    ".add-task-form-container"
);


if (addTaskForm) {

    addTaskForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();

            try {

                const response = await fetch(
                    window.location.href,
                    {
                        method: "POST",

                        body: new FormData(
                            addTaskForm
                        ),

                        headers: {
                            "X-Requested-With":
                                "XMLHttpRequest",
                        },
                    }
                );


                const data =
                    await response.json();


                if (data.success) {

                    /*
                     * Pagination is handled by Django.
                     *
                     * After creating a new Todo, the newest
                     * task belongs to the first page.
                     *
                     * Therefore, reload the first page instead
                     * of manually inserting a new card into the DOM.
                     */


                    const currentUrl =
                        new URL(
                            window.location.href
                        );


                    // Remove the current page number.
                    currentUrl.searchParams.delete(
                        "page"
                    );


                    /*
                     * Reload the page from the server.
                     *
                     * Django will recalculate:
                     * - Todo list
                     * - Pagination
                     * - Statistics
                     */

                    window.location.href =
                        currentUrl.toString();

                }

            } catch (error) {

                console.error(
                    "Error adding task:",
                    error
                );

            }

        }
    );

}


// ==================================================
// LOAD PAGE CONTENT
// ==================================================

async function loadPage(url) {

    try {

        const response = await fetch(
            url,
            {
                headers: {
                    "X-Requested-With":
                        "XMLHttpRequest",
                },
            }
        );


        if (!response.ok) {

            throw new Error(
                "Failed to load page."
            );

        }


        const html =
            await response.text();


        const parser =
            new DOMParser();


        const doc =
            parser.parseFromString(
                html,
                "text/html"
            );


        // --------------------------------------------------
        // TODO LIST
        // --------------------------------------------------

        const currentTodoList =
            document.querySelector(
                ".todo-list"
            );


        const newTodoList =
            doc.querySelector(
                ".todo-list"
            );


        if (
            currentTodoList &&
            newTodoList
        ) {

            currentTodoList.innerHTML =
                newTodoList.innerHTML;

        }


        // --------------------------------------------------
        // PAGINATION
        // --------------------------------------------------

        const currentPagination =
            document.querySelector(
                ".pagination"
            );


        const newPagination =
            doc.querySelector(
                ".pagination"
            );


        /*
         * A page may have no pagination
         * when there is only one page.
         */

        if (
            currentPagination &&
            newPagination
        ) {

            currentPagination.replaceWith(
                newPagination
            );

        }

        else if (
            !currentPagination &&
            newPagination
        ) {

            /*
             * Insert pagination after
             * the todo list.
             */

            currentTodoList.insertAdjacentElement(
                "afterend",
                newPagination
            );

        }

        else if (
            currentPagination &&
            !newPagination
        ) {

            currentPagination.remove();

        }


        // --------------------------------------------------
        // STATISTICS
        // --------------------------------------------------

        const currentStats =
            document.querySelector(
                ".stats"
            );


        const newStats =
            doc.querySelector(
                ".stats"
            );


        if (
            currentStats &&
            newStats
        ) {

            currentStats.innerHTML =
                newStats.innerHTML;

        }


        // --------------------------------------------------
        // FILTER BUTTONS
        // --------------------------------------------------

        const currentFilters =
            document.querySelector(
                ".task-filters"
            );


        const newFilters =
            doc.querySelector(
                ".task-filters"
            );


        if (
            currentFilters &&
            newFilters
        ) {

            currentFilters.innerHTML =
                newFilters.innerHTML;

        }


        // --------------------------------------------------
        // UPDATE URL
        // --------------------------------------------------

        window.history.pushState(
            {},
            "",
            url
        );


        // Re-bind events to the newly loaded buttons.
        bindPaginationEvents();

        bindFilterEvents();

        bindTodoEvents();


        // Convert dynamic numbers.
        convertTextNodesToPersianDigits(
            document.body
        );


    } catch (error) {

        console.error(
            "Error loading page:",
            error
        );

    }

}


// ==================================================
// FILTERS
// ==================================================

function bindFilterEvents() {

    document
        .querySelectorAll(
            ".filter-button"
        )
        .forEach(
            function (button) {

                /*
                 * Prevent binding the same event
                 * multiple times.
                 */

                if (
                    button.dataset.bound === "true"
                ) {

                    return;

                }


                button.dataset.bound = "true";


                button.addEventListener(
                    "click",
                    function (event) {

                        event.preventDefault();

                        loadPage(
                            button.href
                        );

                    }
                );

            }
        );

}


// ==================================================
// PAGINATION
// ==================================================

function bindPaginationEvents() {

    document
        .querySelectorAll(
            ".pagination a"
        )
        .forEach(
            function (button) {

                if (
                    button.dataset.bound === "true"
                ) {

                    return;

                }


                button.dataset.bound = "true";


                button.addEventListener(
                    "click",
                    function (event) {

                        event.preventDefault();

                        loadPage(
                            button.href
                        );

                    }
                );

            }
        );

}


// ==================================================
// TODO EVENTS
// ==================================================

function bindTodoEvents() {

    /*
     * todo.js is responsible for:
     * - complete
     * - important
     * - delete
     *
     * Therefore this function is intentionally empty.
     *
     * It exists so the page-loading logic remains
     * organized and can be extended later.
     */

}


// ==================================================
// CONVERT ENGLISH DIGITS TO PERSIAN DIGITS
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


// ==================================================
// CONVERT TEXT NODES TO PERSIAN DIGITS
// ==================================================

function convertTextNodesToPersianDigits(
    element
) {

    const walker =
        document.createTreeWalker(
            element,
            NodeFilter.SHOW_TEXT
        );


    const textNodes = [];


    while (
        walker.nextNode()
    ) {

        textNodes.push(
            walker.currentNode
        );

    }


    textNodes.forEach(
        function (node) {

            node.nodeValue =
                toPersianDigits(
                    node.nodeValue
                );

        }
    );

}


// ==================================================
// OBSERVE DYNAMIC CONTENT
// ==================================================

const observer =
    new MutationObserver(
        function (mutations) {

            mutations.forEach(
                function (mutation) {

                    mutation.addedNodes.forEach(
                        function (node) {

                            if (
                                node.nodeType ===
                                Node.TEXT_NODE
                            ) {

                                node.nodeValue =
                                    toPersianDigits(
                                        node.nodeValue
                                    );

                            }

                            else if (
                                node.nodeType ===
                                Node.ELEMENT_NODE
                            ) {

                                convertTextNodesToPersianDigits(
                                    node
                                );

                            }

                        }
                    );

                }
            );

        }
    );


// ==================================================
// INITIALIZATION
// ==================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        // Convert numbers already present on page.
        convertTextNodesToPersianDigits(
            document.body
        );


        // Bind filters.
        bindFilterEvents();


        // Bind pagination.
        bindPaginationEvents();


        // Bind Todo events.
        bindTodoEvents();

    }
);


observer.observe(
    document.body,
    {
        childList: true,
        subtree: true,
    }
);