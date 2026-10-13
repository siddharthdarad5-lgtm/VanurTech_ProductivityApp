
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const API_URL = 'http://10.157.190.217:5000/api';

type User = {
  id: string;
  name: string;
  email: string;
};

type Task = {
  _id: string;
  title: string;
  description?: string;
  status: 'pending' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  category?: string;
  dueDate?: string;
};

type Expense = {
  _id: string;
  amount: number;
  category: string;
  expenseDate?: string;
  paymentMethod?: string;
  notes?: string;
};

type EventItem = {
  _id: string;
  title: string;
  description?: string;
  eventDate: string;
  location?: string;
};

type Note = {
  _id: string;
  title: string;
  content: string;
  category?: string;
  isPinned?: boolean;
  noteDate?: string;
};

type DashboardData = {
  tasks: Task[];
  recentNotes: any[];
  recentExpenses: any[];
  upcomingEvents: any[];
  statistics: {
    totalTasks: number;
    completedTasks: number;
    pendingTasks: number;
    monthlyExpenses: number;
  };
};

export default function HomeScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState('');
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [noteSearch, setNoteSearch] = useState('');
  const [selectedNoteCategory, setSelectedNoteCategory] = useState('All');
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [noteCategory, setNoteCategory] = useState('General');
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [noteLoading, setNoteLoading] = useState(false);

  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseCategory, setExpenseCategory] = useState('Food');
  const [expenseDate, setExpenseDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [expenseNotes, setExpenseNotes] = useState('');
  const [expenseSearch, setExpenseSearch] = useState('');
  const [selectedExpenseCategory, setSelectedExpenseCategory] = useState('All');
  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null);
  const [expenseLoading, setExpenseLoading] = useState(false);

  const [events, setEvents] = useState<EventItem[]>([]);
  const [eventTitle, setEventTitle] = useState('');
  const [eventDescription, setEventDescription] = useState('');
  const [eventDate, setEventDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [eventLocation, setEventLocation] = useState('');
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [eventLoading, setEventLoading] = useState(false);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('General');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [dueDate, setDueDate] = useState('');
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [taskLoading, setTaskLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const showMessage = (message: string) => {
    if (Platform.OS === 'web') {
      window.alert(message);
    } else {
      Alert.alert('SmartDay', message);
    }
  };

  const getErrorMessage = (result: any, fallback: string) => {
    return result?.message || result?.error || fallback;
  };

  // LOGIN
  const handleLogin = async () => {
    if (!email.trim() || !password) {
      showMessage('Please enter your email and password.');
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.token || !result.user) {
        throw new Error(
          getErrorMessage(result, 'Login failed. Please check your details.')
        );
      }

      setToken(result.token);
      setUser(result.user);

      await loadDashboard(result.token);
      await loadTasks(result.token);
      await loadNotes(result.token);
      await loadExpenses(result.token);
      await loadEvents(result.token);
    } catch (error: any) {
      const message = error.message || 'Unable to connect to the server.';
      setErrorMessage(message);
      showMessage(message);
    } finally {
      setLoading(false);
    }
  };

  // FETCH DASHBOARD DATA
  const loadDashboard = async (authToken = token) => {
    if (!authToken) return;

    try {
      const response = await fetch(`${API_URL}/dashboard`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(getErrorMessage(result, 'Unable to load dashboard.'));
      }

      setDashboard(result.data);
    } catch (error: any) {
      showMessage(error.message || 'Unable to load dashboard.');
    }
  };

  // FETCH TASKS
  const loadTasks = async (authToken = token) => {
    if (!authToken) return;

    try {
      const response = await fetch(`${API_URL}/tasks`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(getErrorMessage(result, 'Unable to load tasks.'));
      }

      setTasks(Array.isArray(result.data) ? result.data : []);
    } catch (error: any) {
      showMessage(error.message || 'Unable to load tasks.');
    }
  };

  // CREATE OR EDIT TASK
  const saveTask = async () => {
    if (!title.trim()) {
      showMessage('Please enter a task title.');
      return;
    }

    if (dueDate.trim()) {
      const validDate =
        /^\d{4}-\d{2}-\d{2}$/.test(dueDate) &&
        !Number.isNaN(new Date(`${dueDate}T12:00:00`).getTime());

      if (!validDate) {
        showMessage('Please enter the due date as YYYY-MM-DD.');
        return;
      }
    }

    if (!token) {
      showMessage('Please log in first.');
      return;
    }

    setTaskLoading(true);

    try {
      const isEditing = Boolean(editingTaskId);
      const taskPayload: any = {
        title: title.trim(),
        description: description.trim(),
        category: category.trim() || 'General',
        priority,
        dueDate: dueDate.trim()
          ? new Date(`${dueDate}T12:00:00`).toISOString()
          : null,
      };

      if (!isEditing) taskPayload.status = 'pending';

      const response = await fetch(
        isEditing
          ? `${API_URL}/tasks/${editingTaskId}`
          : `${API_URL}/tasks`,
        {
          method: isEditing ? 'PUT' : 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(taskPayload),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          getErrorMessage(
            result,
            isEditing ? 'Unable to update task.' : 'Unable to create task.'
          )
        );
      }

      setTitle('');
      setDescription('');
      setCategory('General');
      setPriority('medium');
      setDueDate('');
      setEditingTaskId(null);

      await loadTasks();
      await loadDashboard();

      showMessage(
        isEditing ? 'Task updated successfully!' : 'Task created successfully!'
      );
    } catch (error: any) {
      showMessage(error.message || 'Unable to save task.');
    } finally {
      setTaskLoading(false);
    }
  };

  const startEditingTask = (task: Task) => {
    setEditingTaskId(task._id);
    setTitle(task.title || '');
    setDescription(task.description || '');
    setCategory(task.category || 'General');
    setPriority(task.priority || 'medium');
    setDueDate(
      task.dueDate ? new Date(task.dueDate).toISOString().slice(0, 10) : ''
    );
    showMessage('Edit the task details in the form above, then tap Save Changes.');
  };

  const cancelEditingTask = () => {
    setEditingTaskId(null);
    setTitle('');
    setDescription('');
    setCategory('General');
    setPriority('medium');
    setDueDate('');
  };

  // UPDATE TASK STATUS
  const updateTaskStatus = async (task: Task) => {
    let nextStatus: Task['status'];

    if (task.status === 'pending') {
      nextStatus = 'in-progress';
    } else if (task.status === 'in-progress') {
      nextStatus = 'completed';
    } else {
      nextStatus = 'pending';
    }

    try {
      const response = await fetch(`${API_URL}/tasks/${task._id}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: nextStatus }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(getErrorMessage(result, 'Unable to update task.'));
      }

      await loadTasks();
      await loadDashboard();
    } catch (error: any) {
      showMessage(error.message || 'Unable to update task.');
    }
  };

  // DELETE TASK
  const deleteTask = async (task: Task) => {
    let confirmed = true;

    if (Platform.OS === 'web') {
      confirmed = window.confirm(
        `Are you sure you want to delete "${task.title}"?`
      );
    }

    if (!confirmed) return;

    try {
      const response = await fetch(`${API_URL}/tasks/${task._id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(getErrorMessage(result, 'Unable to delete task.'));
      }

      await loadTasks();
      await loadDashboard();

      showMessage('Task deleted successfully.');
    } catch (error: any) {
      showMessage(error.message || 'Unable to delete task.');
    }
  };

  // NOTES: FETCH, CREATE, EDIT, DELETE, PIN
  const loadNotes = async (authToken = token) => {
    if (!authToken) return;

    try {
      const response = await fetch(`${API_URL}/notes`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(getErrorMessage(result, 'Unable to load notes.'));
      }

      const list = Array.isArray(result.data)
        ? result.data
        : Array.isArray(result)
        ? result
        : [];

      setNotes(list);
    } catch (error: any) {
      showMessage(error.message || 'Unable to load notes.');
    }
  };

  const saveNote = async () => {
    if (!noteTitle.trim() || !noteContent.trim()) {
      showMessage('Please enter note title and content.');
      return;
    }

    setNoteLoading(true);

    try {
      const editing = Boolean(editingNoteId);
      const response = await fetch(
        editing ? `${API_URL}/notes/${editingNoteId}` : `${API_URL}/notes`,
        {
          method: editing ? 'PUT' : 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: noteTitle.trim(),
            content: noteContent.trim(),
            category: noteCategory.trim() || 'General',
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(getErrorMessage(result, 'Unable to save note.'));
      }

      setNoteTitle('');
      setNoteContent('');
      setNoteCategory('General');
      setEditingNoteId(null);

      await loadNotes();
      await loadDashboard();

      showMessage(editing ? 'Note updated successfully!' : 'Note added successfully!');
    } catch (error: any) {
      showMessage(error.message || 'Unable to save note.');
    } finally {
      setNoteLoading(false);
    }
  };

  const startEditingNote = (note: Note) => {
    setEditingNoteId(note._id);
    setNoteTitle(note.title || '');
    setNoteContent(note.content || '');
    setNoteCategory(note.category || 'General');
  };

  const cancelEditingNote = () => {
    setEditingNoteId(null);
    setNoteTitle('');
    setNoteContent('');
    setNoteCategory('General');
  };

  const deleteNote = async (note: Note) => {
    const confirmed =
      Platform.OS === 'web'
        ? window.confirm(`Delete note "${note.title}"?`)
        : true;

    if (!confirmed) return;

    try {
      const response = await fetch(`${API_URL}/notes/${note._id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(getErrorMessage(result, 'Unable to delete note.'));
      }

      await loadNotes();
      await loadDashboard();
      showMessage('Note deleted successfully.');
    } catch (error: any) {
      showMessage(error.message || 'Unable to delete note.');
    }
  };

  const toggleNotePin = async (note: Note) => {
    try {
      const response = await fetch(`${API_URL}/notes/${note._id}/pin`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(getErrorMessage(result, 'Unable to pin note.'));
      }

      await loadNotes();
      await loadDashboard();
    } catch (error: any) {
      showMessage(error.message || 'Unable to update note pin.');
    }
  };

  // EXPENSES: LOAD
  const loadExpenses = async (authToken = token) => {
    if (!authToken) return;

    try {
      const response = await fetch(`${API_URL}/expenses`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(getErrorMessage(result, 'Unable to load expenses.'));
      }

      const list = Array.isArray(result.data)
        ? result.data
        : Array.isArray(result)
        ? result
        : [];

      setExpenses(list);
    } catch (error: any) {
      showMessage(error.message || 'Unable to load expenses.');
    }
  };

  // EXPENSES: SAVE
  const saveExpense = async () => {
    const amount = Number(expenseAmount);

    if (!expenseAmount.trim() || !Number.isFinite(amount) || amount <= 0) {
      showMessage('Please enter a valid expense amount.');
      return;
    }

    setExpenseLoading(true);

    try {
      const editing = Boolean(editingExpenseId);

      const response = await fetch(
        editing
          ? `${API_URL}/expenses/${editingExpenseId}`
          : `${API_URL}/expenses`,
        {
          method: editing ? 'PUT' : 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount,
            category: expenseCategory,
            expenseDate: new Date(`${expenseDate}T12:00:00`).toISOString(),
            paymentMethod,
            notes: expenseNotes.trim(),
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(getErrorMessage(result, 'Unable to save expense.'));
      }

      clearExpenseForm();
      await loadExpenses();
      await loadDashboard();

      showMessage(
        editing
          ? 'Expense updated successfully!'
          : 'Expense added successfully!'
      );
    } catch (error: any) {
      showMessage(error.message || 'Unable to save expense.');
    } finally {
      setExpenseLoading(false);
    }
  };

  const startEditingExpense = (expense: Expense) => {
    setEditingExpenseId(expense._id);
    setExpenseAmount(String(expense.amount));
    setExpenseCategory(expense.category || 'Food');
    setExpenseDate(
      expense.expenseDate
        ? new Date(expense.expenseDate).toISOString().slice(0, 10)
        : new Date().toISOString().slice(0, 10)
    );
    setPaymentMethod(expense.paymentMethod || 'Cash');
    setExpenseNotes(expense.notes || '');
  };

  const clearExpenseForm = () => {
    setEditingExpenseId(null);
    setExpenseAmount('');
    setExpenseCategory('Food');
    setExpenseDate(new Date().toISOString().slice(0, 10));
    setPaymentMethod('Cash');
    setExpenseNotes('');
  };

  const deleteExpense = async (expense: Expense) => {
    const confirmed =
      Platform.OS === 'web'
        ? window.confirm(`Delete expense of ₹${expense.amount}?`)
        : true;

    if (!confirmed) return;

    try {
      const response = await fetch(
        `${API_URL}/expenses/${expense._id}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(getErrorMessage(result, 'Unable to delete expense.'));
      }

      await loadExpenses();
      await loadDashboard();
      showMessage('Expense deleted successfully.');
    } catch (error: any) {
      showMessage(error.message || 'Unable to delete expense.');
    }
  };

  // EVENTS: LOAD
  const loadEvents = async (authToken = token) => {
    if (!authToken) return;

    try {
      const response = await fetch(`${API_URL}/events`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(getErrorMessage(result, 'Unable to load events.'));
      }

      const list = Array.isArray(result.data)
        ? result.data
        : Array.isArray(result)
        ? result
        : [];

      setEvents(
        list.sort(
          (a: EventItem, b: EventItem) =>
            new Date(a.eventDate).getTime() -
            new Date(b.eventDate).getTime()
        )
      );
    } catch (error: any) {
      showMessage(error.message || 'Unable to load events.');
    }
  };

  // EVENTS: SAVE
  const saveEvent = async () => {
    if (!eventTitle.trim() || !eventDate.trim()) {
      showMessage('Please enter event title and date.');
      return;
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(eventDate)) {
      showMessage('Date format must be YYYY-MM-DD.');
      return;
    }

    setEventLoading(true);

    try {
      const editing = Boolean(editingEventId);

      const response = await fetch(
        editing
          ? `${API_URL}/events/${editingEventId}`
          : `${API_URL}/events`,
        {
          method: editing ? 'PUT' : 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: eventTitle.trim(),
            description: eventDescription.trim(),
            eventDate: new Date(`${eventDate}T12:00:00`).toISOString(),
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          getErrorMessage(result, 'Unable to save event.')
        );
      }

      clearEventForm();
      await loadEvents();
      await loadDashboard();

      showMessage(
        editing
          ? 'Event updated successfully!'
          : 'Event added successfully!'
      );
    } catch (error: any) {
      showMessage(error.message || 'Unable to save event.');
    } finally {
      setEventLoading(false);
    }
  };

  const startEditingEvent = (event: EventItem) => {
    setEditingEventId(event._id);
    setEventTitle(event.title || '');
    setEventDescription(event.description || '');
    setEventDate(
      event.eventDate
        ? new Date(event.eventDate).toISOString().slice(0, 10)
        : ''
    );
  };

  const clearEventForm = () => {
    setEditingEventId(null);
    setEventTitle('');
    setEventDescription('');
    setEventDate(new Date().toISOString().slice(0, 10));
    setEventLocation('');
  };

  const deleteEvent = async (event: EventItem) => {
    const confirmed =
      Platform.OS === 'web'
        ? window.confirm(`Delete event "${event.title}"?`)
        : true;

    if (!confirmed) return;

    try {
      const response = await fetch(
        `${API_URL}/events/${event._id}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(getErrorMessage(result, 'Unable to delete event.'));
      }

      await loadEvents();
      await loadDashboard();
      showMessage('Event deleted successfully.');
    } catch (error: any) {
      showMessage(error.message || 'Unable to delete event.');
    }
  };

  // DATE FORMAT
  const formatDate = (date?: string) => {
    if (!date) return 'No date set';

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return 'No date set';
    }

    return parsedDate.toLocaleDateString();
  };

  // NOTE SEARCH AND CATEGORY FILTER
  const noteCategories = [
    'All',
    ...Array.from(
      new Set(
        notes
          .map((note) => (note.category || 'General').trim())
          .filter(Boolean)
      )
    ),
  ];

  const filteredNotes = notes.filter((note) => {
    const matchesCategory =
      selectedNoteCategory === 'All' ||
      (note.category || 'General').toLowerCase() ===
        selectedNoteCategory.toLowerCase();

    const query = noteSearch.trim().toLowerCase();

    const matchesSearch =
      !query ||
      note.title.toLowerCase().includes(query) ||
      note.content.toLowerCase().includes(query);

    return matchesCategory && matchesSearch;
  });

  // EXPENSE SEARCH AND FILTER
  const expenseCategories = [
    'All',
    ...Array.from(
      new Set(
        expenses
          .map((expense) => (expense.category || 'Other').trim())
          .filter(Boolean)
      )
    ),
  ];

  const filteredExpenses = expenses.filter((expense) => {
    const matchesCategory =
      selectedExpenseCategory === 'All' ||
      expense.category?.toLowerCase() ===
        selectedExpenseCategory.toLowerCase();

    const query = expenseSearch.trim().toLowerCase();

    const matchesSearch =
      !query ||
      expense.category?.toLowerCase().includes(query) ||
      expense.notes?.toLowerCase().includes(query);

    return matchesCategory && matchesSearch;
  });

  const totalExpenses = expenses.reduce(
    (total, expense) => total + Number(expense.amount || 0),
    0
  );

  // LOGIN SCREEN
  if (!user) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.loginContainer}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.loginCard}>
            <Text style={styles.logo}>SmartDay</Text>

            <Text style={styles.subtitle}>
              Smart Productivity & Daily Management
            </Text>

            <Text style={styles.heading}>Welcome Back!</Text>

            <Text style={styles.mutedText}>
              Login to manage your day.
            </Text>

            <Text style={styles.label}>Email Address</Text>

            <TextInput
              style={styles.input}
              placeholder="Enter your email"
              placeholderTextColor="#888"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />

            <Text style={styles.label}>Password</Text>

            <TextInput
              style={styles.input}
              placeholder="Enter your password"
              placeholderTextColor="#888"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
            />

            {errorMessage ? (
              <Text style={styles.errorText}>{errorMessage}</Text>
            ) : null}

            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.primaryButtonText}>Login</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // MAIN APP SCREEN
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.logo}>SmartDay</Text>
            <Text style={styles.mutedText}>
              Your daily productivity companion
            </Text>
          </View>

        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dashboard</Text>

          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>
                {dashboard?.statistics?.totalTasks ?? tasks.length}
              </Text>
              <Text style={styles.statLabel}>Total Tasks</Text>
            </View>

            <View style={styles.statCard}>
              <Text style={styles.statNumber}>
                {dashboard?.statistics?.completedTasks ??
                  tasks.filter((task) => task.status === 'completed').length}
              </Text>
              <Text style={styles.statLabel}>Completed</Text>
            </View>

            <View style={styles.statCard}>
              <Text style={styles.statNumber}>
                {dashboard?.statistics?.pendingTasks ??
                  tasks.filter((task) => task.status === 'pending').length}
              </Text>
              <Text style={styles.statLabel}>Pending</Text>
            </View>

            <View style={styles.statCard}>
              <Text style={styles.statNumber}>
                ₹{totalExpenses.toFixed(0)}
              </Text>
              <Text style={styles.statLabel}>Expenses</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={async () => {
              await loadDashboard();
              await loadTasks();
              await loadNotes();
              await loadExpenses();
              await loadEvents();
            }}
          >
            <Text style={styles.secondaryButtonText}>Refresh Dashboard</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tasks</Text>

          <TextInput
            style={styles.input}
            placeholder="Task title"
            placeholderTextColor="#888"
            value={title}
            onChangeText={setTitle}
          />

          <TextInput
            style={styles.input}
            placeholder="Description"
            placeholderTextColor="#888"
            value={description}
            onChangeText={setDescription}
          />

          <Text style={styles.label}>Category</Text>

          <TextInput
            style={styles.input}
            value={category}
            onChangeText={setCategory}
            placeholder="Category"
            placeholderTextColor="#888"
          />

          <Text style={styles.label}>Priority</Text>

          <View style={styles.buttonRow}>
            {(['low', 'medium', 'high'] as const).map((level) => (
              <TouchableOpacity
                key={level}
                onPress={() => setPriority(level)}
                style={[
                  styles.smallButton,
                  priority === level && { backgroundColor: '#059669' },
                ]}
              >
                <Text style={styles.smallButtonText}>
                  {priority === level ? '✓ ' : ''}
                  {level.toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TextInput
            style={styles.input}
            value={dueDate}
            onChangeText={setDueDate}
            placeholder="Due date (YYYY-MM-DD)"
            placeholderTextColor="#888"
          />

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={saveTask}
            disabled={taskLoading}
          >
            {taskLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.primaryButtonText}>
                {editingTaskId ? 'Save Changes' : 'Add Task'}
              </Text>
            )}
          </TouchableOpacity>

          {editingTaskId ? (
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={cancelEditingTask}
            >
              <Text style={styles.secondaryButtonText}>Cancel Edit</Text>
            </TouchableOpacity>
          ) : null}

          {tasks.map((task) => (
            <View key={task._id} style={styles.itemCard}>
              <Text style={styles.itemTitle}>{task.title}</Text>

              {task.description ? (
                <Text style={styles.itemText}>{task.description}</Text>
              ) : null}

              <Text style={styles.itemText}>
                Priority: {task.priority}
              </Text>

              <Text style={styles.itemText}>
                Status: {task.status}
              </Text>

              <Text style={styles.itemText}>
                Due: {formatDate(task.dueDate)}
              </Text>

              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={styles.smallButton}
                  onPress={() => startEditingTask(task)}
                >
                  <Text style={styles.smallButtonText}>Edit</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.smallButton}
                  onPress={() => updateTaskStatus(task)}
                >
                  <Text style={styles.smallButtonText}>
                    {task.status === 'pending'
                      ? 'Start'
                      : task.status === 'in-progress'
                      ? 'Complete'
                      : 'Reopen'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.dangerButton}
                  onPress={() => deleteTask(task)}
                >
                  <Text style={styles.smallButtonText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        {/* NOTES SECTION */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notes</Text>

          <TextInput
            style={styles.input}
            placeholder="Note title"
            placeholderTextColor="#888"
            value={noteTitle}
            onChangeText={setNoteTitle}
          />

          <TextInput
            style={[styles.input, styles.multilineInput]}
            placeholder="Write your note..."
            placeholderTextColor="#888"
            value={noteContent}
            onChangeText={setNoteContent}
            multiline
          />

          <TextInput
            style={styles.input}
            placeholder="Category (e.g. Personal)"
            placeholderTextColor="#888"
            value={noteCategory}
            onChangeText={setNoteCategory}
          />

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={saveNote}
            disabled={noteLoading}
          >
            {noteLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.primaryButtonText}>
                {editingNoteId ? 'Save Note' : 'Add Note'}
              </Text>
            )}
          </TouchableOpacity>

          {editingNoteId ? (
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={cancelEditingNote}
            >
              <Text style={styles.secondaryButtonText}>Cancel Edit</Text>
            </TouchableOpacity>
          ) : null}

          <TextInput
            style={styles.input}
            placeholder="Search notes..."
            placeholderTextColor="#888"
            value={noteSearch}
            onChangeText={setNoteSearch}
          />

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.categoryRow}
          >
            {noteCategories.map((item) => (
              <TouchableOpacity
                key={item}
                style={[
                  styles.categoryChip,
                  selectedNoteCategory === item && styles.activeChip,
                ]}
                onPress={() => setSelectedNoteCategory(item)}
              >
                <Text
                  style={[
                    styles.categoryChipText,
                    selectedNoteCategory === item && styles.activeChipText,
                  ]}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {filteredNotes.map((note) => (
            <View key={note._id} style={styles.itemCard}>
              <Text style={styles.itemTitle}>
                {note.isPinned ? '📌 ' : ''}
                {note.title}
              </Text>

              <Text style={styles.itemText}>{note.content}</Text>

              <Text style={styles.itemText}>
                Category: {note.category || 'General'}
              </Text>

              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={styles.smallButton}
                  onPress={() => startEditingNote(note)}
                >
                  <Text style={styles.smallButtonText}>Edit</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.smallButton}
                  onPress={() => toggleNotePin(note)}
                >
                  <Text style={styles.smallButtonText}>
                    {note.isPinned ? 'Unpin' : 'Pin'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.dangerButton}
                  onPress={() => deleteNote(note)}
                >
                  <Text style={styles.smallButtonText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        {/* EXPENSES SECTION */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Expenses</Text>

          <Text style={styles.totalText}>
            Total: ₹{totalExpenses.toFixed(2)}
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Amount"
            placeholderTextColor="#888"
            value={expenseAmount}
            onChangeText={setExpenseAmount}
            keyboardType="numeric"
          />

          <TextInput
            style={styles.input}
            placeholder="Category"
            placeholderTextColor="#888"
            value={expenseCategory}
            onChangeText={setExpenseCategory}
          />

          <TextInput
            style={styles.input}
            placeholder="Date (YYYY-MM-DD)"
            placeholderTextColor="#888"
            value={expenseDate}
            onChangeText={setExpenseDate}
          />

          <TextInput
            style={styles.input}
            placeholder="Payment method"
            placeholderTextColor="#888"
            value={paymentMethod}
            onChangeText={setPaymentMethod}
          />

          <TextInput
            style={styles.input}
            placeholder="Notes (optional)"
            placeholderTextColor="#888"
            value={expenseNotes}
            onChangeText={setExpenseNotes}
          />

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={saveExpense}
            disabled={expenseLoading}
          >
            {expenseLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.primaryButtonText}>
                {editingExpenseId ? 'Save Expense' : 'Add Expense'}
              </Text>
            )}
          </TouchableOpacity>

          {editingExpenseId ? (
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={clearExpenseForm}
            >
              <Text style={styles.secondaryButtonText}>Cancel Edit</Text>
            </TouchableOpacity>
          ) : null}

          <TextInput
            style={styles.input}
            placeholder="Search expenses..."
            placeholderTextColor="#888"
            value={expenseSearch}
            onChangeText={setExpenseSearch}
          />

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.categoryRow}
          >
            {expenseCategories.map((item) => (
              <TouchableOpacity
                key={item}
                style={[
                  styles.categoryChip,
                  selectedExpenseCategory === item && styles.activeChip,
                ]}
                onPress={() => setSelectedExpenseCategory(item)}
              >
                <Text
                  style={[
                    styles.categoryChipText,
                    selectedExpenseCategory === item && styles.activeChipText,
                  ]}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {filteredExpenses.map((expense) => (
            <View key={expense._id} style={styles.itemCard}>
              <Text style={styles.itemTitle}>
                ₹{Number(expense.amount || 0).toFixed(2)}
              </Text>

              <Text style={styles.itemText}>
                Category: {expense.category}
              </Text>

              <Text style={styles.itemText}>
                Date: {formatDate(expense.expenseDate)}
              </Text>

              {expense.paymentMethod ? (
                <Text style={styles.itemText}>
                  Payment: {expense.paymentMethod}
                </Text>
              ) : null}

              {expense.notes ? (
                <Text style={styles.itemText}>{expense.notes}</Text>
              ) : null}

              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={styles.smallButton}
                  onPress={() => startEditingExpense(expense)}
                >
                  <Text style={styles.smallButtonText}>Edit</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.dangerButton}
                  onPress={() => deleteExpense(expense)}
                >
                  <Text style={styles.smallButtonText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        {/* EVENTS SECTION */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Events</Text>

          <TextInput
            style={styles.input}
            placeholder="Event title"
            placeholderTextColor="#888"
            value={eventTitle}
            onChangeText={setEventTitle}
          />

          <TextInput
            style={styles.input}
            placeholder="Description (optional)"
            placeholderTextColor="#888"
            value={eventDescription}
            onChangeText={setEventDescription}
          />

          <TextInput
            style={styles.input}
            placeholder="Date (YYYY-MM-DD)"
            placeholderTextColor="#888"
            value={eventDate}
            onChangeText={setEventDate}
          />

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={saveEvent}
            disabled={eventLoading}
          >
            {eventLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.primaryButtonText}>
                {editingEventId ? 'Save Event' : 'Add Event'}
              </Text>
            )}
          </TouchableOpacity>

          {editingEventId ? (
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={clearEventForm}
            >
              <Text style={styles.secondaryButtonText}>Cancel Edit</Text>
            </TouchableOpacity>
          ) : null}

          {events.map((event) => (
            <View key={event._id} style={styles.itemCard}>
              <Text style={styles.itemTitle}>{event.title}</Text>

              {event.description ? (
                <Text style={styles.itemText}>{event.description}</Text>
              ) : null}

              <Text style={styles.itemText}>
                Date: {formatDate(event.eventDate)}
              </Text>

              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={styles.smallButton}
                  onPress={() => startEditingEvent(event)}
                >
                  <Text style={styles.smallButtonText}>Edit</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.dangerButton}
                  onPress={() => deleteEvent(event)}
                >
                  <Text style={styles.smallButtonText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        <Text style={styles.footerText}>
          SmartDay — Plan smart, work better.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F3F6FB',
  },
  container: {
    padding: 18,
    paddingBottom: 40,
  },
  loginContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  loginCard: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderRadius: 18,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  logo: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2563EB',
  },
  subtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 6,
    marginBottom: 25,
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 8,
  },
  mutedText: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
    marginTop: 10,
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D8E0EC',
    borderRadius: 10,
    paddingHorizontal: 13,
    paddingVertical: 12,
    fontSize: 14,
    color: '#1E293B',
    marginBottom: 12,
  },
  multilineInput: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  primaryButton: {
    backgroundColor: '#2563EB',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 12,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 15,
  },
  secondaryButton: {
    backgroundColor: '#E2E8F0',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 12,
  },
  secondaryButtonText: {
    color: '#1E293B',
    fontWeight: '600',
  },
  section: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    marginBottom: 20,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 21,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  statNumber: {
    fontSize: 23,
    fontWeight: 'bold',
    color: '#2563EB',
  },
  statLabel: {
    color: '#475569',
    fontSize: 13,
    marginTop: 5,
  },
  itemCard: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 14,
    marginTop: 12,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 7,
  },
  itemText: {
    fontSize: 13,
    color: '#475569',
    marginBottom: 5,
  },
  buttonRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10,
  },
  smallButton: {
    backgroundColor: '#2563EB',
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  smallButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  dangerButton: {
    backgroundColor: '#DC2626',
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  categoryRow: {
    marginBottom: 8,
  },
  categoryChip: {
    backgroundColor: '#E2E8F0',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginRight: 8,
  },
  activeChip: {
    backgroundColor: '#2563EB',
  },
  categoryChipText: {
    color: '#334155',
    fontSize: 12,
    fontWeight: '600',
  },
  activeChipText: {
    color: '#FFFFFF',
  },
  totalText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#059669',
    marginBottom: 14,
  },
  errorText: {
    color: '#DC2626',
    marginBottom: 12,
    fontSize: 13,
  },
  footerText: {
    textAlign: 'center',
    color: '#64748B',
    fontSize: 12,
    marginVertical: 12,
  },
});
