
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { AppThunk } from './store';
import Cookies from 'js-cookie';
import { setIsAuthenticated } from './authSlice';

interface Note {
  _id: string;
  userId: string;
  collaborators: string[];
  title: string;
  content: string;
  tags: string[];
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
}

const initialState: NotesState = {
  notes: [],
  currentNote: null,
  collaborators: [],
  loading: false,
  error: null,
};

const notesSlice = createSlice({
  name: 'notes',
  initialState,
  reducers: {
    fetchNotesStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchNotesSuccess(state, action: PayloadAction<Note[]>) {
      state.loading = false;
      state.notes = action.payload;
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
      state.notes.push(action.payload);
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

export const fetchNotes = (): AppThunk => async (dispatch) => {
  dispatch(fetchNotesStart());
  try {
    const token = Cookies.get('token');
    // console.log('Token in fetchNotes:', token);
    if (!token) {
      dispatch(fetchNotesFailure('No token found in cookies'));
      return;
    }

    const response = await fetch('http://localhost:5000/notes', {
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
  } catch (error) {
    dispatch(deleteNoteFailure((error as Error).message));
  }
};

export default notesSlice.reducer;
