import React, { useState, useEffect } from 'react';
import { FanUserProfile, NodeProfile, TreeNode } from '../types';
import { Check, X, Clipboard, MessageSquare, Mail } from 'lucide-react';

interface UserProfileSidebarProps {
  node: TreeNode | null;
  onClose: () => void;
  onUpdateNode: (nodeId: string, updatedData: Partial<FanUserProfile>) => void;
}

const UserProfileSidebar: React.FC<UserProfileSidebarProps> = ({ 
  node, 
  onClose,
  onUpdateNode
}) => {
  const [profile, setProfile] = useState<NodeProfile[]>([]);
  const [selectedProject, setSelectedProject] = useState<NodeProfile | null>(null);
  const [pendingValue, setPendingValue] = useState<string>('');
  const [showCopyMessage, setShowCopyMessage] = useState(false);
  const [showMessageInput, setShowMessageInput] = useState(false);
  const [showEmailInput, setShowEmailInput] = useState(false);
  const [registrationLink, setRegistrationLink] = useState('');

  useEffect(() => {
    if (node) {
      createProfileFields(node.data);
      if (node.data.loginId) {
        // In a real app, this would be a real application URL
        setRegistrationLink(`http://example.com/self-registration?id=${node.data.loginId}`);
      }
    }
  }, [node]);

  const createProfileFields = (userData: FanUserProfile) => {
    if (!userData) return;
    
    setProfile([
      {id:'typeOfUser', label: 'Type of user being edited', name: userData.identityOwner, editable: false},
      {id:'externalAccessID', label: 'External Access ID', name: userData.externalAccessID, editable: true},
      {id:'creationMethod', label: 'Creation Method', name: userData.creationMethod, editable: false},
      {id:'profileCreationDate', label: 'User Creation Date', name: userData.profileCreationDate, editable: false},
      {id:'firstName', label: 'First Name', name: userData.firstName, editable: true},
      {id:'lastName', label: 'Last Name', name: userData.lastName, editable: true},
      {id:'loginName', label: 'Login Name', name: userData.loginName, editable: false},
      {id:'email', label: 'Email Address', name: userData.email, editable: true},
      {id:'registrationDate', label: 'Email Verification Date', name: userData.registrationDate, editable: false},
      {id:'nickName', label: 'Nickname', name: userData.nickName, editable: true},
      {id:'stubIDCount', label: 'Stub ID Count', name: userData.stubIDCount, editable: false},
      {id:'romeContactRole', label: 'Rome Contact Role', name: userData.romeContactRole, editable: false},
      {id:'requiresApproval', label: 'Requires Approval', name: userData.requiresApproval ? 'Yes' : 'No', editable: true},
      {id:'brandingInfoType', label: 'Branding Information Type', name: userData.brandingInfoType, editable: false},
      {id:'contactNumber', label: 'Contact Number', name: userData.contactNumber, editable: true},
      {id:'crossSVIDUserCreate', label: 'Cross SVID User Create', name: userData.crossSVIDUserCreate ? 'Yes' : 'No', editable: false},
      {id:'identityOwner', label: 'Identity Owner', name: userData.identityOwner, editable: false},
      {id:'additionalInfo', label: 'Additional Info', name: userData.additionalInfo, editable: true},
      {id:'globysMigrationIndicator', label: 'Globys Migration Indicator', name: userData.globysMigrationIndicator, editable: false},
      {id:'invalidLoginAttempts', label: 'Invalid Login Attempts', name: userData.invalidLoginAttempts, editable: true},
      {id:'lastActivityDate', label: 'Last Activity Date', name: userData.lastActivityDate, editable: false},
      {id:'emailStatus', label: 'Email Status', name: userData.emailStatus, editable: false},
      {id:'csrUserType', label: 'CSR User Type', name: userData.csrUserType, editable: true},
      {id:'userCategoryType', label: 'User Category Type', name: userData.userCategoryType, editable: true},
      {id:'expireUserAccount', label: 'Expire User Account', name: userData.expireUserAccount ? 'Yes' : 'No', editable: true},
      {id:'optInEmailSignUpFlag', label: 'OptInEmailSignUpFlag', name: userData.optInEmailSignUpFlag ? 'Yes' : 'No', editable: true},
      {id:'showADDPReminders', label: 'Show ADDP Reminders', name: userData.showADDPReminders ? 'Yes' : 'No', editable: true},
    ]);
  };

  const getProfileIndicator = (status?: string): string => {
    if (!status) return '#9e9e9e';
    
    switch (status) {
      case 'RegisteredEnabled': return '#3f51b5';
      case 'RegisteredDisabled': return '#9fa8da';
      case 'UnregisteredEnabled': return '#8d6e63';
      case 'UnregisteredDisabled': return '#a8958e';
      default: return '#9e9e9e';
    }
  };

  const handleEdit = (project: NodeProfile) => {
    setSelectedProject(project);
    setPendingValue(String(project.name || ''));
  };

  const handleCancel = () => {
    setSelectedProject(null);
    setPendingValue('');
  };

  const processChanges = () => {
    if (!node || !selectedProject) return;
    
    // Create an update object for the specific field
    const updates: Partial<FanUserProfile> = {
      [selectedProject.id]: pendingValue
    };

    // Special handling for firstName and lastName which affect the name field
    if (selectedProject.id === 'firstName') {
      updates.firstName = pendingValue;
      updates.name = `${pendingValue} ${node.data.lastName || ''}`;
    } else if (selectedProject.id === 'lastName') {
      updates.lastName = pendingValue;
      updates.name = `${node.data.firstName || ''} ${pendingValue}`;
    }

    // Handle status change for placeholder users when required fields are filled
    if (node.data.status === 'Placeholder') {
      const willHaveFirstName = selectedProject.id === 'firstName' ? pendingValue : node.data.firstName;
      const willHaveLastName = selectedProject.id === 'lastName' ? pendingValue : node.data.lastName;
      const willHaveEmail = selectedProject.id === 'email' ? pendingValue : node.data.email;

      if (willHaveFirstName && willHaveLastName && willHaveEmail) {
        updates.profileStatus = 'PENDING';
        updates.profileEnabled = true;
        updates.status = 'UnregisteredEnabled';
        
        // Store registration pending info in localStorage
        localStorage.setItem('registrationPending', JSON.stringify({
          login: node.data.loginId,
          fan: node.data.fan,
          firstName: willHaveFirstName,
          lastName: willHaveLastName,
          email: willHaveEmail
        }));
      }
    }

    // Apply the updates
    onUpdateNode(node.id, updates);
    setSelectedProject(null);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(registrationLink);
    setShowCopyMessage(true);
    setShowMessageInput(false);
    setShowEmailInput(false);
    
    // Hide the message after 3 seconds
    setTimeout(() => {
      setShowCopyMessage(false);
    }, 3000);
  };

  const toggleMessageInput = () => {
    setShowMessageInput(!showMessageInput);
    setShowEmailInput(false);
    setShowCopyMessage(false);
  };

  const toggleEmailInput = () => {
    setShowEmailInput(!showEmailInput);
    setShowMessageInput(false);
    setShowCopyMessage(false);
  };

  if (!node) return null;

  return (
    <div className="fixed right-0 top-0 h-full w-[375px] bg-white shadow-lg overflow-y-auto z-50 transition-transform duration-300 ease-in-out">
      <div 
        style={{ backgroundColor: getProfileIndicator(node.data.status) }}
        className="text-center text-white py-4 relative"
      >
        <button 
          onClick={onClose}
          className="absolute right-2 top-2 text-white hover:bg-white/20 rounded-full p-1"
          aria-label="Close"
        >
          <X size={20} />
        </button>
        
        <img 
          src={node.data.avatar} 
          alt={node.data.name} 
          className="w-24 h-24 rounded-full mx-auto mb-2 object-cover"
        />
        <div className="text-lg font-medium">{node.data.name}</div>
      </div>

      <div className={`overflow-hidden ${node.data.status}`}>
        <table className="w-full border-collapse">
          <tbody>
            <tr className="border-b">
              <td className="py-2 px-4 w-1/2">Type of User</td>
              <td className="py-2 px-4">{node.data.role}</td>
            </tr>
            <tr className="border-b bg-gray-50">
              <td className="py-2 px-4">Registration Status</td>
              <td className="py-2 px-4">
                {node.data.status === 'Placeholder' ? 'None' : node.data.profileStatus}
              </td>
            </tr>
            <tr className="border-b">
              <td className="py-2 px-4">Profile Status</td>
              <td className="py-2 px-4">
                {node.data.status === 'Placeholder' ? 'None' : (node.data.profileEnabled ? 'Enabled' : 'Disabled')}
              </td>
            </tr>
            <tr className="border-b bg-gray-50">
              <td className="py-2 px-4">FAN</td>
              <td className="py-2 px-4">{node.data.fan}</td>
            </tr>
            <tr className="border-b">
              <td className="py-2 px-4">Account Group</td>
              <td className="py-2 px-4">{node.data.fanName}</td>
            </tr>
            <tr className="border-b bg-gray-50">
              <td className="py-2 px-4">Parent Organization</td>
              <td className="py-2 px-4">{node.data.organizations}</td>
            </tr>
            <tr>
              <td colSpan={2} className="p-0">
                <div className="max-h-56 overflow-y-auto">
                  {profile.map((item) => (
                    <tr key={item.id} className="border-b hover:bg-gray-100">
                      <td className="py-2 px-4 w-1/2 break-words">
                        {node.data.profileStatus !== 'REGISTERED' && 
                         ['firstName', 'lastName', 'email'].includes(item.id) && 
                          <span className="text-red-500 mr-1">*</span>
                        }
                        {item.label}
                      </td>
                      
                      {selectedProject === item ? (
                        <td className="py-2 px-4 break-words flex items-center">
                          <input
                            type="text"
                            value={pendingValue}
                            onChange={(e) => setPendingValue(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') processChanges();
                              if (e.key === 'Escape') handleCancel();
                            }}
                            className="border rounded px-2 py-1 w-32 mr-1"
                            autoFocus
                          />
                          <button 
                            onClick={processChanges}
                            className="text-green-500 hover:text-green-700 mx-1"
                          >
                            <Check size={18} />
                          </button>
                          <button 
                            onClick={handleCancel}
                            className="text-gray-500 hover:text-gray-700"
                          >
                            <X size={18} />
                          </button>
                        </td>
                      ) : (
                        <td 
                          className="py-2 px-4 break-words cursor-default"
                          onClick={() => item.editable && handleEdit(item)}
                        >
                          <span>{item.name !== undefined ? item.name : ''}</span>
                          {item.editable && (
                            <span className="inline-block ml-1 text-gray-500">
                              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline-block">
                                <path d="M12 20h9"></path>
                                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                              </svg>
                            </span>
                          )}
                        </td>
                      )}
                    </tr>
                  ))}
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Registration sharing section */}
      {node.data.profileStatus !== 'REGISTERED' && node.data.status !== 'Placeholder' && (
        <div className="p-4 border-t">
          <div className="mb-2 flex flex-wrap">
            <div className="font-medium mr-2">Registration Link:</div>
            <div className="text-blue-600 break-all">{registrationLink}</div>
          </div>
          
          <div className="flex justify-center space-x-2 mb-3">
            <button 
              onClick={copyToClipboard}
              className="flex flex-col items-center justify-center bg-gray-500 hover:bg-gray-600 text-white rounded px-3 py-2 transition-colors w-24"
            >
              <Clipboard size={20} />
              <span className="text-xs mt-1">Copy Link</span>
            </button>
            
            <button 
              onClick={toggleMessageInput}
              className="flex flex-col items-center justify-center bg-green-500 hover:bg-green-600 text-white rounded px-3 py-2 transition-colors w-24"
            >
              <MessageSquare size={20} />
              <span className="text-xs mt-1">Message Me</span>
            </button>
            
            <button 
              onClick={toggleEmailInput}
              className="flex flex-col items-center justify-center bg-orange-500 hover:bg-orange-600 text-white rounded px-3 py-2 transition-colors w-24"
            >
              <Mail size={20} />
              <span className="text-xs mt-1">Email Me</span>
            </button>
          </div>
          
          {showCopyMessage && (
            <div className="text-center text-green-600 font-medium">Link Copied!</div>
          )}
          
          {showMessageInput && (
            <div className="flex mt-2">
              <input 
                type="text"
                placeholder="Phone Number"
                className="flex-1 border rounded-l px-3 py-2"
              />
              <button className="bg-blue-500 text-white px-4 py-2 rounded-r hover:bg-blue-600 transition-colors">
                Send
              </button>
            </div>
          )}
          
          {showEmailInput && (
            <div className="flex mt-2">
              <input 
                type="email"
                placeholder="Email Address"
                className="flex-1 border rounded-l px-3 py-2"
              />
              <button className="bg-blue-500 text-white px-4 py-2 rounded-r hover:bg-blue-600 transition-colors">
                Send
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UserProfileSidebar;