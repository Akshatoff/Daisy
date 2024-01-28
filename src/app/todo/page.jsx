'use client'

import { useState, useEffect } from "react";
import Popup from './popup';
import '@fortawesome/fontawesome-svg-core/styles.css'; // import the styles
import { config } from '@fortawesome/fontawesome-svg-core';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faSun } from '@fortawesome/free-solid-svg-icons';

library.add(faSun);
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

// config.autoAddCss = false; // disable automatic styles injection

const Page = () => {


    const [showPopup, setShowPopup] = useState(false);
    const [editItemId, setEditItemId] = useState(null);
const [editTaskId, setEditTaskId] = useState(null);
const [editItemText, setEditItemText] = useState("");
const [editTaskText, seteditTaskText] = useState("");
const [newTask1, setnewTask1] = useState("")

  const togglePopup = () => {
    setShowPopup(!showPopup);

    }
    const [newItem, setNewItem] = useState("");
    const [todos, SetTodos] = useState([])
     
    useEffect(() => {
      // Initialize 'todos' from localStorage
      const localValue = localStorage.getItem("ITEMS");
      SetTodos(localValue ? JSON.parse(localValue) : []);
    }, []);
      

const [taskarr, Settaskarr] = useState([])

useEffect(() => {
  // Initialize 'taskarr' from localStorage
  const localTaskValue = localStorage.getItem("TASK");
  Settaskarr(localTaskValue ? JSON.parse(localTaskValue) : []);
}, []);



    useEffect(() => {
     
        localStorage.setItem("ITEMS", JSON.stringify(todos))
      }
      , [todos])
  
    useEffect(() => {
     
      localStorage.setItem("TASK", JSON.stringify(taskarr))
      }
    , [taskarr])

    useEffect(() => {
      
     
      const uncheckCompletedTasks = () => {
        Settaskarr((currentDailyTask) => {
          return currentDailyTask.map((task) => {
            return { ...task, completed: false };
          });
        });
      };
  
     
      const intervalId = setInterval(uncheckCompletedTasks, 24 * 60 * 60 * 1000);
  
      
      return () => clearInterval(intervalId);
    }
    , []);

    function Submithandle(e) {
      e.preventDefault();

      const newTask = {
        id: crypto.randomUUID(),
        title: newItem,
        completed: false,
      };
    
      SetTodos((currentTodos) => [
        ...currentTodos,
        newTask,
      ]);
        setNewItem("")
       
    }

    function Submithandle1(e) {
      e.preventDefault();

      const newDailyTask = {
        id: crypto.randomUUID(),
        title: newTask1,
        completed: false,
      };
    
      Settaskarr((currentDailyTask) => [
        ...currentDailyTask,
        newDailyTask,
      ]);
        setnewTask1("")
        console.log("I wanna die")
       
    }

    function toggleTodo(id, completed) {
        SetTodos(currentTodos => {
            return currentTodos.map(todo => {
                if (todo.id === id) {
                
                    return {...todo, completed}
                }
                return todo
            })
        })
    }

    function toggleTask(id, completed) {
      Settaskarr(currentDailyTask => {
          return currentDailyTask.map(task => {
              if (task.id === id) {
              
                  return {...task, completed}
              }
              return task
          })
      })
  }

    function DeleteTodo(id) {
        SetTodos(currentTodos => {
            return currentTodos.filter(todo => todo.id !== id)
        })
    }

     

    function DeleteTodo1(id) {
      Settaskarr(currentTodos => {
          return currentTodos.filter(todo => todo.id !== id)
      })
  }

    function ClearTodos() {
      localStorage.removeItem("ITEMS")
      window.location.reload();
  }
  

    function startEdit(id, text) {
        setEditItemId(id);
        setEditItemText(text);
      }

      function startEdit1(id, text) {
        setEditTaskId(id);
        seteditTaskText(text);
      }
      
      function saveEdit(id) {
        if (editItemText.trim() === "") {
          // Don't save empty todo items
          return;
        }
      
        SetTodos((currentTodos) => {
          return currentTodos.map((todo) => {
            if (todo.id === id) {
              return { ...todo, title: editItemText };
              
            }
            return todo;
          });
        });
      
        // Reset editing state
        setEditItemId(null);
        setEditItemText("");
      }

      function saveEditTask (id) {
        if (editTaskText.trim() === "") {
          // Don't save empty todo items
          return;
        }
      
        Settaskarr((currentDailyTask) => {
          return currentDailyTask.map((task) => {
            if (task.id === id) {
              return { ...task, title: editTaskText };
              
            }
            return task;
          });
        });
      
        // Reset editing state
        setEditTaskId(null);
        seteditTaskText("");
      }
      
  return (
    
    
    <div className="todos">

      <div className="daily" >
    <FontAwesomeIcon icon={faSun} className='sun' onClick={togglePopup}/> 
    <Popup show={showPopup} handleClose={togglePopup}>
    <h1 className="heading-todos-daily">Daily To-Do</h1>
    <form onSubmit={Submithandle1} className="todo-form-daily">
        
        <div className="form-row-daily">
            <input value = {newTask1} onChange = {e => setnewTask1(e.target.value)} type="text" name="Input" id="task" placeholder='Please Enter Your Todo '/>
            <button className="btn add">Add Task</button>
            
        </div>

      </form>
      <h2 className='sub-heading-daily'>Daily Tasks:</h2>
          <ul>
          
          
        {taskarr.map((task) => {
    const isEditing1 = editTaskId === task.id;

  return (
    <li key={task.id} className='daily-task'>
      {isEditing1 ? (
        <div className="edit-todo">
          <input
            id='editinput'
            type="text"
            value={editTaskText}
            onChange={(e) => seteditTaskText(e.target.value)}
          />
          <button className="btn save-daily" onClick={() => saveEditTask(task.id)}>
            Save
          </button>
        </div>
      ) : (
        <label htmlFor="" className="completed-todo">
          <input
            type="checkbox"
            onChange={(e) => toggleTask(task.id, e.target.checked)}
            checked={task.completed}
            name="Task Completed"
            id="checkbox"
          />
          <h2 className="todo-list-items">{task.title}</h2>
          <button className="btn delete-daily" onClick={() => DeleteTodo1(task.id)}>
            Delete
          </button>
          <button className="btn edit-daily" onClick={() => startEdit1(task.id, task.title)}>
            Edit
          </button>
        </label>
      )}
    </li>
    
  );
})}
          </ul>
      
      </Popup>
    </div>

    
      <h1 className="heading-todos">To-Do</h1>
        
      <form onSubmit={Submithandle} className="todo-form">
        
        <div className="form-row">
            <input value = {newItem} onChange = {e => setNewItem(e.target.value)} type="text" name="Input" id="task" placeholder='Please Enter Your Todo '/>
            <button className="btn add">Add Task</button>
            
        </div>

      </form>
      <button className="btn clear" onClick={ClearTodos}>Clear Task</button>
      <h1 className="sub-heading">Current Todos</h1>
      <ul className="todo-list">
        {todos.length === 0 && "No Todos"}


        {todos.map((todo) => {
  const isEditing = editItemId === todo.id;

  return (
    <li key={todo.id}>
      {isEditing ? (
        <div className="edit-todo">
          <input
            id='editinput'
            type="text"
            value={editItemText}
            onChange={(e) => setEditItemText(e.target.value)}
          />
          <button className="btn save" onClick={() => saveEdit(todo.id)}>
            Save
          </button>
        </div>
      ) : (
        <label htmlFor="" className="completed-todo">
          <input
            type="checkbox"
            onChange={(e) => toggleTodo(todo.id, e.target.checked)}
            checked={todo.completed}
            name="Task Completed"
            id="checkbox"
          />
          <h2 className="todo-list-items">{todo.title}</h2>
          <button className="btn delete" onClick={() => DeleteTodo(todo.id)}>
            Delete
          </button>
          <button className="btn edit" onClick={() => startEdit(todo.id, todo.title)}>
            Edit
          </button>
        </label>
      )}
    </li>
    
  );
})}
        
       
      </ul>
    </div>
    )
}

export default Page