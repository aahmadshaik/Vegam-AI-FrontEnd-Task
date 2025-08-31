import React, { useState, useEffect, useMemo } from 'react';
import { User, UserApi } from '../../api';
import { UserTable, EditModal } from '../../components';
import {
  Box,
  Button,
  Typography,
  CircularProgress,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Paper,
  Collapse,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import FilterListIcon from "@mui/icons-material/FilterList";
import ClearIcon from "@mui/icons-material/Clear";
import SearchIcon from "@mui/icons-material/Search";


interface FilterState {
  searchQuery: string;
  status: 'all' | 'active' | 'inactive';
  role: string;
  department: string;
}

const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [loadingStatusId, setLoadingStatusId] = useState<number | undefined>(undefined);
  const [showFilters, setShowFilters] = useState<boolean>(false);
  
  // Filter state
  const [filters, setFilters] = useState<FilterState>({
    searchQuery: '',
    status: 'all',
    role: '',
    department: '',
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async (): Promise<void> => {
    setLoading(true);
    try {
      const res = await fetch('https://api.jsonbin.io/v3/b/68b439ac43b1c97be9320116/latest');
      const data = await res.json();
      console.log(data);
      setUsers(data.record.data.users); 
      console.log(data.record.data.users);
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setLoading(false);
    }
  };

const filterOptions = useMemo(() => {
  // Get unique roles from groups -> roles
  const roles = [
    ...new Set(
      users
        .map(user => user.groups?.[0]?.roles?.[0]?.roleName)
        .filter(Boolean)
    ),
  ];

  // Assuming department is groupName
  const departments = [
    ...new Set(users.map(user => user.groups?.[0]?.groupName).filter(Boolean)),
  ];

  return { roles, departments };
}, [users]);

// Filter users based on current filters
const filteredUsers = useMemo(() => {
  return users.filter(user => {
    // Search query filter (searches name, email, role, department)
    if (filters.searchQuery) {
      const searchLower = filters.searchQuery.toLowerCase();
      const searchableFields = [
        user.Name,
        user.Email,
        user.groups?.[0]?.roles?.[0]?.roleName,
        user.groups?.[0]?.groupName,
      ].filter(Boolean);

      const matchesSearch = searchableFields.some(field =>
        field?.toLowerCase().includes(searchLower)
      );

      if (!matchesSearch) return false;
    }

    // Status filter
    if (filters.status !== 'all' && user.Status !== filters.status) {
      return false;
    }

    // Role filter
    if (filters.role && user.groups?.[0]?.roles?.[0]?.roleName !== filters.role) {
      return false;
    }

    // Department filter
    if (filters.department && user.groups?.[0]?.groupName !== filters.department) {
      return false;
    }

    return true;
  });
}, [users, filters]);

  // Count active filters
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.searchQuery) count++;
    if (filters.status !== 'all') count++;
    if (filters.role) count++;
    if (filters.department) count++;
    return count;
  }, [filters]);

  const handleFilterChange = (key: keyof FilterState, value: string): void => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearAllFilters = (): void => {
    setFilters({
      searchQuery: '',
      status: 'all',
      role: '',
      department: '',
    });
  };

  const handleSelectUser = (id: number): void => {
    setSelectedUsers(prev => 
      prev.includes(id) 
        ? prev.filter(userId => userId !== id)
        : [...prev, id]
    );
  };

  const handleSelectAll = (selected: boolean | number[]): void => {
    if (typeof selected === 'boolean') {
      setSelectedUsers(selected ? filteredUsers.map(user => user.userId) : []);
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
      setUsers(prev =>
        prev.map(user =>
          user.userId === id ? { ...user, Status: newStatus } : user
        )
      );
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
          Users ({filteredUsers.length} of {users.length})
        </Typography>

        <Box display="flex" gap={2} alignItems="center">
          {/* Filter Toggle Button */}
          <Button
            variant="outlined"
            startIcon={<FilterListIcon />}
            onClick={() => setShowFilters(!showFilters)}
            color={activeFilterCount > 0 ? "primary" : "inherit"}
          >
            Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
          </Button>

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
      </Box>

      {/* Filter Panel */}
      <Collapse in={showFilters}>
      <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
  <Box
    display="flex"
    flexWrap="wrap"
    gap={2}
    alignItems="center"
  >
    {/* Search Query */}
    <Box flex="1 1 300px">
      <TextField
        fullWidth
        label="Search users"
        variant="outlined"
        value={filters.searchQuery}
        onChange={(e) => handleFilterChange('searchQuery', e.target.value)}
        placeholder="Search by name, email, role..."
        InputProps={{
          startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
        }}
      />
    </Box>

    {/* Status Filter */}
    <Box flex="1 1 150px">
      <FormControl fullWidth>
        <InputLabel>Status</InputLabel>
        <Select
          value={filters.status}
          label="Status"
          onChange={(e) => handleFilterChange('status', e.target.value)}
        >
          <MenuItem value="all">All Status</MenuItem>
          <MenuItem value="active">Active</MenuItem>
          <MenuItem value="inactive">Inactive</MenuItem>
        </Select>
      </FormControl>
    </Box>

    {/* Role Filter */}
    <Box flex="1 1 150px">
      <FormControl fullWidth>
        <InputLabel>Role</InputLabel>
        <Select
          value={filters.role}
          label="Role"
          onChange={(e) => handleFilterChange('role', e.target.value)}
        >
          <MenuItem value="">All Roles</MenuItem>
          {filterOptions.roles.map((role) => (
            <MenuItem key={role} value={role}>
              {role}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>

    {/* Department Filter */}
    <Box flex="1 1 150px">
      <FormControl fullWidth>
        <InputLabel>Department</InputLabel>
        <Select
          value={filters.department}
          label="Department"
          onChange={(e) => handleFilterChange('department', e.target.value)}
        >
          <MenuItem value="">All Departments</MenuItem>
          {filterOptions.departments.map((dept) => (
            <MenuItem key={dept} value={dept}>
              {dept}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>

    {/* Clear Filters Button */}
    <Box flex="1 1 150px">
      <Button
        fullWidth
        variant="outlined"
        startIcon={<ClearIcon />}
        onClick={clearAllFilters}
        disabled={activeFilterCount === 0}
      >
        Clear Filters
      </Button>
    </Box>
  </Box>

  {/* Active Filters Display */}
  {activeFilterCount > 0 && (
    <Box mt={2} display="flex" gap={1} flexWrap="wrap">
      <Typography variant="body2" color="text.secondary" sx={{ mr: 1, mt: 0.5 }}>
        Active filters:
      </Typography>

      {filters.searchQuery && (
        <Chip
          label={`Search: "${filters.searchQuery}"`}
          onDelete={() => handleFilterChange('searchQuery', '')}
          size="small"
          color="primary"
          variant="outlined"
        />
      )}

      {filters.status !== 'all' && (
        <Chip
          label={`Status: ${filters.status}`}
          onDelete={() => handleFilterChange('status', 'all')}
          size="small"
          color="primary"
          variant="outlined"
        />
      )}

      {filters.role && (
        <Chip
          label={`Role: ${filters.role}`}
          onDelete={() => handleFilterChange('role', '')}
          size="small"
          color="primary"
          variant="outlined"
        />
      )}

      {filters.department && (
        <Chip
          label={`Department: ${filters.department}`}
          onDelete={() => handleFilterChange('department', '')}
          size="small"
          color="primary"
          variant="outlined"
        />
      )}
    </Box>
  )}
</Paper>


      </Collapse>

      {/* User Table */}
      {loading ? (
        <Box display="flex" justifyContent="center" mt={5}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {filteredUsers.length === 0 && users.length > 0 ? (
            <Paper elevation={1} sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No users found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Try adjusting your filters or search query
              </Typography>
              <Button
                variant="outlined"
                startIcon={<ClearIcon />}
                onClick={clearAllFilters}
                sx={{ mt: 2 }}
              >
                Clear All Filters
              </Button>
            </Paper>
          ) : (
            <UserTable 
              users={filteredUsers} 
              selectedUsers={selectedUsers} 
              onSelectUser={handleSelectUser} 
              onSelectAll={handleSelectAll} 
              onEditUser={handleEditUser} 
              onDeleteUser={handleDeleteUser} 
              onToggleStatus={handleToggleStatus} 
              loadingStatusId={loadingStatusId} 
              loading={loading}
              rowsPerPage={10}
            />
          )}
        </>
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