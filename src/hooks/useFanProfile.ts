import { useState, useEffect } from 'react';
import { FanUserProfile, TreeNode } from './index';

const mockDataUrl = '/assets/data/fanProfileData.json';

export const useFanProfile = (fanId?: string) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [fanProfileData, setFanProfileData] = useState<FanUserProfile[]>([]);
  const [treeData, setTreeData] = useState<TreeNode[]>([]);
  const [usedAvatars, setUsedAvatars] = useState<string[]>([]);

  // Group data by FAN
  const groupBy = (data: any[], key: string) => {
    return data.reduce((result, item) => {
      (result[item[key]] = result[item[key]] || []).push(item);
      return result;
    }, {});
  };

  // Get avatar based on gender
  const getAvatar = (gender: string) => {
    const avatars = [
      {loc: "https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg", gender: "M"},
      {loc: "https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg", gender: "M"},
      {loc: "https://images.pexels.com/photos/712513/pexels-photo-712513.jpeg", gender: "F"},
      {loc: "https://images.pexels.com/photos/1065084/pexels-photo-1065084.jpeg", gender: "F"},
      {loc: "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg", gender: "M"},
      {loc: "https://images.pexels.com/photos/1516680/pexels-photo-1516680.jpeg", gender: "M"},
      {loc: "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg", gender: "F"}
    ];
    
    const filteredAvatars = avatars.filter(av => 
      av.gender === gender && !usedAvatars.includes(av.loc)
    );
    
    if (filteredAvatars.length > 0) {
      const avatarLoc = filteredAvatars[0].loc;
      setUsedAvatars(prev => [...prev, avatarLoc]);
      return avatarLoc;
    }
    
    return "https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg";
  };

  // Get profile status based on registration and enabled status
  const getProfileStatus = (profileStatus: string, profileEnabled?: boolean) => {
    if (profileStatus === 'REGISTERED' && profileEnabled) {
      return 'RegisteredEnabled';
    } else if (profileStatus === 'REGISTERED' && !profileEnabled) {
      return 'RegisteredDisabled';
    } else if (profileStatus !== 'REGISTERED' && profileEnabled) {
      return 'UnregisteredEnabled';
    } else if (profileStatus !== 'REGISTERED' && !profileEnabled) {
      return 'UnregisteredDisabled';
    } else {
      return 'Placeholder';
    }
  };

  // Create placeholder user data
  const addPlaceholderData = (data: FanUserProfile[], placeHolderItemId: string, parent: string, role: string) => {
    const placeHolderItem = {
      'LOGIN_ID': placeHolderItemId,
      'PARENT_ID': parent,
      'PROFILE_STATUS': 'Placeholder',
      'ROLE': role
    };
    return [...data, placeHolderItem];
  };

  // Set profile data
  const setProfileData = (fanGroup: any, isPlaceholder: boolean, placeHolderParentData?: any): FanUserProfile => {
    const fanData: FanUserProfile = {};
    fanData.role = fanGroup.ROLE;
    
    // Set index based on role
    if (fanData.role === 'TCM') {
      fanData.index = 0;
    } else if (fanData.role === 'BAN Admin') {
      fanData.index = 1;
    } else if (fanData.role === 'CRU') {
      fanData.index = 2;
    } else {
      fanData.index = 3;
    }

    if (isPlaceholder) {
      fanData.fan = placeHolderParentData.FAN;
      fanData.fanName = placeHolderParentData.FAN_NAME;
      fanData.organizations = placeHolderParentData.ORGANIZATIONS;
      fanData.name = 'Name';
      fanData.avatar = 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg';
      fanData.parent = fanGroup.PARENT_ID;      
      fanData.profileStatus = fanGroup.PROFILE_STATUS;
      fanData.status = 'Placeholder';
      fanData.loginId = fanGroup.LOGIN_ID;
    } else {
      fanData.fan = fanGroup.FAN;
      fanData.fanName = fanGroup.FAN_NAME;
      fanData.organizations = fanGroup.ORGANIZATIONS;
      fanData.name = `${fanGroup.FIRST_NAME} ${fanGroup.LAST_NAME}`;
      const avatarLocation = getAvatar(fanGroup.Gender || 'M');
      fanData.avatar = avatarLocation;
      fanData.parent = fanGroup.PARENT_ID;
      fanData.profileEnabled = true;
      fanData.profileStatus = fanGroup.PROFILE_STATUS;
      fanData.status = getProfileStatus(fanGroup.PROFILE_STATUS, fanData.profileEnabled);
      fanData.userType = fanGroup.Identity_Owner;
      fanData.externalAccessID = fanGroup.EMAIL_ADDRESS;      
      fanData.creationMethod = 'PAM';
      fanData.profileCreationDate = fanGroup.PROFILE_CREATION_DATE;
      fanData.firstName = fanGroup.FIRST_NAME;
      fanData.lastName = fanGroup.LAST_NAME;
      fanData.loginId = fanGroup.LOGIN_ID;
      fanData.loginName = fanGroup.LOGIN;
      fanData.email = fanGroup.EMAIL_ADDRESS;
      fanData.registrationDate = fanGroup.REGISTRATION_DATE;
      fanData.nickName = fanGroup.FIRST_NAME;
      fanData.stubIDCount = "";
      fanData.romeContactRole = fanGroup.Rome_Contact_Role;
      fanData.requiresApproval = fanGroup.Requires_Approval;
      fanData.brandingInfoType = '';
      fanData.contactNumber = fanGroup.PHONE_NUMBER;
      fanData.crossSVIDUserCreate = fanGroup.Cross_SVID_User_Create;
      fanData.identityOwner = fanGroup.Identity_Owner;
      fanData.additionalInfo = fanGroup.EMAIL_ADDRESS as unknown as boolean;
      fanData.globysMigrationIndicator = fanGroup.Globys_Migration_Indicator;
      fanData.invalidLoginAttempts = fanGroup.Invalid_Login_Attempts;
      fanData.lastActivityDate = fanGroup.REGISTRATION_DATE;
      fanData.emailStatus = 'valid';
      fanData.csrUserType = '';
      fanData.userCategoryType = '';
      fanData.expireUserAccount = fanGroup.Expire_User_Account;
      fanData.optInEmailSignUpFlag = fanGroup.OptInEmailSignUpFlag;
      fanData.showADDPReminders = fanGroup.Show_ADDP_Reminders;
    }
    
    return fanData;
  };

  // Convert array to tree structure
  const arrayToTree = (arr: any[]): TreeNode[] => {
    const map: { [key: string]: number } = {};
    const res: TreeNode[] = [];
    
    for (let i = 0; i < arr.length; i++) {
      map[arr[i].data.loginId] = i;
      arr[i].children = [];
    }
    
    for (let i = 0; i < arr.length; i++) {
      const node = arr[i];
      if (node.data.parent && node.data.parent !== "0") {
        if (map[node.data.parent] !== undefined) {
          arr[map[node.data.parent]].children.push(node);
        }
      } else {
        res.push(node);
      }
    }
    
    return res;
  };

  // Process the fan profile data
  const processFanProfileData = (data: any[], targetFanId?: string) => {
    let processedData = [...data];
    
    // Group by FAN
    const groupedData = groupBy(processedData, 'FAN');
    
    // If fanId is provided, filter to that fan
    if (targetFanId && groupedData[targetFanId]) {
      processedData = groupedData[targetFanId];
    } else if (Object.keys(groupedData).length > 0) {
      // Or take the first fan group
      const firstFanId = Object.keys(groupedData)[0];
      processedData = groupedData[firstFanId];
    }
    
    // Add placeholder data if only one record exists
    if (processedData.length === 1) {
      const dummyDataBanAdminID1 = (processedData[0].FAN + 'BAN Admin' + 1).replace(/\s/g, "");
      processedData = addPlaceholderData(processedData, dummyDataBanAdminID1, processedData[0].LOGIN_ID, 'BAN Admin');

      const dummyDataBanAdminID2 = (processedData[0].FAN + 'BAN Admin' + 2).replace(/\s/g, "");
      processedData = addPlaceholderData(processedData, dummyDataBanAdminID2, processedData[0].LOGIN_ID, 'BAN Admin');

      const dummyDataBanAdminID3 = (processedData[0].FAN + 'BAN Admin' + 3).replace(/\s/g, "");
      processedData = addPlaceholderData(processedData, dummyDataBanAdminID3, processedData[0].LOGIN_ID, 'BAN Admin');

      const dummyDataCRUID1 = (processedData[0].FAN + 'CRU' + 1).replace(/\s/g, "");
      processedData = addPlaceholderData(processedData, dummyDataCRUID1, dummyDataBanAdminID1, 'CRU');

      const dummyDataCRUID2 = (processedData[0].FAN + 'CRU' + 2).replace(/\s/g, "");
      processedData = addPlaceholderData(processedData, dummyDataCRUID2, dummyDataBanAdminID1, 'CRU');

      const dummyDataCRUID3 = (processedData[0].FAN + 'CRU' + 3).replace(/\s/g, "");
      processedData = addPlaceholderData(processedData, dummyDataCRUID3, dummyDataBanAdminID2, 'CRU');

      const dummyDataIRUID1 = (processedData[0].FAN + 'IRU' + 1).replace(/\s/g, "");
      processedData = addPlaceholderData(processedData, dummyDataIRUID1, dummyDataCRUID1, 'IRU');

      const dummyDataIRUID2 = (processedData[0].FAN + 'IRU' + 2).replace(/\s/g, "");
      processedData = addPlaceholderData(processedData, dummyDataIRUID2, dummyDataCRUID1, 'IRU');
    }
    
    // Map raw data to profile data
    return processedData.map((item: any) => {
      if (item.PROFILE_STATUS !== 'Placeholder') {
        return setProfileData(item, false);
      } else {
        return setProfileData(item, true, processedData[0]);
      }
    });
  };

  // Convert profile data to tree nodes
  const fanProfileDataToNode = (profiles: FanUserProfile[]) => {
    const fanProfileDataList = profiles.map(fanItem => {
      return {
        id: fanItem.loginId || '',
        data: fanItem,
        children: []
      };      
    });
    
    return arrayToTree(fanProfileDataList);
  };

  // Fetch fan profile data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Mock data
        const mockData = [
          {
            "FAN": "05576008",
            "FAN_NAME": "Test Account Group",
            "ORGANIZATIONS": "Test Corp",
            "LOGIN_ID": "user1",
            "PARENT_ID": "0",
            "PROFILE_STATUS": "REGISTERED",
            "ROLE": "TCM",
            "FIRST_NAME": "John",
            "LAST_NAME": "Smith",
            "LOGIN": "jsmith",
            "EMAIL_ADDRESS": "john.smith@example.com",
            "PROFILE_CREATION_DATE": "2025-01-15",
            "REGISTRATION_DATE": "2025-01-15",
            "PHONE_NUMBER": 1234567890,
            "Gender": "M",
            "Identity_Owner": true,
            "Rome_Contact_Role": "Primary",
            "Requires_Approval": true,
            "Cross_SVID_User_Create": false,
            "Globys_Migration_Indicator": "No",
            "Invalid_Login_Attempts": 0,
            "Expire_User_Account": false,
            "OptInEmailSignUpFlag": true,
            "Show_ADDP_Reminders": true
          }
        ];
        
        const processed = processFanProfileData(mockData, fanId || "05576008");
        setFanProfileData(processed);
        
        const treeNodes = fanProfileDataToNode(processed);
        setTreeData(treeNodes);
        
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('An unknown error occurred'));
        setLoading(false);
      }
    };

    fetchData();
  }, [fanId]);

  return { 
    loading, 
    error, 
    fanProfileData, 
    treeData, 
    setTreeData,
    getProfileStatus,
    processFanProfileData,
    fanProfileDataToNode
  };
};