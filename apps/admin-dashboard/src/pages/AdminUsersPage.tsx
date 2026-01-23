import React, { useState, useEffect } from 'react';
import { Users, Plus, Edit2, Trash2, Search, Filter, UserCheck, UserX, Mail, Calendar, Crown, Loader2, MoreVertical, Shield } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { cn, formatDate, formatCurrency } from '../lib/utils';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user' | 'manager';
  status: 'active' | 'inactive' | 'suspended';
  plan: 'trial' | 'professional' | 'team' | 'enterprise';
  createdAt: Date;
  lastLogin?: Date;
  totalSpent: number;
  queriesUsed: number;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      // TODO: Replace with actual API call
      const mockUsers: User[] = [
        {
          id: '1',
          email: 'admin@ainexus.com',
          name: 'Admin User',
          role: 'admin',
          status: 'active',
          plan: 'enterprise',
          createdAt: new Date('2024-01-15'),
          lastLogin: new Date(),
          totalSpent: 5000,
          queriesUsed: 15000,
        },
        {
          id: '2',
          email: 'john@company.com',
          name: 'John Doe',
          role: 'user',
          status: 'active',
          plan: 'professional',
          createdAt: new Date('2024-06-20'),
          lastLogin: new Date(Date.now() - 2 * 60 * 60 * 1000),
          totalSpent: 490,
          queriesUsed: 5420,
        },
        {
          id: '3',
          email: 'jane@startup.io',
          name: 'Jane Smith',
          role: 'manager',
          status: 'active',
          plan: 'team',
          createdAt: new Date('2024-09-10'),
          lastLogin: new Date(Date.now() - 24 * 60 * 60 * 1000),
          totalSpent: 1980,
          queriesUsed: 8900,
        },
      ];
      setUsers(mockUsers);
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      // TODO: API call
      setUsers(prev => prev.filter(u => u.id !== userId));
    } catch (error) {
      console.error('Failed to delete user:', error);
    }
  };

  const updateUserStatus = async (userId: string, status: User['status']) => {
    try {
      // TODO: API call
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, status } : u));
    } catch (error) {
      console.error('Failed to update user status:', error);
    }
  };

  const updateUserRole = async (userId: string, role: User['role']) => {
    try {
      // TODO: API call
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role } : u));
    } catch (error) {
      console.error('Failed to update user role:', error);
    }
  };

  const bulkAction = async (action: 'activate' | 'suspend' | 'delete') => {
    if (selectedUsers.size === 0) return;
    if (!confirm(`${action} ${selectedUsers.size} users?`)) return;

    try {
      // TODO: API call
      if (action === 'delete') {
        setUsers(prev => prev.filter(u => !selectedUsers.has(u.id)));
      } else {
        const status = action === 'activate' ? 'active' : 'suspended';
        setUsers(prev => prev.map(u => selectedUsers.has(u.id) ? { ...u, status } : u));
      }
      setSelectedUsers(new Set());
    } catch (error) {
      console.error('Bulk action failed:', error);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    const matchesStatus = filterStatus === 'all' || user.status === filterStatus;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const getRoleBadge = (role: string) => {
    const variants = {
      admin: 'destructive',
      manager: 'default',
      user: 'secondary',
    };
    return variants[role as keyof typeof variants] || 'secondary';
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      active: 'success',
      inactive: 'secondary',
      suspended: 'warning',
    };
    return variants[status as keyof typeof variants] || 'secondary';
  };

  const stats = {
    total: users.length,
    active: users.filter(u => u.status === 'active').length,
    suspended: users.filter(u => u.status === 'suspended').length,
    revenue: users.reduce((sum, u) => sum + u.totalSpent, 0),
  };

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-muted-foreground mt-2">
            Manage users, roles, and permissions
          </p>
        </div>
        <Button onClick={() => setShowAddModal(true)} size="lg">
          <Plus className="w-4 h-4 mr-2" />
          Add User
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold mt-1">{stats.total}</p>
              </div>
              <Users className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active</p>
                <p className="text-2xl font-bold mt-1 text-green-600">{stats.active}</p>
              </div>
              <UserCheck className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Suspended</p>
                <p className="text-2xl font-bold mt-1 text-yellow-600">{stats.suspended}</p>
              </div>
              <UserX className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold mt-1">{formatCurrency(stats.revenue)}</p>
              </div>
              <Crown className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters & Search */}
      <div className="flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
          className="px-4 py-2 border rounded-md bg-background"
        >
          <option value="all">All Roles</option>
          <option value="admin">Admin</option>
          <option value="manager">Manager</option>
          <option value="user">User</option>
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 border rounded-md bg-background"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="suspended">Suspended</option>
        </select>
        {selectedUsers.size > 0 && (
          <div className="flex gap-2 border-l pl-4">
            <Button variant="outline" size="sm" onClick={() => bulkAction('activate')}>
              Activate
            </Button>
            <Button variant="outline" size="sm" onClick={() => bulkAction('suspend')}>
              Suspend
            </Button>
            <Button variant="destructive" size="sm" onClick={() => bulkAction('delete')}>
              Delete ({selectedUsers.size})
            </Button>
          </div>
        )}
      </div>

      {/* Users Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b bg-muted/50">
                  <tr>
                    <th className="p-4 text-left">
                      <input
                        type="checkbox"
                        checked={selectedUsers.size === filteredUsers.length && filteredUsers.length > 0}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedUsers(new Set(filteredUsers.map(u => u.id)));
                          } else {
                            setSelectedUsers(new Set());
                          }
                        }}
                      />
                    </th>
                    <th className="p-4 text-left text-sm font-medium">User</th>
                    <th className="p-4 text-left text-sm font-medium">Role</th>
                    <th className="p-4 text-left text-sm font-medium">Status</th>
                    <th className="p-4 text-left text-sm font-medium">Plan</th>
                    <th className="p-4 text-left text-sm font-medium">Queries</th>
                    <th className="p-4 text-left text-sm font-medium">Revenue</th>
                    <th className="p-4 text-left text-sm font-medium">Last Login</th>
                    <th className="p-4 text-left text-sm font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-muted/50 transition-colors">
                      <td className="p-4">
                        <input
                          type="checkbox"
                          checked={selectedUsers.has(user.id)}
                          onChange={(e) => {
                            const newSelected = new Set(selectedUsers);
                            if (e.target.checked) {
                              newSelected.add(user.id);
                            } else {
                              newSelected.delete(user.id);
                            }
                            setSelectedUsers(newSelected);
                          }}
                        />
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <Users className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{user.name}</p>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <select
                          value={user.role}
                          onChange={(e) => updateUserRole(user.id, e.target.value as User['role'])}
                          className="px-2 py-1 border rounded text-sm"
                        >
                          <option value="user">User</option>
                          <option value="manager">Manager</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td className="p-4">
                        <Badge variant={getStatusBadge(user.status) as any}>
                          {user.status}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <span className="text-sm capitalize">{user.plan}</span>
                      </td>
                      <td className="p-4">
                        <span className="text-sm">{user.queriesUsed.toLocaleString()}</span>
                      </td>
                      <td className="p-4">
                        <span className="text-sm font-medium">{formatCurrency(user.totalSpent)}</span>
                      </td>
                      <td className="p-4">
                        <span className="text-sm text-muted-foreground">
                          {user.lastLogin ? formatDate(user.lastLogin) : 'Never'}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" onClick={() => setEditingUser(user)}>
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => deleteUser(user.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
