import { v4 as uuidV4 } from "uuid" //v4 е функция за генериране на ID от библиотека uuid
import toastr from 'toastr';

type Task = { //тук дефинираме типа Task ,който описва структурата на един обект 'task'
  id: string,
  title: string,
  completed: boolean,
  createdAt: Date,
  dueDate?: Date,
  notified: boolean,
}
const dueDateInput = document.getElementById("new-task-due-date") as HTMLInputElement | null;
const list = document.querySelector<HTMLUListElement>("#list") //намира html елемент който е <ul> ,това ще бъде списъка
const form = document.getElementById("new-task-form") as HTMLFormElement | null //намира html формата със следното id и го типизира като FormElement
const input = document.querySelector<HTMLInputElement>("#new-task-title") // намира текстово поле за въвеждане на заглавието на нова заздача, пак с id

const tasks: Task[] = loadTasks() //зареждаме всички запазени от localStorage
tasks.forEach(addListItem) //създава масив от задачи и за всяка задача извикваме функцията(addL.item) за да я добавим към списъка в интерфейса

form?.addEventListener("submit", e => { //проверяваме дали form съществува ,ако да изпълняваме това което следва,когато искаме нова задача
  e.preventDefault() //предотвратява презареждането на страницата (по подразбиране това се случва при изпращане на форма).

  if (input?.value == "" || input?.value == null) return//ако полето инпут е празно, прекратяваме кода за да не добавяме празна задача

  if (dueDateInput) { // Проверяваме дали dueDateInput не е null
    const dueDateValue = dueDateInput.value ? new Date(dueDateInput.value) : undefined;

    const newTask: Task = { //създаване на нова задача от тип Task със следните свойства
      id: uuidV4(),
      title: input.value,
      completed: false,
      createdAt: new Date(),
      dueDate: dueDateValue,
      notified: false,
    }
    tasks.push(newTask) //добавя нова задача в масива tasks
    saveTasks() //извиква функцията за да запази задачите в локалното хранилище

    addListItem(newTask) //добавя задачата към html списъка 
    input.value = "" //изчиства полето за въвеждане
    if (dueDateInput) {
      dueDateInput.value = "";
      dueDateInput.style.display = "none"
    }
  }
});

function addListItem(task: Task) {
  const item = document.createElement("li") //създава нов li елемент
  const label = document.createElement("label") //създава нов label елемент
  const checkbox = document.createElement("input") //създава нов input елемент от тип чекбокс
  const deleteButton = document.createElement("button") //създаваме елемент бутон
  checkbox.addEventListener("change", () => { //клик функция към чекбокса която променя състоянието на задачата (completed)
    task.completed = checkbox.checked
    saveTasks()
  })

  deleteButton.textContent = "🗑️" //контекства на бутона
  deleteButton.classList.add("delete-btn") //стила на бутона
  deleteButton.addEventListener("click", () => {
    item.remove() //премахва елемента от дом незабавно
    deleteTask(task.id) //след това изтрива задачата от масива и запазва
  })

  label.append(checkbox, task.title);

  if (task.dueDate) {
    const dueDateElement = document.createElement("span");
    dueDateElement.textContent = ` Due: ${task.dueDate?.toLocaleDateString()}`;
    dueDateElement.classList.add("due-date");
    label.append(dueDateElement);
  }
  
  item.append(label, deleteButton);
  list?.append(item);

  checkbox.type = "checkbox" //задава типа на елемента, което го прави отметка в html
  checkbox.checked = task.completed //определя дали чекбокса трябва да бъде отметнат като решава дали task.complete = true OR false


  if (task.dueDate) {
    const dueDateElement = document.createElement("span");
    dueDateElement.textContent = ` Due: ${task.dueDate?.toLocaleDateString()}`;
    dueDateElement.classList.add("due-date");
    label.append(dueDateElement)
  }
  item.append(label, deleteButton) //добавя label елемент ,това прави списъка един цялостен елемент
  list?.append(item) //и по този начин задачата се визоализира в html

}

function saveTasks() { //запазва задачите в локалното хранилище, като ги преобразува в JSON стринг със stringify
  localStorage.setItem("TASKS", JSON.stringify(tasks))
}

function loadTasks(): Task[] { //зарежда задачите от локалното хранилище
  const taskJSON = localStorage.getItem("TASKS")
  if (taskJSON == null) return [] //ако няма запазени задачи връща празен масив
  return JSON.parse(taskJSON).map((task: Task) => ({
    ...task,
    createdAt: new Date(task.createdAt),
    dueDate: task.dueDate ? new Date(task.dueDate) : undefined
  })) //преобразува JSON низа обратно в обекти с parse
}

function deleteTask(id: string) {
  const taskIndex = tasks.findIndex(task => task.id === id)
  if (taskIndex !== -1) {
    tasks.splice(taskIndex, 1)
    saveTasks()
  }
}

function filterTasks(filterType: 'all' | 'active' | 'completed', sortBy: 'dueDate'
  | 'createdAt' = 'dueDate') {
  if (list) {
    list.innerHTML = "";

    let filterTask: Task[];
    if (filterType === 'active') {
      filterTask = tasks.filter(task => !task.completed);
    } else if (filterType === 'completed') {
      filterTask = tasks.filter(task => task.completed);
    } else {
      filterTask = tasks;
    }

    filterTask.sort((a, b) => {
      const dateA = a.dueDate ? a.dueDate.getTime() : a.createdAt.getTime();
      const dateB = b.dueDate ? b.dueDate.getTime() : b.createdAt.getTime();
      return dateA - dateB;
    });

    filterTask.forEach(addListItem)
  } else {
    console.error("List element not found");
  }
}

document.getElementById('filter-all')?.addEventListener('click', () => {
  filterTasks('all', 'dueDate');
  updateActiveFilter('filter-all');
});
document.getElementById('filter-active')?.addEventListener('click', () => {
  filterTasks('active', 'dueDate');
  updateActiveFilter('filter-active');
});
document.getElementById('filter-completed')?.addEventListener('click', () => {
  filterTasks('completed', 'dueDate');
  updateActiveFilter('filter-completed');
});

function updateActiveFilter(activeId: string) {
  document.querySelectorAll('.filter-btn').forEach(button => {
    button.classList.remove('active');
  });
  document.getElementById(activeId)?.classList.add('active');
}

document.getElementById("toggle-theme")?.addEventListener("click", () => {
  console.log("Toggle Theme button clicked");
  document.body.classList.toggle("dark-mode");
  const isDarkMode = document.body.classList.contains("dark-mode");
  localStorage.setItem("dark-mode", isDarkMode ? "enabled" : "disabled");
});

document.addEventListener("DOMContentLoaded", () => {
  const darkMode = localStorage.getItem("dark-mode")
  if (darkMode === "enabled") {
    document.body.classList.add("dark-mode")
  }
  filterTasks('all', 'dueDate')
});

document.querySelector('.calendar-icon')?.addEventListener('click', function () {
  if (dueDateInput) {
    if (dueDateInput.style.display === 'none') {
      dueDateInput.style.display = 'block'
      dueDateInput.showPicker();
    } else {
      dueDateInput.style.display = 'none'
    }
  }
})

document.getElementById('sort-by-date')?.addEventListener('click', () => {
  const activeFilter = document.querySelector('.filter-btn.active')?.id.replace('filter-', '');
  if (activeFilter) {
    filterTasks(activeFilter as 'all' | 'active' | 'completed', 'dueDate');
  } else {
    filterTasks('all', 'dueDate')
  }

  document.querySelectorAll('filter-btn').forEach(button => {
    button.classList.remove('active');
  });
  document.getElementById('sort-by-date')?.classList.add('active')
})



document.addEventListener('DOMContentLoaded', () => {
  setInterval(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()); 

    tasks.forEach(task => {
      if (task.dueDate) {
        const dueDateOnly = new Date(task.dueDate.getFullYear(), task.dueDate.getMonth(), task.dueDate.getDate());
        
        if (dueDateOnly < today && !task.completed && !task.notified) {
          task.notified = true;
          toastr.warning(`Task "${task.title}" is overdue!`, 'Attention', {
            "closeButton": false,
            "debug": false,
            "newestOnTop": false,
            "progressBar": true,
            "positionClass": "toast-top-right",
            "preventDuplicates": false,
            "showDuration": 300,
            "hideDuration": 1000,
            "timeOut": 5000,
            "extendedTimeOut": 1000,
            "showEasing": "swing",
            "hideEasing": "linear",
            "showMethod": "fadeIn",
            "hideMethod": "fadeOut"
          });
        }
      }
    });
  }, 5000);
});

