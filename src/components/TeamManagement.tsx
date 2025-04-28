import { useState } from 'react';
import userData from '../data/users.json';
import { 
  PencilIcon, 
  TrashIcon,
  UserPlusIcon,
  AdjustmentsHorizontalIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';

export const TeamManagement = () => {
  const [selectedUser, setSelectedUser] = useState<string | null>(null);

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

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Team Management</h1>
          <p className="text-sm text-gray-500">Manage team members and their roles</p>
        </div>
        <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <UserPlusIcon className="w-5 h-5 mr-2" />
          Add Team Member
        </button>
      </div>

      {/* Role Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {Object.entries(userData.roles).map(([key, role]) => (
          <div key={key} className="bg-white rounded-lg p-4 border">
            <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mb-2 ${getRoleColor(key)}`}>
              {role.name}
            </div>
            <p className="text-sm text-gray-600">{role.description}</p>
            <div className="mt-4 text-sm text-gray-500">
              {userData.users.filter(user => user.role === key).length} members
            </div>
          </div>
        ))}
      </div>

      {/* Team Members List */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <div className="divide-y">
          {userData.users.map((user) => (
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
                    {userData.roles[user.role as keyof typeof userData.roles].name}
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
    </div>
  );
};