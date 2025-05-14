const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
require('dotenv').config();
const loginRoutes = require('./routes/login');
const signupRoutes = require('./routes/signup');

const app = express();


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(session({
  secret: process.env.SESSION_SECRET || '13whP5UxQjroTXK4Sn1TwoIqKdI65p4l',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false }
}));
app.set('view engine', 'ejs');
app.set('views', './views');

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

app.use('/', loginRoutes);
app.use('/', signupRoutes);

app.get('/', async (req, res) => {
  console.log('Home route, userId:', req.session.userId); 
  try {
    if (req.session.userId) {
      const User = require('./models/User');
      const user = await User.findById(req.session.userId);
      if (!user) {
        console.error('User not found for userId:', req.session.userId);
        req.session.destroy();
        return res.render('TODO', { user: undefined, message: 'Session expired, please log in again' });
      }
      res.render('TODO', { user: user.name, message: '' });
    } else {
      res.render('TODO', { user: undefined, message: '' });
    }
  } catch (error) {
    console.error('Home route error:', error);
    res.status(500).render('TODO', { user: undefined, message: 'Server error, please try again' });
  }
});


//Task route
app.get('/tasks', async (req, res) => {
  console.log('Tasks route, userId:', req.session.userId); // Debug
  try {
    if (req.session.userId) {
      const User = require('./models/User');
      const user = await User.findById(req.session.userId);
      if (!user) {
        console.error('User not found for userId:', req.session.userId);
        req.session.destroy();
        return res.redirect('/login.html?taskLogin=true');
      }
      res.render('tasks', { user: user.name, tasks: user.tasks });
    } else {
      res.redirect('/login.html?taskLogin=true');
    }
  } catch (error) {
    console.error('Tasks route error:', error);
    res.redirect('/login.html?error=server');
  }
});


//dates route
app.get('/dates', async (req, res) => {
  console.log('Dates route, userId:', req.session.userId);
  try {
    if (req.session.userId) {
      const User = require('./models/User');
      const user = await User.findById(req.session.userId);
      if (!user) {
        console.error('User not found for userId:', req.session.userId);
        req.session.destroy();
        return res.redirect('/login.html?dueLogin=true');
      }

      const datedTasks = user.datedTasks;
      res.render('dates', { user: user.name, tasks: datedTasks });
    } else {
      res.redirect('/login.html?taskLogin=true');
    }
  } catch (error) {
    console.error('Dates route error:', error);
    res.redirect('/login.html?error=server');
  }
});





// Add Task
app.post('/tasks/add', async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: 'Please log in to add tasks' });
  }
  const { text } = req.body;
  if (!text || text.trim() === '') {
    return res.status(400).json({ message: 'Task text cannot be empty' });
  }
  try {
    const User = require('./models/User');
    const user = await User.findById(req.session.userId);
    if (!user) {
      return res.status(401).json({ message: 'User not found, please log in again' });
    }
    user.tasks.push({ text: text.trim(), done: false });
    await user.save();
    res.status(201).json({ message: 'Task added', tasks: user.tasks });
  } catch (error) {
    console.error('Add Task Error:', error);
    res.status(500).json({ message: 'Error adding task' });
  }
});



// Delete Task
app.post('/tasks/delete', async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: 'Please log in to delete tasks' });
  }
  const { taskId } = req.body;
  try {
    const User = require('./models/User');
    const user = await User.findById(req.session.userId);
    if (!user) {
      return res.status(401).json({ message: 'User not found, please log in again' });
    }
    user.tasks = user.tasks.filter(task => task._id.toString() !== taskId);
    await user.save();
    res.status(200).json({ message: 'Task deleted', tasks: user.tasks });
  } catch (error) {
    console.error('Delete Task Error:', error);
    res.status(500).json({ message: 'Error deleting task' });
  }
});

// Toggle Task Done 
app.post('/tasks/toggle', async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: 'Please log in to update tasks' });
  }
  const { taskId } = req.body;
  try {
    const User = require('./models/User');
    const user = await User.findById(req.session.userId);
    if (!user) {
      return res.status(401).json({ message: 'User not found, please log in again' });
    }
    const task = user.tasks.find(task => task._id.toString() === taskId);
    if (task) {
      task.done = !task.done;
      await user.save();
      res.status(200).json({ message: 'Task updated', tasks: user.tasks });
    } else {
      res.status(404).json({ message: 'Task not found' });
    }
  } catch (error) {
    console.error('Toggle Task Error:', error);
    res.status(500).json({ message: 'Error updating task' });
  }
});

// Logout Route
app.get('/logout', (req, res) => {
  console.log('Logout called, session:', req.session.userId);

  req.session.destroy((err) => {
    if (err) {
      console.error('Logout Error:', err);
      return res.status(500).render('TODO', {
        user: undefined,
        message: 'Error logging out'
      });
    }

    console.log('Session destroyed, redirecting to Home page');
    res.set('Cache-Control', 'no-store');
    res.redirect('/');  
  });
});




//add dated task
app.post('/dates/add', async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: 'Please log in to add tasks' });
  }

  const { text, date } = req.body;
  if (!text || text.trim() === '') {
    return res.status(400).json({ message: 'Task text cannot be empty' });
  }

  try {
    const User = require('./models/User');
    const user = await User.findById(req.session.userId);
    if (!user) {
      return res.status(401).json({ message: 'User not found, please log in again' });
    }

    let dueDate = null;
    if (date) {
      dueDate = new Date(date);
      console.log('Received date:', date, 'Parsed dueDate:', dueDate);
      if (isNaN(dueDate.getTime())) {
        return res.status(400).json({ message: 'Invalid date format' });
      }
    }

    console.log('Before adding task, datedTasks:', user.datedTasks);
    user.datedTasks.push({ text: text.trim(), date: dueDate, done: false });
    await user.save();
    console.log('After adding task, datedTasks:', user.datedTasks);

    res.status(201).json({ message: 'Dated task added', tasks: user.datedTasks });
  } catch (error) {
    console.error('Add Dated Task Error:', error.stack);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: 'Validation error', errors: error.errors });
    }
    res.status(500).json({ message: 'Error adding dated task', error: error.message });
  }
});

app.post('/dates/delete', async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: 'Please log in to delete tasks' });
  }

  const { taskId } = req.body;
  if (!mongoose.Types.ObjectId.isValid(taskId)) {
    return res.status(400).json({ message: 'Invalid task ID' });
  }

  try {
    const User = require('./models/User');
    const user = await User.findById(req.session.userId);
    if (!user) {
      return res.status(401).json({ message: 'User not found, please log in again' });
    }

    const taskExists = user.datedTasks.some(task => task._id.toString() === taskId);
    if (!taskExists) {
      return res.status(404).json({ message: 'Task not found' });
    }

    user.datedTasks = user.datedTasks.filter(task => task._id.toString() !== taskId);
    await user.save();

    res.status(200).json({ message: 'Dated task deleted', tasks: user.datedTasks });
  } catch (error) {
    console.error('Delete Dated Task Error:', error.stack);
    res.status(500).json({ message: 'Error deleting dated task', error: error.message });
  }
});

app.post('/dates/toggle', async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: 'Please log in to update tasks' });
  }

  const { taskId } = req.body;
  if (!mongoose.Types.ObjectId.isValid(taskId)) {
    return res.status(400).json({ message: 'Invalid task ID' });
  }

  try {
    const User = require('./models/User');
    const user = await User.findById(req.session.userId);
    if (!user) {
      return res.status(401).json({ message: 'User not found, please log in again' });
    }

    const task = user.datedTasks.find(task => task._id.toString() === taskId);
    if (!task) {
      return res.status(404).json({ message: 'Dated task not found' });
    }

    task.done = !task.done;
    await user.save();

    res.status(200).json({ message: 'Dated task updated', tasks: user.datedTasks });
  } catch (error) {
    console.error('Toggle Dated Task Error:', error.stack);
    res.status(500).json({ message: 'Error updating dated task', error: error.message });
  }
});


// Reminders route
app.get('/reminders', async (req, res) => {
  console.log('Reminders route, userId:', req.session.userId);
  try {
    if (req.session.userId) {
      const User = require('./models/User');
      const user = await User.findById(req.session.userId).lean();
      if (!user) {
        console.error('User not found for userId:', req.session.userId);
        req.session.destroy();
        return res.redirect('/login.html?reminderLogin=true');
      }

      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      const tomorrowEnd = new Date(tomorrow);
      tomorrowEnd.setHours(23, 59, 59, 999);

      const dueTasks = user.datedTasks.filter(task => {
        if (!task.date) return false;
        const taskDate = new Date(task.date);
        return taskDate >= tomorrow && taskDate <= tomorrowEnd;
      });

      console.log('Tasks due tomorrow:', dueTasks);
      res.render('reminders', { user: user.name, tasks: dueTasks });
    } else {
      res.redirect('/login.html?taskLogin=true');
    }
  } catch (error) {
    console.error('Reminders route error:', error.stack);
    res.redirect('/login.html?error=server');
  }
});


//CALENDAR ROUTE
app.get('/calendar', async (req, res) => {
  
  console.log('Calendar route, userId:', req.session.userId); 

  try {
    if (req.session.userId) {
      const User = require('./models/User');
      
      
      const user = await User.findById(req.session.userId);
      
      if (!user) {
        console.error('User not found for userId:', req.session.userId);
        req.session.destroy(); 
        return res.redirect('/login.html?calendarLogin=true');
      }

     
      const currentMonthYear = getCurrentMonthYear();
      const themeText = getSavedThemeText(req);  
      const notesSection = getNotesForUser(req.session.userId);  

      
      res.render('calendar', {
        user: user.name,  
        monthYear: currentMonthYear,
        themeText: themeText,
        notesSection: notesSection
      });
    } else {
      res.redirect('/login.html?calendarLogin=true');
    }
  } catch (error) {
    console.error('Calendar route error:', error);
    res.redirect('/login.html?error=server');
  }
});

function getCurrentMonthYear() {
  const date = new Date();
  const options = { year: 'numeric', month: 'long' };
  return date.toLocaleDateString('en-US', options); 
}

function getSavedThemeText(req) {
  return req.session.theme || 'LIGHT';
}

function getNotesForUser(userId) {
  
  return "Your notes will appear here."; 
}


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));