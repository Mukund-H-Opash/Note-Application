import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { AppThunk } from './store';

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

interface NotesState {
  notes: Note[];
  loading: boolean;
  error: string | null;
}

const initialState: NotesState = {
  notes: [],
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
  },
});

export const { fetchNotesStart, fetchNotesSuccess, fetchNotesFailure } = notesSlice.actions;

export const fetchNotes = (): AppThunk => async (dispatch) => {
  dispatch(fetchNotesStart());
  try {
    const response = await fetch('http://localhost:5000/notes');
    const data = await response.json();
    dispatch(fetchNotesSuccess(data));
  } catch (error) {
    dispatch(fetchNotesFailure((error as Error).message));
  }
};

export default notesSlice.reducer;