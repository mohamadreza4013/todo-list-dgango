// ==================================================
// CREATE TASK MODAL
// ==================================================

const createTaskButton =
    document.querySelector("#create-task-button");


const createTaskModal =
    document.querySelector("#create-task-modal");


const createTaskClose =
    document.querySelector("#create-task-close");


const cancelTaskButton =
    document.querySelector("#cancel-task-button");


const createTaskForm =
    document.querySelector("#create-task-form");


const saveTaskButton =
    document.querySelector("#save-task-button");


const createTaskError =
    document.querySelector("#create-task-error");


const taskTitleInput =
    document.querySelector("#task-title");


// ==================================================
// OPEN CREATE TASK MODAL
// ==================================================

if (createTaskButton) {

    createTaskButton.addEventListener(
        "click",
        function () {

            if (!createTaskModal) {
                return;
            }

            createTaskModal.hidden = false;

            if (createTaskError) {

                createTaskError.hidden = true;

                createTaskError.textContent = "";

            }

            if (taskTitleInput) {

                taskTitleInput.focus();

            }

        }
    );

}


// ==================================================
// CLOSE CREATE TASK MODAL
// ==================================================

function closeCreateTaskModal() {

    if (!createTaskModal) {
        return;
    }

    createTaskModal.hidden = true;

    if (createTaskError) {

        createTaskError.hidden = true;

        createTaskError.textContent = "";

    }

}


if (createTaskClose) {

    createTaskClose.addEventListener(
        "click",
        closeCreateTaskModal
    );

}


if (cancelTaskButton) {

    cancelTaskButton.addEventListener(
        "click",
        closeCreateTaskModal
    );

}


// ==================================================
// CLOSE CREATE TASK MODAL BY OVERLAY
// ==================================================

const createTaskOverlay =
    createTaskModal
        ? createTaskModal.querySelector(
            ".create-task-overlay"
        )
        : null;


if (createTaskOverlay) {

    createTaskOverlay.addEventListener(
        "click",
        closeCreateTaskModal
    );

}


// ==================================================
// CREATE TASK
// ==================================================

if (createTaskForm) {

    createTaskForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();

            if (createTaskError) {

                createTaskError.hidden = true;

                createTaskError.textContent = "";

            }

            if (saveTaskButton) {

                saveTaskButton.disabled = true;

                saveTaskButton.textContent =
                    "در حال ایجاد...";

            }

            try {

                const response =
                    await fetch(
                        window.location.href,
                        {
                            method: "POST",

                            body:
                                new FormData(
                                    createTaskForm
                                ),

                            headers: {
                                "X-Requested-With":
                                    "XMLHttpRequest",
                            },
                        }
                    );


                const data =
                    await response.json();


                if (
                    !response.ok ||
                    !data.success
                ) {

                    throw new Error(
                        data.error ||
                        "خطا در ایجاد وظیفه."
                    );

                }


                /*
                 * New tasks are the newest tasks,
                 * therefore they belong to page 1.
                 */

                const currentUrl =
                    new URL(
                        window.location.href
                    );


                currentUrl.searchParams.delete(
                    "page"
                );


                /*
                 * Reload the first page so Django
                 * recalculates:
                 *
                 * - task list
                 * - statistics
                 * - pagination
                 */

                window.location.href =
                    currentUrl.toString();

            }

            catch (error) {

                console.error(
                    "Error creating task:",
                    error
                );


                if (createTaskError) {

                    createTaskError.textContent =
                        error.message;

                    createTaskError.hidden = false;

                }


                if (saveTaskButton) {

                    saveTaskButton.disabled =
                        false;

                    saveTaskButton.textContent =
                        "ایجاد وظیفه";

                }

            }

        }
    );

}


// ==================================================
// CREATE PERSONAL TOPIC
// ==================================================

const categorySelect =
    document.querySelector("#task-category");


const topicSelect =
    document.querySelector("#task-topic");


const createTopicButton =
    document.querySelector("#create-topic-button");


const createTopicModal =
    document.querySelector("#create-topic-modal");


const createTopicClose =
    document.querySelector("#create-topic-close");


const cancelTopicButton =
    document.querySelector("#cancel-topic-button");


const saveTopicButton =
    document.querySelector("#save-topic-button");


const newTopicInput =
    document.querySelector("#new-topic-name");


const createTopicError =
    document.querySelector("#create-topic-error");


// ==================================================
// STORE INITIAL TOPICS
// ==================================================

const topicOptions = topicSelect
    ? Array.from(
        topicSelect.options
    ).map(
        function (option) {

            return {
                value: option.value,
                text: option.textContent.trim(),
                category:
                    option.dataset.category || "",
            };

        }
    )
    : [];


// ==================================================
// UPDATE TOPIC OPTIONS
// ==================================================

function updateTopicOptions(
    selectedTopicId = null
) {

    if (
        !categorySelect ||
        !topicSelect
    ) {

        return;

    }


    const selectedCategory =
        categorySelect.value;


    /*
     * Remove all current options.
     */

    topicSelect.innerHTML = "";


    /*
     * Get topics that belong to
     * the selected category.
     */

    const matchingTopics =
        topicOptions.filter(
            function (topic) {

                return (
                    topic.category ===
                    selectedCategory
                );

            }
        );


    /*
     * Add matching topics.
     */

    matchingTopics.forEach(
        function (topic) {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                topic.value;


            option.textContent =
                topic.text;


            option.dataset.category =
                topic.category;


            topicSelect.appendChild(
                option
            );

        }
    );


    /*
     * Select the requested topic
     * when it exists in the current category.
     */

    if (selectedTopicId !== null) {

        const selectedOption =
            Array.from(
                topicSelect.options
            ).find(
                function (option) {

                    return (
                        option.value ===
                        String(selectedTopicId)
                    );

                }
            );


        if (selectedOption) {

            selectedOption.selected =
                true;

        }

    }


    /*
     * If no topic is selected,
     * automatically select the first one.
     */

    if (
        topicSelect.options.length > 0 &&
        topicSelect.value === ""
    ) {

        topicSelect.selectedIndex = 0;

    }


    /*
     * Disable the select when
     * no topics are available.
     */

    topicSelect.disabled =
        matchingTopics.length === 0;


    /*
     * New personal topics can only
     * be created for personal tasks.
     */

    if (createTopicButton) {

        createTopicButton.disabled =
            selectedCategory !== "personal";

    }

}


// ==================================================
// CATEGORY CHANGE
// ==================================================

if (categorySelect) {

    categorySelect.addEventListener(
        "change",
        function () {

            updateTopicOptions();

        }
    );

}


// ==================================================
// OPEN CREATE TOPIC MODAL
// ==================================================

if (createTopicButton) {

    createTopicButton.addEventListener(
        "click",
        function () {

            /*
             * Only personal topics can be
             * created by the current user.
             */

            if (
                categorySelect &&
                categorySelect.value !== "personal"
            ) {

                return;

            }


            if (!createTopicModal) {
                return;
            }


            createTopicModal.hidden = false;


            if (createTopicError) {

                createTopicError.hidden = true;

                createTopicError.textContent = "";

            }


            if (newTopicInput) {

                newTopicInput.value = "";

                newTopicInput.focus();

            }

        }
    );

}


// ==================================================
// CLOSE CREATE TOPIC MODAL
// ==================================================

function closeCreateTopicModal() {

    if (!createTopicModal) {
        return;
    }

    createTopicModal.hidden = true;

    if (createTopicError) {

        createTopicError.hidden = true;

        createTopicError.textContent = "";

    }

}


if (createTopicClose) {

    createTopicClose.addEventListener(
        "click",
        closeCreateTopicModal
    );

}


if (cancelTopicButton) {

    cancelTopicButton.addEventListener(
        "click",
        closeCreateTopicModal
    );

}


// ==================================================
// CLOSE TOPIC MODAL BY OVERLAY
// ==================================================

const createTopicOverlay =
    createTopicModal
        ? createTopicModal.querySelector(
            ".create-topic-overlay"
        )
        : null;


if (createTopicOverlay) {

    createTopicOverlay.addEventListener(
        "click",
        closeCreateTopicModal
    );

}


// ==================================================
// CREATE TOPIC
// ==================================================

if (saveTopicButton) {

    saveTopicButton.addEventListener(
        "click",
        async function () {

            const name =
                newTopicInput
                    ? newTopicInput.value.trim()
                    : "";


            // --------------------------------------------------
            // VALIDATE NAME
            // --------------------------------------------------

            if (!name) {

                if (createTopicError) {

                    createTopicError.textContent =
                        "نام موضوع را وارد کنید.";

                    createTopicError.hidden = false;

                }

                return;

            }


            // --------------------------------------------------
            // DISABLE SAVE BUTTON
            // --------------------------------------------------

            saveTopicButton.disabled = true;

            saveTopicButton.textContent =
                "در حال ایجاد...";


            try {

                const formData =
                    new FormData();


                formData.append(
                    "name",
                    name
                );


                // --------------------------------------------------
                // SEND REQUEST
                // --------------------------------------------------

                const response =
                    await fetch(
                        "/topic/create/",
                        {
                            method: "POST",

                            body: formData,

                            headers: {
                                "X-CSRFToken":
                                    getCSRFToken(),

                                "X-Requested-With":
                                    "XMLHttpRequest",
                            },
                        }
                    );


                const data =
                    await response.json();


                if (
                    !response.ok ||
                    !data.success
                ) {

                    throw new Error(
                        data.error ||
                        "خطا در ایجاد موضوع."
                    );

                }


                // --------------------------------------------------
                // CREATE NEW TOPIC
                // --------------------------------------------------

                const newTopic =
                    data.topic;


                const newTopicValue =
                    String(
                        newTopic.id
                    );


                // --------------------------------------------------
                // UPDATE INTERNAL TOPIC LIST
                // --------------------------------------------------

                topicOptions.push({

                    value:
                        newTopicValue,

                    text:
                        newTopic.name,

                    category:
                        "personal",

                });


                // --------------------------------------------------
                // UPDATE SELECT
                // --------------------------------------------------

                updateTopicOptions(
                    newTopicValue
                );


                // --------------------------------------------------
                // CLOSE MODAL
                // --------------------------------------------------

                closeCreateTopicModal();

            }

            catch (error) {

                console.error(
                    "Error creating topic:",
                    error
                );


                if (createTopicError) {

                    createTopicError.textContent =
                        error.message;

                    createTopicError.hidden =
                        false;

                }

            }

            finally {

                saveTopicButton.disabled =
                    false;

                saveTopicButton.textContent =
                    "ایجاد موضوع";

            }

        }
    );

}


// ==================================================
// LOAD PAGE CONTENT
// ==================================================

async function loadPage(url) {

    try {

        const response =
            await fetch(
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


        // ==================================================
        // TODO LIST
        // ==================================================

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


        // ==================================================
        // PAGINATION
        // ==================================================

        const currentPagination =
            document.querySelector(
                ".pagination"
            );


        const newPagination =
            doc.querySelector(
                ".pagination"
            );


        /*
         * Replace existing pagination.
         */

        if (
            currentPagination &&
            newPagination
        ) {

            currentPagination.replaceWith(
                newPagination
            );

        }

        /*
         * Add pagination when the
         * current page previously had none.
         */

        else if (
            !currentPagination &&
            newPagination &&
            currentTodoList
        ) {

            currentTodoList.insertAdjacentElement(
                "afterend",
                newPagination
            );

        }

        /*
         * Remove pagination when
         * only one page remains.
         */

        else if (
            currentPagination &&
            !newPagination
        ) {

            currentPagination.remove();

        }


        // ==================================================
        // STATISTICS
        // ==================================================

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


        // ==================================================
        // FILTER BUTTONS
        // ==================================================

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


        // ==================================================
        // UPDATE URL
        // ==================================================

        window.history.pushState(
            {},
            "",
            url
        );


        // ==================================================
        // REBIND PAGINATION
        // ==================================================

        bindPaginationEvents();


        // ==================================================
        // REBIND FILTERS
        // ==================================================

        bindFilterEvents();


        // ==================================================
        // PERSIAN DIGITS
        // ==================================================

        convertTextNodesToPersianDigits(
            document.body
        );

    }

    catch (error) {

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
                 * Prevent multiple event bindings.
                 */

                if (
                    button.dataset.bound ===
                    "true"
                ) {

                    return;

                }


                button.dataset.bound =
                    "true";


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

                /*
                 * Prevent multiple event bindings.
                 */

                if (
                    button.dataset.bound ===
                    "true"
                ) {

                    return;

                }


                button.dataset.bound =
                    "true";


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
// BROWSER BACK / FORWARD
// ==================================================

window.addEventListener(
    "popstate",
    function () {

        loadPage(
            window.location.href
        );

    }
);


// ==================================================
// INITIALIZATION
// ==================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        // Convert existing numbers.
        convertTextNodesToPersianDigits(
            document.body
        );


        // Initialize filters.
        bindFilterEvents();


        // Initialize pagination.
        bindPaginationEvents();


        // Initialize topic options.
        updateTopicOptions();

    }
);


// ==================================================
// START OBSERVER
// ==================================================

observer.observe(
    document.body,
    {
        childList: true,
        subtree: true,
    }
);