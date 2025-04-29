import { useState } from 'react';
import { 
  PencilIcon, 
  TrashIcon,
  UserPlusIcon,
  AdjustmentsHorizontalIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';

const users = JSON.parse(localStorage.getItem('users') || '[]');
const roles = JSON.parse(localStorage.getItem('roles') || '{}');

export const TeamManagement = () => {
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [showAddUser, setShowAddUser] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: '',
    avatar: '',
  });
  const [addUserError, setAddUserError] = useState<string | null>(null);

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'PRODUCT_OWNER':
        return 'bg-purple-100 text-purple-800';
      case 'LEADERSHIP':
        return 'bg-blue-100 text-blue-800';
      case 'OEM_MEMBER':
        return 'bg-green-100 text-green-800';
      case 'TMOBILE_STAFF':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    setAddUserError(null);
    if (!newUser.name || !newUser.email || !newUser.role) {
      setAddUserError('Please fill in all fields.');
      return;
    }
    const usersList = JSON.parse(localStorage.getItem('users') || '[]');
    if (usersList.some((u: any) => u.email === newUser.email)) {
      setAddUserError('A user with this email already exists.');
      return;
    }
    const userToAdd = {
      ...newUser,
      id: crypto.randomUUID(),
      permissions: roles[newUser.role]?.permissions || {},
      avatar: newUser.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(newUser.name)}`,
    };
    localStorage.setItem('users', JSON.stringify([...usersList, userToAdd]));
    setShowAddUser(false);
    setNewUser({ name: '', email: '', role: '', avatar: '' });
    window.location.reload(); // Quick way to refresh the user list
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-blue-900">Team Management</h2>
        <button
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
          onClick={() => setShowAddUser(true)}
        >
          <UserPlusIcon className="w-5 h-5 mr-2" /> Add User
        </button>
      </div>

      {/* Role Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {Object.entries(roles).map(([key, role]) => (
          <div key={key} className="bg-white rounded-lg p-4 border">
            <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mb-2 ${getRoleColor(key)}`}>
              {role.name}
            </div>
            <p className="text-sm text-gray-600">{role.description}</p>
            <div className="mt-4 text-sm text-gray-500">
              {users.filter(user => user.role === key).length} members
            </div>
          </div>
        ))}
      </div>

      {/* Team Members List */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <div className="divide-y">
          {users.map((user) => (
            <div key={user.id} className="p-4 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <img 
                    src={user.avatar} 
                    alt={user.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">{user.name}</h3>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                    {roles && roles[user.role] ? roles[user.role].name : user.role}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={() => setSelectedUser(user.id)}
                    className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                  >
                    <AdjustmentsHorizontalIcon className="w-5 h-5" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                    <PencilIcon className="w-5 h-5" />
                  </button>
                  <button className="p-2 text-red-400 hover:text-red-600 rounded-lg hover:bg-red-50">
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Permissions Panel */}
              {selectedUser === user.id && (
                <div className="mt-4 pl-14">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                      <ShieldCheckIcon className="w-4 h-4 mr-2" />
                      Permissions
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      {Object.entries(user.permissions).map(([permission, value]) => (
                        <div key={permission} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={value}
                            readOnly
                            className="h-4 w-4 text-blue-600 rounded border-gray-300"
                          />
                          <span className="ml-2 text-sm text-gray-600">
                            {permission.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Add User Modal */}
      {showAddUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md relative">
            <button className="absolute top-3 right-3 text-gray-400 hover:text-gray-600" onClick={() => setShowAddUser(false)}>&times;</button>
            <h3 className="text-xl font-bold mb-4 text-blue-900">Add New User</h3>
            <form onSubmit={handleAddUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={newUser.name}
                  onChange={e => setNewUser(u => ({ ...u, name: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={newUser.email}
                  onChange={e => setNewUser(u => ({ ...u, email: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Role</label>
                <select
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={newUser.role}
                  onChange={e => setNewUser(u => ({ ...u, role: e.target.value }))}
                  required
                >
                  <option value="">Select a role</option>
                  {roles && Object.entries(roles).map(([key, role]) => (
                    <option key={key} value={key}>{role.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Avatar URL (optional)</label>
                <input
                  type="url"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={newUser.avatar}
                  onChange={e => setNewUser(u => ({ ...u, avatar: e.target.value }))}
                />
              </div>
              {addUserError && <div className="text-red-600 text-sm">{addUserError}</div>}
              <button
                type="submit"
                className="w-full py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
              >
                Add User
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};