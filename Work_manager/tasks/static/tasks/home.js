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

                // Send the task to the dedicated create endpoint.

                const response =
                    await fetch(
                        "/todo/create/",
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


                // New tasks belong to page 1.
                // Keep all currently active filters.

                const currentUrl =
                    new URL(
                        window.location.href
                    );


                currentUrl.searchParams.delete(
                    "page"
                );


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


    topicSelect.innerHTML = "";


    const matchingTopics =
        topicOptions.filter(
            function (topic) {

                return (
                    topic.category ===
                    selectedCategory
                );

            }
        );


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


    if (
        topicSelect.options.length > 0 &&
        topicSelect.value === ""
    ) {

        topicSelect.selectedIndex = 0;

    }


    topicSelect.disabled =
        matchingTopics.length === 0;


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


            if (!name) {

                if (createTopicError) {

                    createTopicError.textContent =
                        "نام موضوع را وارد کنید.";

                    createTopicError.hidden = false;

                }

                return;

            }


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


                const newTopic =
                    data.topic;


                const newTopicValue =
                    String(
                        newTopic.id
                    );


                topicOptions.push({

                    value:
                        newTopicValue,

                    text:
                        newTopic.name,

                    category:
                        "personal",

                });


                updateTopicOptions(
                    newTopicValue
                );


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
// CSRF TOKEN
// ==================================================

function getCSRFToken() {

    const cookie =
        document.cookie
            .split("; ")
            .find(
                function (row) {
                    return row.startsWith(
                        "csrftoken="
                    );
                }
            );

    return cookie
        ? decodeURIComponent(
            cookie.split("=")[1]
        )
        : "";

}


// ==================================================
// PERSIAN / ENGLISH DIGITS
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


function toEnglishDigits(value) {

    if (
        value === null ||
        value === undefined
    ) {

        return value;

    }


    return String(value).replace(
        /[۰-۹]/g,
        function (digit) {

            return String(
                "۰۱۲۳۴۵۶۷۸۹".indexOf(
                    digit
                )
            );

        }
    );

}


// ==================================================
// CONVERT TEXT NODES TO PERSIAN DIGITS
// ==================================================

function convertTextNodesToPersianDigits(
    element
) {

    if (!element) {
        return;
    }


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

            // Do not modify form controls.

            const parent =
                node.parentElement;


            if (
                parent &&
                (
                    parent.tagName === "INPUT" ||
                    parent.tagName === "TEXTAREA" ||
                    parent.tagName === "SELECT"
                )
            ) {

                return;

            }


            node.nodeValue =
                toPersianDigits(
                    node.nodeValue
                );

        }
    );

}


// ==================================================
// SEARCH
// ==================================================

let searchDebounceTimer = null;


// ==================================================
// APPLY SEARCH
// ==================================================

function applySearch(
    value = null
) {

    const searchInput =
        document.querySelector(
            "#task-search"
        );


    if (
        value === null &&
        !searchInput
    ) {

        return;

    }


    const currentUrl =
        new URL(
            window.location.href
        );


    const searchValue =
        value !== null
            ? value.trim()
            : searchInput.value.trim();


    // Always return to page 1
    // when the search changes.

    currentUrl.searchParams.delete(
        "page"
    );


    if (searchValue) {

        currentUrl.searchParams.set(
            "search",
            searchValue
        );

    }

    else {

        currentUrl.searchParams.delete(
            "search"
        );

    }


    loadPage(
        currentUrl.toString()
    );

}


// ==================================================
// CLEAR SEARCH
// ==================================================

function clearSearch() {

    clearTimeout(
        searchDebounceTimer
    );


    const currentUrl =
        new URL(
            window.location.href
        );


    currentUrl.searchParams.delete(
        "search"
    );


    currentUrl.searchParams.delete(
        "page"
    );


    loadPage(
        currentUrl.toString()
    );

}


// ==================================================
// BIND SEARCH EVENTS
// ==================================================

function bindSearchEvents(
    preserveFocus = false,
    cursorPosition = null
) {

    const searchInput =
        document.querySelector(
            "#task-search"
        );


    if (!searchInput) {
        return;
    }


    if (
        searchInput.dataset.bound !==
        "true"
    ) {

        searchInput.dataset.bound =
            "true";


        // --------------------------------------------------
        // Search while typing with debounce.
        // --------------------------------------------------

        searchInput.addEventListener(
            "input",
            function () {

                clearTimeout(
                    searchDebounceTimer
                );


                const value =
                    searchInput.value;


                searchDebounceTimer =
                    setTimeout(
                        function () {

                            const currentSearch =
                                new URL(
                                    window.location.href
                                )
                                    .searchParams
                                    .get("search") || "";


                            if (
                                value.trim() ===
                                currentSearch.trim()
                            ) {

                                return;

                            }


                            applySearch(
                                value
                            );

                        },
                        500
                    );

            }
        );


        // --------------------------------------------------
        // Enter performs the search immediately.
        // --------------------------------------------------

        searchInput.addEventListener(
            "keydown",
            function (event) {

                if (
                    event.key === "Enter"
                ) {

                    event.preventDefault();


                    clearTimeout(
                        searchDebounceTimer
                    );


                    applySearch(
                        searchInput.value
                    );

                }


                // Escape clears the search.

                if (
                    event.key === "Escape"
                ) {

                    event.preventDefault();


                    clearSearch();

                }

            }
        );

    }


    // --------------------------------------------------
    // Clear button
    // --------------------------------------------------

    const clearButton =
        document.querySelector(
            "#clear-task-search"
        );


    if (
        clearButton &&
        clearButton.dataset.bound !== "true"
    ) {

        clearButton.dataset.bound =
            "true";


        clearButton.addEventListener(
            "click",
            function (event) {

                event.preventDefault();

                clearSearch();

            }
        );

    }


    // --------------------------------------------------
    // Restore focus after AJAX replacement.
    // --------------------------------------------------

    if (preserveFocus) {

        const newInput =
            document.querySelector(
                "#task-search"
            );


        if (newInput) {

            newInput.focus();


            const position =
                cursorPosition !== null
                    ? Math.min(
                        cursorPosition,
                        newInput.value.length
                    )
                    : newInput.value.length;


            try {

                newInput.setSelectionRange(
                    position,
                    position
                );

            }

            catch (error) {

                // Some input types do not support selection.

            }

        }

    }

}


// ==================================================
// LOAD PAGE CONTENT
// ==================================================

async function loadPage(
    url,
    pushHistory = true
) {

    try {

        // --------------------------------------------------
        // Remember search focus and cursor position.
        // --------------------------------------------------

        const activeElement =
            document.activeElement;


        const wasSearchFocused =
            activeElement &&
            activeElement.id === "task-search";


        const searchCursorPosition =
            wasSearchFocused
                ? activeElement.selectionStart
                : null;


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
            newPagination &&
            currentTodoList
        ) {

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
        // FILTER AREA
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

            currentFilters.replaceWith(
                newFilters
            );

        }


        // ==================================================
        // UPDATE URL
        // ==================================================

        if (pushHistory) {

            window.history.pushState(
                {},
                "",
                url
            );

        }


        // ==================================================
        // REBIND EVENTS
        // ==================================================

        bindPaginationEvents();

        bindFilterEvents();

        bindTopicFilterEvents();

        bindDateFilterEvents();

        bindCalendarInputs();

        bindSearchEvents(
            wasSearchFocused,
            searchCursorPosition
        );


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
// EXPOSE LOAD PAGE
// ==================================================

window.loadPage =
    loadPage;


// ==================================================
// STATUS FILTERS
// ==================================================

function bindFilterEvents() {

    document
        .querySelectorAll(
            ".filter-button"
        )
        .forEach(
            function (button) {

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


                        let url;


                        // "همه" must remove only
                        // the status filter.
                        // Preserve search, topic,
                        // important and date filters.

                        if (
                            button.dataset.filterAction ===
                            "clear-status"
                        ) {

                            url =
                                new URL(
                                    window.location.href
                                );


                            url.searchParams.delete(
                                "filter"
                            );

                        }

                        else {

                            url =
                                new URL(
                                    button.href,
                                    window.location.origin
                                );

                        }


                        url.searchParams.delete(
                            "page"
                        );


                        loadPage(
                            url.toString()
                        );

                    }
                );

            }
        );

}


// ==================================================
// TOPIC FILTER
// ==================================================

function applyTopicFilter() {

    const currentTopicFilter =
        document.querySelector(
            "#topic-filter"
        );


    if (!currentTopicFilter) {
        return;
    }


    const currentUrl =
        new URL(
            window.location.href
        );


    const selectedTopicId =
        currentTopicFilter.value;


    currentUrl.searchParams.delete(
        "page"
    );


    if (selectedTopicId) {

        currentUrl.searchParams.set(
            "topic",
            selectedTopicId
        );

    }

    else {

        currentUrl.searchParams.delete(
            "topic"
        );

    }


    loadPage(
        currentUrl.toString()
    );

}


function bindTopicFilterEvents() {

    const currentTopicFilter =
        document.querySelector(
            "#topic-filter"
        );


    if (!currentTopicFilter) {
        return;
    }


    if (
        currentTopicFilter.dataset.bound ===
        "true"
    ) {

        return;

    }


    currentTopicFilter.dataset.bound =
        "true";


    currentTopicFilter.addEventListener(
        "change",
        applyTopicFilter
    );

}


// ==================================================
// DATE FILTERS
// ==================================================

function applyDateFilter() {

    const input =
        this;


    if (!input) {
        return;
    }


    const parameter =
        input.dataset.filterParam;


    if (!parameter) {
        return;
    }


    const currentUrl =
        new URL(
            window.location.href
        );


    currentUrl.searchParams.delete(
        "page"
    );


    const value =
        input.value.trim();


    if (value) {

        // Store dates with English digits in URL.
        // UI continues to display Persian digits.

        currentUrl.searchParams.set(
            parameter,
            toEnglishDigits(value)
        );

    }

    else {

        currentUrl.searchParams.delete(
            parameter
        );

    }


    loadPage(
        currentUrl.toString()
    );

}


function bindDateFilterEvents() {

    document
        .querySelectorAll(
            ".task-filters .date-filter-input"
        )
        .forEach(
            function (input) {

                if (
                    input.dataset.bound ===
                    "true"
                ) {

                    return;

                }


                input.dataset.bound =
                    "true";


                input.addEventListener(
                    "change",
                    applyDateFilter
                );

            }
        );

}


// ==================================================
// CUSTOM CALENDAR
// ==================================================

function bindCalendarInputs() {

    document
        .querySelectorAll(
            ".task-filters .jalali-date-input"
        )
        .forEach(
            function (input) {

                if (
                    input.dataset.calendarBound ===
                    "true"
                ) {

                    return;

                }


                input.dataset.calendarBound =
                    "true";


                input.addEventListener(
                    "click",
                    function () {

                        if (
                            window.MyCalendar &&
                            typeof window.MyCalendar.open ===
                            "function"
                        ) {

                            window.MyCalendar.open(
                                input
                            );

                        }

                    }
                );

            }
        );

}


// ==================================================
// ACTIVE FILTER CHIPS
// ==================================================

/*
 * These events are handled through document-level
 * delegation below.
 *
 * We intentionally do not attach individual
 * listeners here because .task-filters is replaced
 * by AJAX and duplicate listeners can cause the
 * request to run twice.
 */

function bindActiveFilterEvents() {
    return;
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
// GLOBAL FILTER EVENT DELEGATION
// ==================================================

/*
 * The .task-filters element is replaced
 * by AJAX.
 *
 * Event delegation on document means
 * these buttons continue to work after
 * AJAX replacements.
 */

document.addEventListener(
    "click",
    function (event) {

        // --------------------------------------------------
        // REMOVE ONE FILTER
        // --------------------------------------------------

        const removeButton =
            event.target.closest(
                "[data-remove-filter]"
            );


        if (removeButton) {

            event.preventDefault();
            event.stopPropagation();


            const parameter =
                removeButton.dataset.removeFilter;


            if (!parameter) {
                return;
            }


            const currentUrl =
                new URL(
                    window.location.href
                );


            currentUrl.searchParams.delete(
                parameter
            );


            currentUrl.searchParams.delete(
                "page"
            );


            loadPage(
                currentUrl.toString()
            );


            return;

        }


        // --------------------------------------------------
        // CLEAR ALL FILTERS
        // --------------------------------------------------

        const clearAllButton =
            event.target.closest(
                ".clear-all-filters"
            );


        if (clearAllButton) {

            event.preventDefault();
            event.stopPropagation();


            const currentUrl =
                new URL(
                    window.location.href
                );


            // Keep only scope.

            const scope =
                currentUrl.searchParams.get(
                    "scope"
                );


            currentUrl.search =
                "";


            if (scope) {

                currentUrl.searchParams.set(
                    "scope",
                    scope
                );

            }


            loadPage(
                currentUrl.toString()
            );

        }

    }
);


// ==================================================
// BROWSER BACK / FORWARD
// ==================================================

window.addEventListener(
    "popstate",
    function () {

        loadPage(
            window.location.href,
            false
        );

    }
);


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

                                // Avoid processing the
                                // entire document repeatedly.

                                if (
                                    node !==
                                    document.body
                                ) {

                                    convertTextNodesToPersianDigits(
                                        node
                                    );

                                }

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

        // --------------------------------------------------
        // Convert existing numbers
        // --------------------------------------------------

        convertTextNodesToPersianDigits(
            document.body
        );


        // --------------------------------------------------
        // Status filters
        // --------------------------------------------------

        bindFilterEvents();


        // --------------------------------------------------
        // Pagination
        // --------------------------------------------------

        bindPaginationEvents();


        // --------------------------------------------------
        // Topic options
        // --------------------------------------------------

        updateTopicOptions();


        // --------------------------------------------------
        // Topic filter
        // --------------------------------------------------

        bindTopicFilterEvents();


        // --------------------------------------------------
        // Date filters
        // --------------------------------------------------

        bindDateFilterEvents();


        // --------------------------------------------------
        // Active filter chips
        // --------------------------------------------------

        bindActiveFilterEvents();


        // --------------------------------------------------
        // Calendar inputs
        // --------------------------------------------------

        bindCalendarInputs();


        // --------------------------------------------------
        // Search
        // --------------------------------------------------

        bindSearchEvents();

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