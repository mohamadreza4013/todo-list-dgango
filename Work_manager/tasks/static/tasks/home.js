// ==================================================
// ADD TASK
// ==================================================

const addTaskForm = document.querySelector(".add-task-form-container");

if (addTaskForm) {
    addTaskForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        try {
            const response = await fetch(window.location.href, {
                method: "POST",
                body: new FormData(addTaskForm),
                headers: {
                    "X-Requested-With": "XMLHttpRequest",
                },
            });

            const data = await response.json();

            if (data.success) {
                const todoList = document.querySelector(".todo-list");

                // حذف حالت خالی
                const emptyState = todoList.querySelector(".empty-state");
                if (emptyState) {
                    emptyState.remove();
                }

                // ساخت کارت جدید
                const card = createTodoCard(data);

                // افزودن به ابتدای لیست
                todoList.insertAdjacentHTML("afterbegin", card);

                // پاک کردن فرم
                addTaskForm.reset();

                // به‌روزرسانی آمار
                updateStats();
            }
        } catch (error) {
            console.error("Error adding task:", error);
        }
    });
}

// ==================================================
// FILTERS
// ==================================================

document.querySelectorAll(".filter-button").forEach((button) => {
    button.addEventListener("click", async function (event) {
        event.preventDefault();

        const url = button.href;

        try {
            const response = await fetch(url, {
                headers: {
                    "X-Requested-With": "XMLHttpRequest",
                },
            });

            const html = await response.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, "text/html");

            const newTodoList = doc.querySelector(".todo-list");
            const currentTodoList = document.querySelector(".todo-list");

            currentTodoList.innerHTML = newTodoList.innerHTML;

            // به‌روزرسانی دکمه فعال
            document.querySelectorAll(".filter-button").forEach((btn) => {
                btn.classList.remove("active");
            });
            button.classList.add("active");

            // به‌روزرسانی URL
            window.history.pushState({}, "", url);
        } catch (error) {
            console.error("Error filtering tasks:", error);
        }
    });
});

// ==================================================
// UPDATE STATISTICS
// ==================================================

function updateStats() {
    const cards = document.querySelectorAll(".todo-card");
    let completed = 0;

    cards.forEach((card) => {
        const button = card.querySelector(".complete-button");
        if (button && button.classList.contains("completed")) {
            completed++;
        }
    });

    const total = cards.length;
    const remaining = total - completed;

    const statNumbers = document.querySelectorAll(".stat-number");
    if (statNumbers.length >= 3) {
        statNumbers[0].textContent = total;
        statNumbers[1].textContent = completed;
        statNumbers[2].textContent = remaining;
    }
}
