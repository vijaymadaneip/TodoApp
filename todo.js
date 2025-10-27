
//for editing the task
let editIndex = null;


//DOM elements
const todoForm = document.getElementById("todoForm");
const taskList = document.getElementById("taskList");

//Right column lists
const pendingList = document.getElementById("pendingList");
const inprocessList = document.getElementById("inprocessList");
const completedList = document.getElementById("completedList");



//Load tasks on page load so data fetched from local stoarage
document.addEventListener("DOMContentLoaded", loadAllTasks);



//logic for form submisson 
todoForm.addEventListener("submit", function (event) {
  event.preventDefault();

  const title = document.getElementById("taskTitle").value.trim();
  const desc = document.getElementById("taskDesc").value.trim();
  const date = document.getElementById("taskDate").value.trim();
  const status = document.getElementById("taskStatus").value;

  if (!title || !desc || !date || status === "Select") {
    alert("Please fill in all fields!");
    return;
  }

  const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  //Update existing task
  if (editIndex !== null) {
    tasks[editIndex] = { title, desc, date, status };
    editIndex = null;
    alert("Task edited successfully!");
  } else {
    // tasks.push({ title, desc, date, status });  // Add new task
    tasks.unshift({ title, desc, date, status });  // Adds task at the BEGINNING

    alert("Task added successfully!");
  }

  localStorage.setItem("tasks", JSON.stringify(tasks));
  todoForm.reset();
  loadAllTasks();
});



//Creating a draggable task card 
function createTaskCard(task, index) {
  const col = document.createElement("div");
  col.classList.add("col");

  const card = document.createElement("div");
  card.classList.add("todo-card", "d-flex", "justify-content-between", "align-items-center");
  card.setAttribute("draggable", "true");
  card.dataset.index = index;

  card.innerHTML = `
        <div class="d-flex align-items-center">
            <div class="todo-text">
                <h6>${task.title}</h6>
                <p>${task.desc}</p>
                <small>${task.date} | Status: ${task.status}</small>
            </div>
        </div>
        <div class="action-buttons d-flex flex-column gap-2 ms-3">
            <button class="btn-edit"><i class="fa-solid fa-pencil"></i></button>
            <button class="btn-delete"><i class="fa-solid fa-trash"></i></button>
        </div>
    `;

  //Event: Drag card

  // for starting draging
  card.addEventListener("dragstart", (event) => {
    event.dataTransfer.setData("text/plain", index);
    setTimeout(() => {
      card.style.opacity = "0.5";
    }, 0);
  });

  //draggin stop
  card.addEventListener("dragend", () => {
    card.style.opacity = "1";
  });

  //--- Edit button ---
  card.querySelector(".btn-edit").addEventListener("click", () => {
    document.getElementById("taskTitle").value = task.title;
    document.getElementById("taskDesc").value = task.desc;
    document.getElementById("taskDate").value = task.date;
    document.getElementById("taskStatus").value = task.status;
    editIndex = index;
  });

  //--- Delete button ---
  card.querySelector(".btn-delete").addEventListener("click", () => deleteTask(index));
  col.appendChild(card);
  return col;
}




//Load all tasks and render
function loadAllTasks() {
  taskList.innerHTML = "";
  pendingList.innerHTML = "";
  inprocessList.innerHTML = "";
  completedList.innerHTML = "";

  const tasks = JSON.parse(localStorage.getItem("tasks")) || [];

  if (tasks.length === 0) {
    taskList.innerHTML = `<p class="text-muted text-center">No tasks yet.</p>`;
    pendingList.innerHTML = `<p class="empty-text">No Pending Tasks</p>`;
    inprocessList.innerHTML = `<p class="empty-text">No Inprocess Tasks</p>`;
    completedList.innerHTML = `<p class="empty-text">No Completed Tasks</p>`;
    return;
  }

  tasks.forEach((task, index) => {
    // Left column all task list below our input from user
    const leftCard = createTaskCard(task, index);
    taskList.appendChild(leftCard);

    // Right column list of task based on the status
    let rightCol;
    switch (task.status) {
      case "Pending":
        rightCol = pendingList;
        break;
      case "Inprocess":
        rightCol = inprocessList;
        break;
      case "Completed":
        rightCol = completedList;
        break;
      default:
        return;
    }
    rightCol.appendChild(createTaskCard(task, index));
  });

  // Show placeholder if section empty
  if (pendingList.children.length === 0)
    pendingList.innerHTML = `<p class="empty-text">No Pending Tasks</p>`;
  if (inprocessList.children.length === 0)
    inprocessList.innerHTML = `<p class="empty-text">No Inprocess Tasks</p>`;
  if (completedList.children.length === 0)
    completedList.innerHTML = `<p class="empty-text">No Completed Tasks</p>`;
}

// Delete task
function deleteTask(index) {
  const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  tasks.splice(index, 1);
  localStorage.setItem("tasks", JSON.stringify(tasks));
  alert("Task deleted successfully!");
  loadAllTasks();
}

// Drag and Drop handling for right column
[pendingList, inprocessList, completedList].forEach((list) => {

  list.addEventListener("dragover", (event) => {
    event.preventDefault();
    list.classList.add("drag-over");
  });

  list.addEventListener("dragleave", () => {
    list.classList.remove("drag-over");
  });


  list.addEventListener("drop", (event) => {
    event.preventDefault();
    list.classList.remove("drag-over");

    const index = event.dataTransfer.getData("text/plain");             //which task was dragged by their index 
    const tasks = JSON.parse(localStorage.getItem("tasks")) || [];      //get all data from local stoarge
    const task = tasks[index];                                          //using specfic index extract object
    if (!task) return;

    // Update task status based on drop target
    if (list.id === "pendingList") task.status = "Pending";
    else if (list.id === "inprocessList") task.status = "Inprocess";
    else if (list.id === "completedList") task.status = "Completed";

    localStorage.setItem("tasks", JSON.stringify(tasks));
    loadAllTasks();
  });
});
