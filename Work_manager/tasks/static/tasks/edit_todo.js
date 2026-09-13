// ==================================================
// EDIT TASK - TOPIC MANAGEMENT
// ==================================================


// ==================================================
// ELEMENTS
// ==================================================

const categorySelect =
    document.querySelector("#category");


const topicSelect =
    document.querySelector("#topic");


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
                category: option.dataset.category || "",
            };

        }
    )
    : [];


// ==================================================
// UPDATE TOPIC OPTIONS
// ==================================================

function updateTopicOptions() {

    if (
        !categorySelect ||
        !topicSelect
    ) {

        return;

    }


    const selectedCategory =
        categorySelect.value;


    /*
     * Remember the currently selected topic
     * before rebuilding the options.
     */

    const currentTopicId =
        topicSelect.value;


    topicSelect.innerHTML = "";


    /*
     * Get topics belonging to the
     * selected category.
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
     * Add matching topics to the select.
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
     * Keep the old topic selected
     * when it is still valid.
     */

    const selectedTopic =
        matchingTopics.find(
            function (topic) {

                return (
                    String(topic.value) ===
                    String(currentTopicId)
                );

            }
        );


    if (selectedTopic) {

        topicSelect.value =
            selectedTopic.value;

    }


    /*
     * Disable the topic select when
     * no topics are available.
     */

    topicSelect.disabled =
        matchingTopics.length === 0;


    /*
     * Users can only create personal topics.
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
             * Only personal topics can be created
             * by the current user.
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


            createTopicModal.hidden =
                false;


            if (createTopicError) {

                createTopicError.hidden =
                    true;

                createTopicError.textContent =
                    "";

            }


            if (newTopicInput) {

                newTopicInput.value =
                    "";

                newTopicInput.focus();

            }

        }
    );

}


// ==================================================
// CLOSE CREATE TOPIC MODAL
// ==================================================

function closeTopicModal() {

    if (!createTopicModal) {

        return;

    }


    createTopicModal.hidden =
        true;


    if (createTopicError) {

        createTopicError.hidden =
            true;

        createTopicError.textContent =
            "";

    }

}


if (createTopicClose) {

    createTopicClose.addEventListener(
        "click",
        closeTopicModal
    );

}


if (cancelTopicButton) {

    cancelTopicButton.addEventListener(
        "click",
        closeTopicModal
    );

}


// ==================================================
// CLOSE MODAL BY OVERLAY
// ==================================================

if (createTopicModal) {

    const overlay =
        createTopicModal.querySelector(
            ".create-topic-overlay"
        );


    if (overlay) {

        overlay.addEventListener(
            "click",
            closeTopicModal
        );

    }

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
            // VALIDATE TOPIC NAME
            // --------------------------------------------------

            if (!name) {

                if (createTopicError) {

                    createTopicError.textContent =
                        "نام موضوع را وارد کنید.";

                    createTopicError.hidden =
                        false;

                }

                return;

            }


            // --------------------------------------------------
            // DISABLE BUTTON
            // --------------------------------------------------

            saveTopicButton.disabled =
                true;

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
                // GET NEW TOPIC
                // --------------------------------------------------

                const newTopic =
                    data.topic;


                // --------------------------------------------------
                // ADD TO INTERNAL TOPIC LIST
                // --------------------------------------------------

                topicOptions.push({

                    value:
                        String(
                            newTopic.id
                        ),

                    text:
                        newTopic.name,

                    category:
                        "personal",

                });


                // --------------------------------------------------
                // ADD TO SELECT
                // --------------------------------------------------

                if (
                    topicSelect &&
                    categorySelect &&
                    categorySelect.value ===
                        "personal"
                ) {

                    const option =
                        document.createElement(
                            "option"
                        );


                    option.value =
                        String(
                            newTopic.id
                        );


                    option.textContent =
                        newTopic.name;


                    option.dataset.category =
                        "personal";


                    topicSelect.appendChild(
                        option
                    );


                    topicSelect.disabled =
                        false;


                    topicSelect.value =
                        String(
                            newTopic.id
                        );

                }


                // --------------------------------------------------
                // CLOSE MODAL
                // --------------------------------------------------

                closeTopicModal();

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

    const token =
        document.querySelector(
            "[name=csrfmiddlewaretoken]"
        );


    return token
        ? token.value
        : "";

}


// ==================================================
// INITIALIZATION
// ==================================================

updateTopicOptions();