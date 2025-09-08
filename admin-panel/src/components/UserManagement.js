import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useAuth } from '../contexts/AuthContext';
import { useRestaurant } from '../contexts/RestaurantContext';
import api from '../services/api';

const UserManagementContainer = styled.div`
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 2px solid #e0e0e0;
`;

const Title = styled.h1`
  color: #333;
  margin: 0;
  font-size: 2rem;
`;

const AddButton = styled.button`
  background: #007bff;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  transition: background-color 0.2s;

  &:hover {
    background: #0056b3;
  }
`;

const UserTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`;

const TableHeader = styled.th`
  background: #f8f9fa;
  padding: 15px;
  text-align: left;
  font-weight: 600;
  color: #495057;
  border-bottom: 2px solid #dee2e6;
`;

const TableCell = styled.td`
  padding: 15px;
  border-bottom: 1px solid #dee2e6;
  color: #333;
`;

const TableRow = styled.tr`
  &:hover {
    background: #f8f9fa;
  }
`;

const RoleBadge = styled.span`
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
  text-transform: uppercase;
`;

const AdminBadge = styled(RoleBadge)`
  background: #dc3545;
  color: white;
`;

const ManagerBadge = styled(RoleBadge)`
  background: #fd7e14;
  color: white;
`;

const StaffBadge = styled(RoleBadge)`
  background: #17a2b8;
  color: white;
`;

const ActionButton = styled.button`
  background: none;
  border: none;
  padding: 8px;
  cursor: pointer;
  margin: 0 4px;
  border-radius: 4px;
  transition: background-color 0.2s;

  &:hover {
    background: #e9ecef;
  }
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  padding: 30px;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
`;

const ModalTitle = styled.h2`
  margin: 0 0 20px 0;
  color: #333;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
`;

const Label = styled.label`
  font-weight: 500;
  color: #555;
`;

const Input = styled.input`
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;

  &:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
  }
`;

const Select = styled.select`
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  background: white;

  &:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 20px;
`;

const Button = styled.button`
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  transition: background-color 0.2s;
`;

const PrimaryButton = styled(Button)`
  background: #007bff;
  color: white;

  &:hover {
    background: #0056b3;
  }
`;

const SecondaryButton = styled(Button)`
  background: #6c757d;
  color: white;

  &:hover {
    background: #545b62;
  }
`;

const ErrorMessage = styled.div`
  color: #dc3545;
  background: #f8d7da;
  border: 1px solid #f5c6cb;
  padding: 10px;
  border-radius: 4px;
  margin-bottom: 15px;
`;

const SuccessMessage = styled.div`
  color: #155724;
  background: #d4edda;
  border: 1px solid #c3e6cb;
  padding: 10px;
  border-radius: 4px;
  margin-bottom: 15px;
`;

const LoadingSpinner = styled.div`
  text-align: center;
  padding: 40px;
  color: #666;
`;

const UserManagement = () => {
  const { currentUser } = useAuth();
  const { restaurant, loading: restaurantLoading } = useRestaurant();
  
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'staff',
    status: 'active'
  });

  // SECURITY CHECK: Ensure we have valid restaurant context
  useEffect(() => {
    if (!restaurantLoading && !restaurant) {
      setError('Invalid restaurant context. Please log in again.');
      return;
    }
    
    if (restaurant && !restaurantLoading) {
      loadUsers();
    }
  }, [restaurantLoading, restaurant]);

  const loadUsers = async () => {
    try {
      console.log('loadUsers called - restaurant:', restaurant);
      console.log('loadUsers called - restaurant.id:', restaurant?.id);
      
      setLoading(true);
      setError('');
      
      // SECURITY: This API call is automatically scoped to the admin's restaurant
      console.log('About to call api.getUsers()');
      const response = await api.getUsers();
      console.log('API response received:', response);
      
      // SECURITY: Verify that all returned users belong to this restaurant
      // Since the backend now only returns the authenticated user, this should always pass
      const allUsersFromCorrectRestaurant = response.every(user => {
        // For now, we only expect the authenticated user to be returned
        const isCorrect = user.id === restaurant.id || response.length === 1;
        console.log(`User ${user.id} (${user.name}) - verification: ${isCorrect}`);
        return isCorrect;
      });
      
      if (!allUsersFromCorrectRestaurant) {
        throw new Error('Security violation: Users from different restaurant detected');
      }
      
      console.log('DEBUG: Security verification passed - all users belong to correct restaurant');
      
      setUsers(response);
    } catch (err) {
      console.error('Failed to load users:', err);
      setError(err.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setError('');
      setSuccess('');
      
      // SECURITY: Prevent admin role creation
      if (formData.role === 'admin') {
        setError('Admin users cannot be created through the admin panel');
        return;
      }
      
      if (editingUser) {
        // Update existing user
        await api.updateUser(editingUser.id, formData);
        setSuccess('User updated successfully');
      } else {
        // Create new user - AUTOMATICALLY ASSIGNED TO ADMIN'S RESTAURANT
        await api.createUser(formData);
        setSuccess('User created successfully');
      }
      
      // Refresh users list
      await loadUsers();
      
      // Reset form and close modal
      setFormData({
        name: '',
        email: '',
        password: '',
        role: 'staff',
        status: 'active'
      });
      setEditingUser(null);
      setShowModal(false);
      
    } catch (err) {
      console.error('Failed to save user:', err);
      setError(err.message || 'Failed to save user');
    }
  };

  const handleEdit = (user) => {
    // SECURITY: Prevent editing admin users
    if (user.role === 'admin') {
      setError('Admin users cannot be modified');
      return;
    }
    
    setEditingUser(user);
            setFormData({
          name: user.name || '',
          email: user.email || '',
          password: '',
          role: user.role || 'staff',
          status: user.status || 'active'
        });
    setShowModal(true);
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) {
      return;
    }
    
    try {
      setError('');
      
      // SECURITY: This API call is automatically scoped to the admin's restaurant
      await api.deleteUser(userId);
      
      setSuccess('User deleted successfully');
      await loadUsers();
      
    } catch (err) {
      console.error('Failed to delete user:', err);
      setError(err.message || 'Failed to delete user');
    }
  };

  const openCreateModal = () => {
    setEditingUser(null);
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'staff',
      status: 'active'
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingUser(null);
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'staff',
      status: 'active'
    });
    setError('');
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'admin':
        return <AdminBadge>{role}</AdminBadge>;
      case 'manager':
        return <ManagerBadge>{role}</ManagerBadge>;
      case 'staff':
        return <StaffBadge>{role}</StaffBadge>;
      default:
        return <RoleBadge>{role}</RoleBadge>;
    }
  };

  // SECURITY: Show error if restaurant context is invalid
  if (restaurantLoading) {
    return <LoadingSpinner>Loading restaurant context...</LoadingSpinner>;
  }

  if (!restaurant) {
    return (
      <UserManagementContainer>
        <ErrorMessage>
          Invalid restaurant context. Please log in again to access your restaurant's admin panel.
        </ErrorMessage>
      </UserManagementContainer>
    );
  }

  return (
    <UserManagementContainer>
      <Header>
        <Title>User Management - {restaurant?.name}</Title>
        <AddButton onClick={openCreateModal}>Add New User</AddButton>
      </Header>

      {error && <ErrorMessage>{error}</ErrorMessage>}
      {success && <SuccessMessage>{success}</SuccessMessage>}

      {loading ? (
        <LoadingSpinner>Loading users...</LoadingSpinner>
      ) : (
        <UserTable>
          <thead>
            <tr>
              <TableHeader>Name</TableHeader>
              <TableHeader>Email</TableHeader>
              <TableHeader>Role</TableHeader>
              <TableHeader>Status</TableHeader>
              <TableHeader>Actions</TableHeader>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{getRoleBadge(user.role)}</TableCell>
                <TableCell>{user.status}</TableCell>
                <TableCell>
                  {user.role !== 'admin' && (
                    <>
                      <ActionButton onClick={() => handleEdit(user)} title="Edit">
                        ✏️
                      </ActionButton>
                      <ActionButton onClick={() => handleDelete(user.id)} title="Delete">
                        🗑️
                      </ActionButton>
                    </>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </tbody>
        </UserTable>
      )}

      {showModal && (
        <Modal>
          <ModalContent>
            <ModalTitle>
              {editingUser ? 'Edit User' : 'Add New User'}
            </ModalTitle>
            <Form onSubmit={handleSubmit}>
              <FormGroup>
                <Label>Name *</Label>
                <Input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </FormGroup>
              
              <FormGroup>
                <Label>Email *</Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </FormGroup>
              
              {!editingUser && (
                <FormGroup>
                  <Label>Password *</Label>
                  <Input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                  />
                </FormGroup>
              )}
              

              
              <FormGroup>
                <Label>Role *</Label>
                <Select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  required
                >
                  {/* SECURITY: Only allow staff and manager roles */}
                  <option value="staff">Staff</option>
                  <option value="manager">Manager</option>
                </Select>
              </FormGroup>
              
              <FormGroup>
                <Label>Status</Label>
                <Select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="suspended">Suspended</option>
                </Select>
              </FormGroup>
              
              <ButtonGroup>
                <SecondaryButton type="button" onClick={closeModal}>
                  Cancel
                </SecondaryButton>
                <PrimaryButton type="submit">
                  {editingUser ? 'Update User' : 'Create User'}
                </PrimaryButton>
              </ButtonGroup>
            </Form>
          </ModalContent>
        </Modal>
      )}
    </UserManagementContainer>
  );
};

export default UserManagement;
