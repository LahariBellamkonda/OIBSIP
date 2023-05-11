document.addEventListener("DOMContentLoaded", function () {
    const taskInput = document.getElementById("task-input");
    const addButton = document.getElementById("add-button");
    const taskList = document.getElementById("task-list");
    const filterButtons = document.querySelectorAll(".filter-button");
    let tasks = [];
  
    addButton.addEventListener("click", addTask);
    taskList.addEventListener("click", handleTaskClick);
    taskList.addEventListener("dragstart", handleDragStart);
    taskList.addEventListener("dragover", handleDragOver);
    taskList.addEventListener("drop", handleDrop);
    taskList.addEventListener("dragend", handleDragEnd);
    filterButtons.forEach((button) =>
      button.addEventListener("click", handleFilterClick)
    );
  
    loadTasks();
  
    function addTask() {
      const taskText = taskInput.value.trim();
  
      if (taskText !== "") {
        const taskItem = createTaskItem(taskText);
        taskList.appendChild(taskItem);
        tasks.push({ text: taskText, completed: false });
        saveTasks();
        taskInput.value = "";
      }
    }
  
    function createTaskItem(taskText) {
      const taskItem = document.createElement("li");
      taskItem.draggable = true;
      taskItem.dataset.taskText = taskText;
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      const taskTextElement = document.createElement("span");
      taskTextElement.textContent = taskText;
      const deleteButton = document.createElement("button");
      deleteButton.textContent = "Delete";
      deleteButton.classList.add("delete-button");
  
      taskItem.appendChild(checkbox);
      taskItem.appendChild(taskTextElement);
      taskItem.appendChild(deleteButton);
  
      return taskItem;
    }
  
    function handleTaskClick(event) {
      const target = event.target;
  
      if (target.type === "checkbox") {
        const taskItem = target.parentNode;
        const taskText = taskItem.dataset.taskText;
        const task = tasks.find((t) => t.text === taskText);
        task.completed = target.checked;
        saveTasks();
        taskItem.classList.toggle("completed");
      } else if (target.classList.contains("delete-button")) {
        const taskItem = target.parentNode;
        const taskText = taskItem.dataset.taskText;
        tasks = tasks.filter((t) => t.text !== taskText);
        saveTasks();
        taskList.removeChild(taskItem);
      }
    }
  
    function handleDragStart(event) {
      event.dataTransfer.effectAllowed = "move";
      event.dataTransfer.setData("text/plain", event.target.dataset.taskText);
      event.target.classList.add("dragging");
    }
  
    function handleDragOver(event) {
      event.preventDefault();
      event.dataTransfer.dropEffect = "move";
      const afterElement = getDragAfterElement(event.clientY);
      const draggable = document.querySelector(".dragging");
      if (afterElement == null) {
        taskList.appendChild(draggable);
      } else {
        taskList.insertBefore(draggable, afterElement);
      }
    }
  
    function handleDrop(event) {
      event.preventDefault();
      const droppedText = event.dataTransfer.getData("text/plain");
      const taskText = event.target.dataset.taskText;
      const droppedIndex = tasks.findIndex((t) => t.text === droppedText);
      const targetIndex = tasks.findIndex((t) => t.text === taskText);
      const temp = tasks[droppedIndex];
      tasks[droppedIndex] = tasks[targetIndex];
      tasks[targetIndex] = temp;
      saveTasks();
    }
  
    function handleDragEnd(event) {
      event.target.classList.remove("dragging");
    }
  
    function handleFilterClick(event) {
      const filter = event.target.dataset.filter;
      filterTasks(filter);
      updateActiveFilter(filter);
    }
  
    function filterTasks(filter) {
      const filteredTasks = tasks.filter((task) => {
        if (filter === "active") {
          return !task.completed;
        } else if (filter === "completed") {
          return task.completed;
        }
        return true; // 'all' filter
      });
      clearTaskList();
      displayTasks(filteredTasks);
    }
  
    function updateActiveFilter(filter) {
      filterButtons.forEach((button) => {
        if (button.dataset.filter === filter) {
          button.classList.add("active");
        } else {
          button.classList.remove("active");
        }
      });
    }
  
    function getDragAfterElement(y) {
      const draggableElements = [
        ...document.querySelectorAll(".dragging:not(.completed)"),
      ];
      return draggableElements.reduce(
        (closest, child) => {
          const box = child.getBoundingClientRect();
          const offset = y - box.top - box.height / 2;
          if (offset < 0 && offset > closest.offset) {
            return { offset: offset, element: child };
          } else {
            return closest;
          }
        },
        { offset: Number.NEGATIVE_INFINITY }
      ).element;
    }
  
    function clearTaskList() {
      taskList.innerHTML = "";
    }
  
    function displayTasks(tasksToDisplay) {
      tasksToDisplay.forEach((task) => {
        const taskItem = createTaskItem(task.text);
        if (task.completed) {
          taskItem.classList.add("completed");
          taskItem.querySelector('input[type="checkbox"]').checked = true;
        }
        taskList.appendChild(taskItem);
      });
    }
  
    function saveTasks() {
      localStorage.setItem("tasks", JSON.stringify(tasks));
    }
  
    function loadTasks() {
      const savedTasks = localStorage.getItem("tasks");
      if (savedTasks) {
        tasks = JSON.parse(savedTasks);
        displayTasks(tasks);
      }
    }
  });