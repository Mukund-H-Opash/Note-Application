"use client";

import React, { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Button,
  CircularProgress,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import type { RootState, AppDispatch } from "@/redux/store";
import { fetchUsers } from "@/redux/adminSlice";
import { fetchNotes } from "@/redux/notesSlice";
import Cookies from "js-cookie";

interface User {
  _id: string;
  username: string;
  email: string;
  password: string;
  roles: string[];
  createdAt: string;
  __v: number;
}

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

const Dashboard = () => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const users = useSelector((state: RootState) => state.admin.users);
  const adminError = useSelector((state: RootState) => state.admin.error);
  const notes = useSelector((state: RootState) => state.notes.notes);
  const notesError = useSelector((state: RootState) => state.notes.error);

  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
    // Check for token in cookies to verify authentication
    const token = Cookies.get('token');
    console.log('Token in Dashboard:', token);
    if (isAuthenticated && token) {
      dispatch(fetchUsers());
      dispatch(fetchNotes());
    } else if (!token) {
      router.push("/login");
    }
  }, [dispatch, isAuthenticated, router]);

  useEffect(() => {
    if (hasMounted && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, hasMounted, router]);



  const handleNoteClick = (id: string) => {
    router.push(`/notes/${id}`);
  };

  console.log("Users in Dashboard:", users);
  console.log("Notes in Dashboard:", notes);
  console.log("Admin Error:", adminError);
  console.log("Notes Error:", notesError);

  if (!hasMounted) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex" }}>
      <Sidebar />
      <Box sx={{ flexGrow: 1, p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Admin Panel
        </Typography>

        {adminError && (
          <Typography color="error" gutterBottom>
            Admin Error: {adminError}
          </Typography>
        )}
        {notesError && (
          <Typography color="error" gutterBottom>
            Notes Error: {notesError}
          </Typography>
        )}

        <Typography variant="h6" gutterBottom>
          User Management
        </Typography>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>User</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Notes Count</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4}>No users available</TableCell>
              </TableRow>
            ) : (
              users.map((user: User) => (
                <TableRow key={user._id}>
                  <TableCell>{user.username}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    {notes.filter((note: Note) => note.userId === user._id).length}
                  </TableCell>
                </TableRow> 
              ))
            )}
          </TableBody>
        </Table>

        <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
          Note Management
        </Typography>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Note Title</TableCell>
              <TableCell>Author</TableCell>
              <TableCell>Created At</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {notes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4}>No notes available</TableCell>
              </TableRow>
            ) : (
              notes.map((note: Note) => {
                const author = users.find((user: User) => user._id === note.userId);
                return (
                  <TableRow key={note._id}>
                    <TableCell>{note.title}</TableCell>
                    <TableCell>{author ? author.username : "Unknown"}</TableCell>
                    <TableCell>
                      {new Date(note.createdAt).toISOString().split("T")[0]}
                    </TableCell>
                    <TableCell>
                      <Button onClick={() => handleNoteClick(note._id)}>View</Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </Box>
    </Box>
  );
};

export default Dashboard;