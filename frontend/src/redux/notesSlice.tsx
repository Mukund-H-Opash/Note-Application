// frontend/src/redux/notesSlice.tsx
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { AppThunk } from './store';
import Cookies from 'js-cookie';
import { setIsAuthenticated } from './authSlice';

interface Note {
  _id: string;
  userId: {
    _id: string;
    username: string;
    email: string;
  };
  collaborators: string[];
  title: string;
  content: string;
  tags: string[];
  readOnly: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface User {
  _id: string;
  username: string;
  email: string;
  password: string;
  roles: string[];
  createdAt: string;
  __v: number;
}

interface NotesState {
  notes: Note[];
  currentNote: Note | null;
  collaborators: User[];
  loading: boolean;
  error: string | null;
  // New pagination state [new]
  currentPage: number;
  totalPages: number;
  totalNotes: number;
  limit: number;
}

const initialState: NotesState = {
  notes: [],
  currentNote: null,
  collaborators: [],
  loading: false,
  error: null,
  // Initial pagination state [new]
  currentPage: 1,
  totalPages: 1,
  totalNotes: 0,
  limit: 10,
};

const notesSlice = createSlice({
  name: 'notes',
  initialState,
  reducers: {
    fetchNotesStart(state) {
      state.loading = true;
      state.error = null;
    },
    // Modified to correctly handle paginated response [modified]
    fetchNotesSuccess(state, action: PayloadAction<{ notes: Note[], currentPage: number, totalPages: number, totalNotes: number, limit: number }>) {
      state.loading = false;
      state.notes = action.payload.notes;
      state.currentPage = action.payload.currentPage;
      state.totalPages = action.payload.totalPages;
      state.totalNotes = action.payload.totalNotes;
      state.limit = action.payload.limit;
    },
    fetchNotesFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
    fetchNoteByIdStart(state) {
      state.loading = true;
      state.error = null;
      state.currentNote = null;
    },
    fetchNoteByIdSuccess(state, action: PayloadAction<Note>) {
      state.loading = false;
      state.currentNote = action.payload;
    },
    fetchNoteByIdFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
    fetchCollaboratorsStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchCollaboratorsSuccess(state, action: PayloadAction<User[]>) {
      state.loading = false;
      state.collaborators = action.payload;
    },
    fetchCollaboratorsFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
    createNoteStart(state) {
      state.loading = true;
      state.error = null;
    },
    createNoteSuccess(state, action: PayloadAction<Note>) {
      state.loading = false;
      // When a note is created, it's typically added to the start of the list on the first page
      // For accurate pagination, a full re-fetch of notes might be necessary, or
      // you can manually insert and adjust pagination metadata. For simplicity,
      // it might be better to trigger fetchNotes(1, state.limit) after creation.
      // For now, it just pushes to the local array. If paginated, this might
      // not immediately show if it falls outside the current page.
      // state.notes.push(action.payload); // This line might need review with pagination
    },
    createNoteFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
    updateNoteStart(state) {
      state.loading = true;
      state.error = null;
    },
    updateNoteSuccess(state, action: PayloadAction<Note>) {
      state.loading = false;
      const index = state.notes.findIndex((note) => note._id === action.payload._id);
      if (index !== -1) {
        state.notes[index] = action.payload;
        if (state.currentNote && state.currentNote._id === action.payload._id) {
          state.currentNote = action.payload;
        }
      }
    },
    updateNoteFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
    deleteNoteStart(state) {
      state.loading = true;
      state.error = null;
    },
    deleteNoteSuccess(state, action: PayloadAction<string>) {
      state.loading = false;
      state.notes = state.notes.filter((note) => note._id !== action.payload);
      // After delete, total notes count might decrease, requiring re-calculation of totalPages
      // It's often simplest to trigger fetchNotes(state.currentPage, state.limit) after a delete.
    },
    deleteNoteFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const {
  fetchNotesStart,
  fetchNotesSuccess,
  fetchNotesFailure,
  fetchNoteByIdStart,
  fetchNoteByIdSuccess,
  fetchNoteByIdFailure,
  fetchCollaboratorsStart,
  fetchCollaboratorsSuccess,
  fetchCollaboratorsFailure,
  createNoteStart,
  createNoteSuccess,
  createNoteFailure,
  updateNoteStart,
  updateNoteSuccess,
  updateNoteFailure,
  deleteNoteStart,
  deleteNoteSuccess,
  deleteNoteFailure,
} = notesSlice.actions;

// Modified to accept page and limit parameters [modified]
export const fetchNotes = (page: number = 1, limit: number = 10): AppThunk => async (dispatch) => {
  dispatch(fetchNotesStart());
  try {
    const token = Cookies.get('token');
    if (!token) {
      dispatch(fetchNotesFailure('No token found in cookies'));
      return;
    }

    const response = await fetch(`http://localhost:5000/notes?page=${page}&limit=${limit}`, { // Pass page and limit to API [modified]
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        const errorData = await response.json();
        dispatch(setIsAuthenticated(false));
        throw new Error('Unauthorized: Invalid or expired token');
      }
      throw new Error(`Failed to fetch notes: ${response.statusText}`);
    }

    const data = await response.json();
    dispatch(fetchNotesSuccess(data));
  } catch (error) {
    dispatch(fetchNotesFailure((error as Error).message));
  }
};

export const fetchNoteById = (id: string): AppThunk => async (dispatch) => {
  dispatch(fetchNoteByIdStart());
  try {
    const token = Cookies.get('token');
    
    if (!token) {
      dispatch(fetchNoteByIdFailure('No token found in cookies'));
      return;
    }

    const response = await fetch(`http://localhost:5000/notes/${id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        const errorData = await response.json();
        dispatch(setIsAuthenticated(false));
        throw new Error('Unauthorized: Invalid or expired token');
      }
      throw new Error(`Failed to fetch note: ${response.statusText}`);
    }

    const data = await response.json();
    dispatch(fetchNoteByIdSuccess(data));
  } catch (error) {
    dispatch(fetchNoteByIdFailure((error as Error).message));
  }
};

export const fetchCollaborators = (userIds: string[]): AppThunk => async (dispatch) => {
  dispatch(fetchCollaboratorsStart());
  try {
    const token = Cookies.get('token');
    
    if (!token) {
      dispatch(fetchCollaboratorsFailure('No token found in cookies'));
      return;
    }

    const collaborators: User[] = [];
    for (const userId of userIds) {
      const response = await fetch(`http://localhost:5000/admin/${userId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          const errorData = await response.json();
          dispatch(setIsAuthenticated(false));
          throw new Error('Unauthorized: Invalid or expired token');
        }
        throw new Error(`Failed to fetch user ${userId}: ${response.statusText}`);
      }

      const data = await response.json();
      collaborators.push(data);
    }

    dispatch(fetchCollaboratorsSuccess(collaborators));
  } catch (error) {
    dispatch(fetchCollaboratorsFailure((error as Error).message));
  }
};

export const createNote = (noteData: {
  title: string;
  content: string;
  tags: string[];
  collaborators: string[];
}): AppThunk => async (dispatch) => {
  dispatch(createNoteStart());
  try {
    const token = Cookies.get('token');
    // console.log('Token in createNote:', token);
    if (!token) {
      dispatch(createNoteFailure('No token found in cookies'));
      return;
    }

    const response = await fetch('http://localhost:5000/notes', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(noteData),
    });

    if (!response.ok) {
      if (response.status === 401) {
        const errorData = await response.json();
        dispatch(setIsAuthenticated(false));
        throw new Error('Unauthorized: Invalid or expired token');
      }
      throw new Error(`Failed to create note: ${response.statusText}`);
    }

    const data = await response.json();
    dispatch(createNoteSuccess(data));
  } catch (error) {
    dispatch(createNoteFailure((error as Error).message));
  }
};

export const updateNote = (
  id: string,
  noteData: Partial<{
    title: string;
    content: string;
    tags: string[];
    collaborators: string[];
  }>
): AppThunk => async (dispatch) => {
  dispatch(updateNoteStart());
  try {
    const token = Cookies.get('token');
    // console.log('Token in updateNote:', token);
    if (!token) {
      dispatch(updateNoteFailure('No token found in cookies'));
      return;
    }

    const response = await fetch(`http://localhost:5000/notes/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(noteData),
    });

    if (!response.ok) {
      if (response.status === 401) {
        const errorData = await response.json();
        dispatch(setIsAuthenticated(false));
        throw new Error('Unauthorized: Invalid or expired token');
      }
      throw new Error(`Failed to update note: ${response.statusText}`);
    }

    const data = await response.json();
    dispatch(updateNoteSuccess(data));
  } catch (error) {
    dispatch(updateNoteFailure((error as Error).message));
  }
};

export const deleteNote = (id: string): AppThunk => async (dispatch) => {
  dispatch(deleteNoteStart());
  try {
    const token = Cookies.get('token');
    // console.log('Token in deleteNote:', token);
    if (!token) {
      dispatch(deleteNoteFailure('No token found in cookies'));
      return;
    }

    const response = await fetch(`http://localhost:5000/notes/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        const errorData = await response.json();
        dispatch(setIsAuthenticated(false));
        throw new Error('Unauthorized: Invalid or expired token');
      }
      throw new Error(`Failed to delete note: ${response.statusText}`);
    }

    dispatch(deleteNoteSuccess(id));
    // After delete, re-fetch notes to update pagination
    dispatch(fetchNotes(initialState.currentPage, initialState.limit)); // Re-fetch current page [new]
  } catch (error) {
    dispatch(deleteNoteFailure((error as Error).message));
  }
};

export const toggleNoteReadOnly = (id: string, readOnly: boolean): AppThunk => async (dispatch) => {
  dispatch(updateNoteStart());
  try {
    const token = Cookies.get('token');
    if (!token) {
      dispatch(updateNoteFailure('No token found in cookies'));
      return;
    }

    const response = await fetch(`http://localhost:5000/notes/${id}/read-only`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ readOnly }),
    });

    if (!response.ok) {
      if (response.status === 401) {
        const errorData = await response.json();
        dispatch(setIsAuthenticated(false));
        throw new Error('Unauthorized: Invalid or expired token');
      }
      throw new Error(`Failed to toggle read-only status: ${response.statusText}`);
    }

    const data = await response.json();
    dispatch(updateNoteSuccess(data));
  } catch (error) {
    dispatch(updateNoteFailure((error as Error).message));
  }
};

export default notesSlice.reducer;