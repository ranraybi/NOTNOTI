import { LocalNotifications } from '@capacitor/local-notifications';
import { Preferences } from '@capacitor/preferences';

let notes = [];
const noteInput = document.getElementById('noteInput');
const notesList = document.getElementById('notesList');
const addBtn = document.getElementById('addBtn');

async function loadNotes() {
  const { value } = await Preferences.get({ key: 'saved_notes' });
  if (value) {
    notes = JSON.parse(value);
    renderNotes();
  }
}

async function saveNotes() {
  await Preferences.set({ key: 'saved_notes', value: JSON.stringify(notes) });
}

async function createNotification(id, text) {
  await LocalNotifications.requestPermissions();
  await LocalNotifications.schedule({
    notifications: [{
      title: 'פתק',
      body: text,
      id: Math.floor(id / 1000),
      ongoing: true, // בקשה להשאיר את ההתראה קבועה
      autoCancel: false
    }]
  });
}

addBtn.addEventListener('click', async () => {
  const text = noteInput.value.trim();
  if (!text) return;

  const id = new Date().getTime();
  notes.push({ id, text });
  await saveNotes();
  await createNotification(id, text);
  
  noteInput.value = '';
  renderNotes();
});

window.deleteNote = async (id) => {
  notes = notes.filter(n => n.id !== id);
  await saveNotes();
  await LocalNotifications.cancel({ notifications: [{ id: Math.floor(id / 1000) }] });
  renderNotes();
};

function renderNotes() {
  notesList.innerHTML = '';
  notes.forEach(note => {
    const li = document.createElement('li');
    li.innerHTML = `<span>${note.text}</span> <button class="delete" onclick="deleteNote(${note.id})">מחק</button>`;
    notesList.appendChild(li);
  });
}

loadNotes();