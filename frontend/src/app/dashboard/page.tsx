"use client";

import React, { useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import { Box, Typography, Table, TableBody, TableCell, TableHead, TableRow, Button } from "@mui/material";
import { useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import type { RootState, AppDispatch } from "@/redux/store";
import { fetchUsers } from "@/redux/adminSlice";
import { fetchNotes } from "@/redux/notesSlice";

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
  const notes = useSelector((state: RootState) => state.notes.notes);

  useEffect(() => {
    // Fetch users and notes if not already fetched
    dispatch(fetchUsers());
    dispatch(fetchNotes());
  }, [dispatch]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    // Get authData from cookie
    const cookies = document.cookie.split('; ').reduce((acc, cookie) => {
      const [name, value] = cookie.split('=');
      acc[name] = value;
      return acc;
    }, {} as Record<string, string>);

    const authData = cookies['authData'] ? JSON.parse(cookies['authData']) : null;

    // Check roles from both cookie and Redux state
    const userRoles = user?.roles || (authData?.roles || []);

    if (!userRoles.includes('Admin')) {
      router.push('/notes');
    }
  }, [isAuthenticated, user, router]);

  const handleUserClick = (id: string) => {
    router.push(`/user/${id}`);
  };

  const handleNoteClick = (id: string) => {
    router.push(`/note/${id}`);
  };

  return (
    <Box sx={{ display: "flex" }}>
      <Sidebar />
      <Box sx={{ flexGrow: 1, p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Admin Panel
        </Typography>

        <Typography variant="h6" gutterBottom>
          User Management
        </Typography>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>User</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Notes Count</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user: User) => (
              <TableRow key={user._id}>
                <TableCell>{user.username}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{notes.filter((note: Note) => note.userId === user._id).length}</TableCell>
                <TableCell>
                  <Button onClick={() => handleUserClick(user._id)}>View Notes</Button>
                </TableCell>
              </TableRow>
            ))}
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
            {notes.map((note: Note) => {
              const author = users.find((user: User) => user._id === note.userId);
              return (
                <TableRow key={note._id}>
                  <TableCell>{note.title}</TableCell>
                  <TableCell>{author ? author.username : "Unknown"}</TableCell>
                  <TableCell>{new Date(note.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Button onClick={() => handleNoteClick(note._id)}>View</Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Box>
    </Box>
  );
};

export default Dashboard;