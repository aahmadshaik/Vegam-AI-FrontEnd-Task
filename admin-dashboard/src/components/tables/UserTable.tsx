import React, { useState, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
  Typography,
  Chip,
  IconButton,
  Box,
  Button,
  Paper
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  ChevronLeft,
  ChevronRight
} from "@mui/icons-material";

interface User {
role: string;
userId: number;   // coming from API
  Name: string;
  Email: string;
  Status: 'active' | 'inactive';
  CreatedAt: string;
}

interface UserTableProps {
  users: User[];
  selectedUsers: number[];
  onSelectUser: (id: number) => void;
  onSelectAll: (selected: boolean | number[]) => void;
  onEditUser: (user: User) => void;
  onDeleteUser: (id: number) => void;
  onToggleStatus: (id: number, currentStatus: 'active' | 'inactive') => void;
  loadingStatusId?: number;
  loading?: boolean;
  rowsPerPage?: number;
}

interface StatusButtonProps {
  status: 'active' | 'inactive';
  onClick: () => void;
  loading: boolean;
}

const StatusButton: React.FC<StatusButtonProps> = ({ status, onClick, loading }) => (
  <Chip
    label={status}
    color={status === 'active' ? 'success' : 'default'}
    size="small"
    onClick={onClick}
    clickable
    disabled={loading}
  />
);

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString();
};

const UserTable: React.FC<UserTableProps> = ({
  users,
  selectedUsers,
  onSelectUser,
  onSelectAll,
  onEditUser,
  onDeleteUser,
  onToggleStatus,
  loadingStatusId,
  loading = false,
  rowsPerPage = 10
}) => {
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Calculate pagination
  const totalPages = Math.ceil(users.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  
  const currentUsers = useMemo(() => {
    return users.slice(startIndex, endIndex);
  }, [users, startIndex, endIndex]);

  // Selection logic for current page
  const currentPageUserIds = currentUsers.map(user => user.userId);
  const selectedOnCurrentPage = selectedUsers.filter(id => currentPageUserIds.includes(id));
  const allSelected = currentPageUserIds.length > 0 && selectedOnCurrentPage.length === currentPageUserIds.length;
  const someSelected = selectedOnCurrentPage.length > 0 && selectedOnCurrentPage.length < currentPageUserIds.length;

  // Pagination handlers
  const handlePrevious = (): void => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  const handleNext = (): void => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };

  const handleSelectAllCurrentPage = (checked: boolean): void => {
    if (checked) {
      // Add all current page user IDs to selection
      const newSelectedUsers = [...new Set([...selectedUsers, ...currentPageUserIds])];
      onSelectAll(newSelectedUsers);
    } else {
      // Remove all current page user IDs from selection
      const newSelectedUsers = selectedUsers.filter(id => !currentPageUserIds.includes(id));
      onSelectAll(newSelectedUsers);
    }
  };

  // Reset to first page when users change
  React.useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [users.length, totalPages, currentPage]);

  return (
    <Paper elevation={2}>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  indeterminate={someSelected}
                  checked={allSelected}
                  onChange={(e) => handleSelectAllCurrentPage(e.target.checked)}
                />
              </TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Created</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <Typography>Loading...</Typography>
                </TableCell>
              </TableRow>
            ) : currentUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <Typography>No users found</Typography>
                </TableCell>
              </TableRow>
            ) : (
              currentUsers.map((user) => (
                <TableRow key={user.userId} hover>
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={selectedUsers.includes(user.userId)}
                      onChange={() => onSelectUser(user.userId)}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography fontWeight="500">{user.Name}</Typography>
                  </TableCell>
                  <TableCell>{user.Email}</TableCell>
                  <TableCell>
                    <Chip label={user.role} color="primary" size="small" />
                  </TableCell>
                  <TableCell>
                    <StatusButton
                      status={user.Status}
                      onClick={() => onToggleStatus(user.userId, user.Status)}
                      loading={loadingStatusId === user.userId}
                    />
                  </TableCell>
                  <TableCell>{formatDate(user.CreatedAt)}</TableCell>
                  <TableCell>
                    <Box display="flex" gap={1}>
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => onEditUser(user)}
                        title="Edit user"
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => onDeleteUser(user.userId)}
                        title="Delete user"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      
      {/* Pagination Controls */}
      {!loading && users.length > 0 && (
        <Box 
          display="flex" 
          justifyContent="space-between" 
          alignItems="center" 
          p={2}
          borderTop="1px solid #e0e0e0"
        >
          <Typography variant="body2" color="text.secondary">
            Showing {startIndex + 1}-{Math.min(endIndex, users.length)} of {users.length} users
          </Typography>
          
          <Box display="flex" alignItems="center" gap={1}>
            <Button
              variant="outlined"
              size="small"
              onClick={handlePrevious}
              disabled={currentPage === 1}
              startIcon={<ChevronLeft />}
            >
              Previous
            </Button>
            
            <Typography variant="body2" sx={{ mx: 2 }}>
              Page {currentPage} of {totalPages}
            </Typography>
            
            <Button
              variant="outlined"
              size="small"
              onClick={handleNext}
              disabled={currentPage === totalPages}
              endIcon={<ChevronRight />}
            >
              Next
            </Button>
          </Box>
        </Box>
      )}
    </Paper>
  );
};

export default UserTable;