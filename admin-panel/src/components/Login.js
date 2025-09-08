import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../contexts/AuthContext';

const LoginContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
`;

const LoginCard = styled.div`
  background: white;
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
`;

const Title = styled.h1`
  text-align: center;
  color: #333;
  margin-bottom: 30px;
  font-size: 2rem;
  font-weight: 600;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.label`
  font-weight: 500;
  color: #555;
  font-size: 0.9rem;
`;

const Input = styled.input`
  padding: 12px 16px;
  border: 2px solid #e1e5e9;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: #667eea;
  }
`;

const Button = styled.button`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 14px;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-2px);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const ErrorMessage = styled.div`
  color: #dc3545;
  background: #f8d7da;
  border: 1px solid #f5c6cb;
  padding: 12px;
  border-radius: 8px;
  font-size: 0.9rem;
  text-align: center;
`;

const SuccessMessage = styled.div`
  color: #155724;
  background: #d4edda;
  border: 1px solid #c3e6cb;
  padding: 12px;
  border-radius: 8px;
  font-size: 0.9rem;
  text-align: center;
`;

const LoadingSpinner = styled.div`
  text-align: center;
  color: #666;
  font-size: 0.9rem;
`;

const RegisterLink = styled(Link)`
  color: #667eea;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s;

  &:hover {
    color: #5a67d8;
    text-decoration: underline;
  }
`;

const Login = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated, user } = useAuth();
  const hasNavigated = useRef(false);
  const isMounted = useRef(true);
  const isRedirecting = useRef(false);
  

  
  // Log current location for debugging
  console.log('Current location:', {
    protocol: window.location.protocol,
    hostname: window.location.hostname,
    href: window.location.href
  });
  
  // Clear any invalid tokens on component mount
  useEffect(() => {
    // Check if localStorage is available
    if (!window.localStorage) {
      console.warn('localStorage not available');
      return;
    }
    
    try {
      const token = localStorage.getItem('adminToken');
      if (token && (!isAuthenticated || !user)) {
        console.log('Clearing invalid token on mount');
        localStorage.removeItem('adminToken');
      }
    } catch (error) {
      console.error('Error accessing localStorage:', error);
      // If localStorage is not available, just continue
    }
  }, [isAuthenticated, user]);
  
  // Simple localStorage wrapper
  const safeLocalStorage = {
    getItem: (key) => {
      try {
        return localStorage.getItem(key);
      } catch (error) {
        console.error('localStorage.getItem error:', error);
        return null;
      }
    },
    removeItem: (key) => {
      try {
        localStorage.removeItem(key);
      } catch (error) {
        console.error('localStorage.removeItem error:', error);
      }
    }
  };
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
    // Redirect if already authenticated - DISABLED (AuthContext handles this)
  useEffect(() => {
    console.log('useEffect triggered:', { 
      isAuthenticated, 
      user: user ? { 
        id: user.id, 
        role: user.role, 
        restaurant_slug: user.restaurant_slug 
      } : null, 
      hasNavigated: hasNavigated.current, 
      isMounted: isMounted.current 
    });
    
    // AuthContext now handles the redirect, so we just log the state
    if (isAuthenticated && user && user.restaurant_slug && user.id && user.role) {
      console.log('User authenticated, AuthContext should handle redirect to:', `/${user.restaurant_slug}/admin`);
    }
  }, [isAuthenticated, user]);
  
  // Cleanup function to reset navigation flag
  useEffect(() => {
    return () => {
      hasNavigated.current = false;
      isMounted.current = false;
      isRedirecting.current = false;
      // Also clear the global redirect flag
      if (window.isRedirecting) {
        console.log('Component unmounting, clearing global redirect flag');
        window.isRedirecting = false;
      }
    };
  }, []);
  
  // Check if redirect is already in progress (after all hooks are declared)
  if (window.isRedirecting) {
    console.log('Redirect already in progress, showing loading state');
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        fontSize: '1.2rem',
        color: '#666'
      }}>
        Redirecting to admin panel...
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      const result = await login(formData);
      console.log('=== LOGIN DEBUG INFO ===');
      console.log('Full login result:', result);
      console.log('Result user data:', result.user);
      console.log('Result success:', result.success);
      console.log('Result user type:', typeof result.user);
      console.log('Result user keys:', result.user ? Object.keys(result.user) : 'No user object');
      console.log('Restaurant slug:', result.user?.restaurant_slug);
      console.log('Restaurant slug type:', typeof result.user?.restaurant_slug);
      console.log('=== END LOGIN DEBUG INFO ===');
      
      if (result.success) {
        setSuccess('Login successful! Redirecting...');
        
        // Login successful - AuthContext will handle the redirect
        console.log('Login successful, AuthContext will handle redirect');
      } else {
        setError(result.error || 'Login failed');
      }
      
    } catch (err) {
      console.error('Login failed:', err);
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <LoginContainer>
      <LoginCard>
        <Title>Restaurant Admin Login</Title>
        
        {error && <ErrorMessage>{error}</ErrorMessage>}
        {success && <SuccessMessage>{success}</SuccessMessage>}
        
        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <Label>Email</Label>
            <Input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Enter your email"
              required
            />
          </FormGroup>
          
          <FormGroup>
            <Label>Password</Label>
            <Input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Enter your password"
              required
            />
          </FormGroup>
          
          <Button type="submit" disabled={loading}>
            {loading ? <LoadingSpinner>Logging in...</LoadingSpinner> : 'Login'}
          </Button>
        </Form>
        
        <div style={{ 
          marginTop: '20px', 
          textAlign: 'center', 
          fontSize: '0.9rem', 
          color: '#666' 
        }}>
          Access your restaurant's admin panel
        </div>
        
        <div style={{ 
          marginTop: '15px', 
          textAlign: 'center', 
          fontSize: '0.9rem', 
          color: '#666' 
        }}>
          Don't have an account? <RegisterLink to="/register">Create Account</RegisterLink>
        </div>
      </LoginCard>
    </LoginContainer>
  );
};

export default Login;

