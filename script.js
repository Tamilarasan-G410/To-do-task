//query-selectors
const inputBox = document.querySelector("#inputtask");
const inputButton = document.querySelector(".button");
const showtasks = document.querySelector(".showtasks");
const errormessage = document.querySelector(".error-message");
const noTasksMessage = document.querySelector(".no-tasks-message");
const noCompletedTasksMessage = document.querySelector(".no-completed-tasks-message");
const noAssignedTasksMessage = document.querySelector(".no-assigned-tasks-message");
const deleteAllButton = document.querySelector(".delete-all");
const all = document.querySelector("#all");
const completed = document.querySelector("#completed");
const assigned = document.querySelector("#assigned");
const form = document.querySelector("#form");
const toast = document.querySelector("#toast");
const toastMessage = document.querySelector("#toast-message");
const toastConfirm = document.querySelector("#toast-confirm");
const toastCancel = document.querySelector("#toast-cancel");
const overlay = document.querySelector(".overlay");

//event-listeners
deleteAllButton.addEventListener("click", deleteAllTasks);
form.addEventListener("submit", addTask);
inputBox.addEventListener("input", () => {
    errormessage.innerHTML = "";
});
inputBox.addEventListener("focus", () => {
    errormessage.innerHTML = "";
});
all.addEventListener("change", () => {
    currentFilter = "all";
    allTasks();
});
completed.addEventListener("change", () => {
    currentFilter = "completed";
    completedTasks();
});
assigned.addEventListener("change", () => {
    currentFilter = "assigned";
    assignedTasks();
});

let currentFilter = "all";
checkForEmptyStates(currentFilter);
document.addEventListener("DOMContentLoaded", loadTasksFromLocalStorage);

//function to create the tasks
function createshowtasks1(taskStatus) {
    const showtasks1 = document.createElement("div");
    showtasks1.classList.add("showtasks1");
    showtasks.append(showtasks1);
    showtasks1.state = taskStatus === "completed" ? 1 : 0;
    showtasks1.setAttribute("data-status", taskStatus);
    return showtasks1;
}

//function to get the taskname from the input form
function createTaskName(showtasks1, taskName) {
    const taskname = document.createElement("input");
    taskname.classList.add("taskname");
    taskname.value = taskName;
    taskname.readOnly=true;
    taskname.maxLength=150;
    if (showtasks1.state === 1) {
        taskname.style.backgroundColor = "#D0D0D0";
    }
    showtasks1.append(taskname); 
}
//function to create the buttons
function createButton(buttonClass, imgSource, imgClass,title) {
    const button = document.createElement("button");
    button.classList.add(buttonClass);
    button.title=title;
    const img = document.createElement("img");
    img.src = imgSource;
    img.classList.add(imgClass);
    button.append(img);
    return button;
}
//function to create the edit,check and delete button
function createTaskButtons(showtasks1) {
    const buttons = document.createElement("div");
    buttons.classList.add("buttons");
    showtasks1.append(buttons);

    const editButton = createButton("editbtn", "./images/edit.png", "editbtni","Edit the task");
    editButton.addEventListener("click", ()=> { editTask(showtasks1); });
    buttons.append(editButton);

    const checkButton = createButton("checkbtn", "./images/radio-button.png", "checkbtni","Complete the task");
    checkButton.addEventListener("click", ()=> { completeTask(showtasks1); });
    buttons.append(checkButton);
    
    const deleteButton = createButton("deletebtn", "./images/bin.png", "deletebtni","Delete the task");
    deleteButton.addEventListener("click", ()=> { deleteTask(showtasks1); });
    buttons.append(deleteButton);
}
// function to validate the input in the inputbox and call the above functions
function addTask(e) {
    e.preventDefault();
    const taskValue = inputBox.value.trim();
    if (taskValue === "") {
        errormessage.style.color="red";
        errormessage.innerHTML = "Taskname cannot be empty.";
        setTimeout(() => {
            errormessage.innerHTML="";
        }, 1800);
    } else if (inputBox.value.charAt(0) === " ") {
        errormessage.style.color="red";
        errormessage.innerHTML = "Taskname cannot start with a space.";
        setTimeout(() => {
            errormessage.innerHTML="";
        }, 1800);
    } else {
        const showtasks1 = createshowtasks1("assigned");
        createTaskName(showtasks1, taskValue);
        createTaskButtons(showtasks1);
        errormessage.style.color="green";
        errormessage.innerHTML="Task added successfully";
        setTimeout(() => {
            errormessage.innerHTML="";
        }, 1500);
        inputBox.value = "";
        saveTasksToLocalStorage();
        currentFilter = "all";
        document.querySelector("#all").checked = true;
        allTasks();
        checkForEmptyStates(currentFilter);
    }
}
// function that facilitates edit of the task
let currentlyEditedTask = null;
function editTask(showtasks1) {
    const taskname = showtasks1.querySelector(".taskname");
    const cb = showtasks1.querySelector(".checkbtn");
    const eb = showtasks1.querySelector(".editbtn");
    const db = showtasks1.querySelector(".deletebtn");
    const ebi = eb.querySelector(".editbtni");

    function saveIfValid() {
        if (taskname.value.trim() === '') {
            taskname.classList.add("error");
            taskname.placeholder = 'Task cannot be empty!';
            taskname.value = '';
            return false;
        }
        return true;
    }

    function saveTask() {
        if (saveIfValid()) {
            taskname.readOnly = true;
            taskname.blur();
            taskname.style.outline = 'none';
            cb.disabled = false;
            db.disabled = false;
            deleteAllButton.disabled = false;
            inputBox.disabled = false;
            inputButton.disabled = false;
            ebi.src = "./images/edit.png";
            eb.title = "Edit the task";
            saveTasksToLocalStorage();
            currentlyEditedTask = null;
        }
    }

    if (taskname.readOnly) {
        if (currentlyEditedTask && currentlyEditedTask !== showtasks1) {
            return;
        }
        taskname.readOnly = false;
        taskname.focus();
        taskname.style.outline = '2px solid #413f64';
        taskname.classList.remove("error");
        cb.disabled = true;
        db.disabled = true;
        deleteAllButton.disabled = true;
        inputBox.disabled = true;
        inputButton.disabled = true;
        eb.title = "Save the task";
        ebi.src = "./images/diskette.png";
        currentlyEditedTask = showtasks1;
    } else {
        saveTask();
    }

    taskname.addEventListener("focus", () => {
        taskname.classList.remove("error");
        taskname.placeholder = '';
    });

    taskname.addEventListener("input", () => {
        if (taskname.classList.contains("error")) {
            taskname.classList.remove("error");
            taskname.placeholder = '';
        }
    });

    taskname.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
            saveTask();
        }
    });
}
// Function which facilitates completion of tasks
function completeTask(showtasks1) {
    const eb = showtasks1.querySelector(".editbtn");
    const cb = showtasks1.querySelector(".checkbtn");
    const cbi = cb.querySelector(".checkbtni");
    const currentStatus = showtasks1.getAttribute("data-status");

    if (currentStatus === "assigned") {
        showtasks1.querySelector(".taskname").style.backgroundColor = "#D0D0D0";
        showtasks1.setAttribute("data-status", "completed");
        cbi.src = "./images/check-mark.png";
        cb.title = "Undo task completion";
        eb.disabled = true;
    } else {
        showtasks1.querySelector(".taskname").style.backgroundColor = "aliceblue";
        showtasks1.setAttribute("data-status", "assigned");
        cbi.src = "./images/radio-button.png";
        cb.title = "Complete the task";
        eb.disabled = false;
    }
    saveTasksToLocalStorage();

    if (currentFilter === "all") {
        allTasks();
    } else if (currentFilter === "completed") {
        completedTasks();
    } else if (currentFilter === "assigned") {
        assignedTasks();
    }

    checkForEmptyStates(currentFilter);
}

//function which facilitates  deleting the task
function deleteTask(showtasks1) {
    showtasks1.remove();
    saveTasksToLocalStorage();
    if (currentFilter === "all") {
        allTasks();
    } else if (currentFilter === "completed") {
        completedTasks();
    } else if (currentFilter === "assigned") {
        assignedTasks();
    }
}
// Function to show toast notification
function showToast(message, onConfirm, onCancel) {
    toastMessage.textContent = message;
    toast.style.display = "flex"; 
    toast.style.flexDirection="column";
    overlay.style.display = "block";
    // Handle confirm
    toastConfirm.onclick = () => {
        overlay.style.display = "none";
        toast.style.display = "none";
        if (onConfirm) onConfirm();
    };

    // Handle cancel
    toastCancel.onclick = () => {
        overlay.style.display = "none";
        toast.style.display = "none";
        if (onCancel) onCancel();
    };

    setTimeout(() => {
        toast.style.display = "none";
        overlay.style.display = "none";
        if (onCancel) onCancel();
    }, 10000); 
}

// Function to delete all tasks based on the current filter
function deleteAllTasks() {
    let message;
    
    if (currentFilter === "all") {
        message = "Do you want to delete all tasks?";
    } else if (currentFilter === "assigned") {
        message = "Do you want to delete all assigned tasks?";
    } else if (currentFilter === "completed") {
        message = "Do you want to delete all completed tasks?";
    }
    showToast(message, () => {
        const taskContainers = document.querySelectorAll(".showtasks1");
        let tasksToRemove = [];

        if (currentFilter === "all") {
            tasksToRemove = Array.from(taskContainers);
        } else if (currentFilter === "assigned") {
            tasksToRemove = Array.from(taskContainers).filter(task => task.getAttribute("data-status") === "assigned");
        } else if (currentFilter === "completed") {
            tasksToRemove = Array.from(taskContainers).filter(task => task.getAttribute("data-status") === "completed");
        }

        if (tasksToRemove.length > 0) {
            tasksToRemove.forEach(task => task.remove());
            saveTasksToLocalStorage();
            checkForEmptyStates(currentFilter);
            errormessage.style.color = "green";
            errormessage.innerHTML = "Tasks deleted successfully.";
            setTimeout(() => {
                errormessage.innerHTML = "";
            }, 1500);
        } 
    });
}
function updateDeleteAllButtonText(currentFilter){
    if(currentFilter==="all"){
        deleteAllButton.innerHTML="Delete all tasks";
    } else if(currentFilter==="assigned"){
        deleteAllButton.innerHTML="Delete all assigned tasks";
        deleteAllButton.title="Delete all assigned tasks";
    } else if(currentFilter==="completed"){
        deleteAllButton.innerHTML="Delete all completed tasks";
        deleteAllButton.title="Delete all completed tasks";
    }
}

//function to show tasks in all section
function allTasks() {
    const taskContainers = document.querySelectorAll(".showtasks1");
    taskContainers.forEach(task => {
        task.style.display = "flex";
    });
    checkForEmptyStates("all");
    updateDeleteAllButtonText("all");
}
//function to show tasks in completed section 
function completedTasks() {
    const taskContainers = document.querySelectorAll(".showtasks1");
    taskContainers.forEach(task => {
        const status = task.getAttribute("data-status");
        if (status === "completed") {
            task.style.display = "flex";
        } else {
            task.style.display = "none";
        }
    });
    checkForEmptyStates("completed");
    updateDeleteAllButtonText("completed");
}
//function to show tasks in assigned section
function assignedTasks() {
    const taskContainers = document.querySelectorAll(".showtasks1");
    taskContainers.forEach(task => {
        const status = task.getAttribute("data-status");
        if (status === "assigned") {
            task.style.display = "flex";
        }  else  {
            task.style.display = "none";
        }
    });
    checkForEmptyStates("assigned");
    updateDeleteAllButtonText("assigned");
}
// Function to show "no task" messages and disable the delete all button
function checkForEmptyStates(filter) {
    const taskContainers = document.querySelectorAll(".showtasks1");
    let hasTasks = false;
    let hasFilteredTasks = false;

    taskContainers.forEach(task => {
        const status = task.getAttribute("data-status");
        if (status === "assigned" || status === "completed") {
            hasTasks = true;
            if (filter === "all" || status === filter) {
                hasFilteredTasks = true;
            }
        }
    });

    noTasksMessage.style.display = "none";
    noCompletedTasksMessage.style.display = "none";
    noAssignedTasksMessage.style.display = "none";
    deleteAllButton.disabled = true; 

    if (!hasTasks) {
        noTasksMessage.style.display = "block";
    } else if (filter === "completed" && !hasFilteredTasks) {
        noCompletedTasksMessage.style.display = "block";
    } else if (filter === "assigned" && !hasFilteredTasks) {
        noAssignedTasksMessage.style.display = "block";
    } else {
        deleteAllButton.disabled = false; 
    }
}

// function to store data in local storage
function saveTasksToLocalStorage() {
    const tasks = [];
    const taskContainers = document.querySelectorAll(".showtasks1");
    taskContainers.forEach(task => {
        const taskName = task.querySelector(".taskname").value;
        const taskStatus = task.getAttribute("data-status");
        tasks.push({ name: taskName, status: taskStatus });
    });
    localStorage.setItem("tasks", JSON.stringify(tasks));
}
//function to load the data from the local storage
function loadTasksFromLocalStorage() {
    const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    tasks.forEach(task => {
        const showtasks1 = createshowtasks1(task.status);
        createTaskName(showtasks1, task.name);
        createTaskButtons(showtasks1);
        const taskNameInput = showtasks1.querySelector(".taskname");
        const checkButtonImg = showtasks1.querySelector(".checkbtni");
        const editButton = showtasks1.querySelector(".editbtn");

        if (task.status === "completed") {
            taskNameInput.style.backgroundColor = "#D0D0D0";
            checkButtonImg.src = "./images/check-mark.png";
            showtasks1.querySelector(".checkbtn").title = "Undo task completion";
            editButton.disabled = true;
        } else {
            taskNameInput.style.backgroundColor = "aliceblue";
            checkButtonImg.src = "./images/radio-button.png";
            showtasks1.querySelector(".checkbtn").title = "Complete the task";
            editButton.disabled = false;
        }
    });
    checkForEmptyStates(currentFilter);
}