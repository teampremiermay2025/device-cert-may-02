export interface FanUserProfile {	
  name?: string;
  avatar?: string;
  fan?: string;
  fanName?: string;
  role?: string;
  index?: number;
  parent?: string;
  profileStatus?: string;
  profileEnabled?: boolean;
  status?: string;
  userType?: string;
  externalAccessID?: string;
  organizations?: string;
  creationMethod?: string;
  profileCreationDate?: string;
  firstName?: string;
  lastName?: string;
  loginId?:  string;
  loginName?: string;
  email?: string;
  registrationDate?: string;
  nickName?: string;
  stubIDCount?: string;
  romeContactRole?: string;
  requiresApproval?: boolean;
  brandingInfoType?: string;
  contactNumber?: number;  
  crossSVIDUserCreate?: boolean;  
  identityOwner?: boolean;
  additionalInfo?: boolean;
  globysMigrationIndicator?: string;
  invalidLoginAttempts?: number;
  lastActivityDate?: string;
  emailStatus?: string;
  csrUserType?: string;
  userCategoryType?: string;
  expireUserAccount?: boolean;
  optInEmailSignUpFlag?: boolean;
  showADDPReminders?: boolean;
}

export interface NodeProfile {
  id: string;
  label: string;
  name: string | boolean | number | undefined;
  editable: boolean;
}

export interface TreeNode {
  id: string;
  data: FanUserProfile;
  children: TreeNode[];
}

export interface NodeTransfer {
  node: TreeNode;
  destination: TreeNode;
  id?: string;
}

export type TransferMap = Map<string, string>;