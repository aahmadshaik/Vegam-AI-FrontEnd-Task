import React, { useState, useEffect } from 'react';
import { User, UserApi } from '../../api';
import { UserTable, EditModal } from '../../components';
import {
  Box,
  Button,
  Typography,
  CircularProgress,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [loadingStatusId, setLoadingStatusId] = useState<number | undefined>(undefined);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async (): Promise<void> => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:3001/users');
      const data = await res.json();
      console.log(data);
      setUsers(data.data.users); // use the API response directly
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectUser = (id: number): void => {
    setSelectedUsers(prev => 
      prev.includes(id) 
        ? prev.filter(userId => userId !== id)
        : [...prev, id]
    );
  };

  // Updated to handle both boolean and number array for pagination compatibility
  const handleSelectAll = (selected: boolean | number[]): void => {
    if (typeof selected === 'boolean') {
      setSelectedUsers(selected ? users.map(user => user.userId) : []);
    } else {
      setSelectedUsers(selected);
    }
  };

  const handleEditUser = (user: User): void => {
    setEditingUser(user);
    setIsEditModalOpen(true);
  };

  const handleSaveUser = async (updatedUser: User): Promise<void> => {
    try {
      await UserApi.updateUser(updatedUser);
      setUsers(prev => prev.map(user => 
        user.userId === updatedUser.userId ? updatedUser : user
      ));
    } catch (error) {
      console.error('Failed to update user:', error);
    }
  };

  const handleDeleteUser = async (id: number): Promise<void> => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await UserApi.deleteUser(id);
        setUsers(prev => prev.filter(user => user.userId !== id));
        setSelectedUsers(prev => prev.filter(userId => userId !== id));
      } catch (error) {
        console.error('Failed to delete user:', error);
      }
    }
  };

  const handleToggleStatus = async (id: number, currentStatus: 'active' | 'inactive'): Promise<void> => {
    const newStatus: 'active' | 'inactive' = currentStatus === 'active' ? 'inactive' : 'active';
    setLoadingStatusId(id);
    
    try {
      await UserApi.updateUserStatus(id, newStatus);
      setUsers(prev => prev.map(user => 
        user.userId === id ? { ...user, status: newStatus } : user
      ));
    } catch (error) {
      console.error('Failed to update user status:', error);
    } finally {
      setLoadingStatusId(undefined);
    }
  };

  const handleBulkDelete = async (): Promise<void> => {
    if (window.confirm(`Are you sure you want to delete ${selectedUsers.length} users?`)) {
      try {
        await Promise.all(selectedUsers.map(id => UserApi.deleteUser(id)));
        setUsers(prev => prev.filter(user => !selectedUsers.includes(user.userId)));
        setSelectedUsers([]);
      } catch (error) {
        console.error('Failed to delete users:', error);
      }
    }
  };

  return (
    <Box p={3}>
      {/* Header */}
      <Box
        mb={3}
        display="flex"
        justifyContent="space-between"
        alignItems="center"
      >
        <Typography variant="h5" fontWeight="bold" color="text.primary">
          Users ({users.length})
        </Typography>

        {selectedUsers.length > 0 && (
          <Button
            variant="contained"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={handleBulkDelete}
          >
            Delete Selected ({selectedUsers.length})
          </Button>
        )}
      </Box>

      {/* User Table */}
      {loading ? (
        <Box display="flex" justifyContent="center" mt={5}>
          <CircularProgress />
        </Box>
      ) : (
        <UserTable 
          users={users} 
          selectedUsers={selectedUsers} 
          onSelectUser={handleSelectUser} 
          onSelectAll={handleSelectAll} 
          onEditUser={handleEditUser} 
          onDeleteUser={handleDeleteUser} 
          onToggleStatus={handleToggleStatus} 
          loadingStatusId={loadingStatusId} 
          loading={loading}
          rowsPerPage={10} // Set to 10 rows per page
        />
      )}

      {/* Edit Modal */}
      {editingUser && (
        <EditModal
          user={editingUser}
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingUser(null);
          }}
          onSave={handleSaveUser}
        />
      )}
    </Box>
  );
};

export default UsersPage;